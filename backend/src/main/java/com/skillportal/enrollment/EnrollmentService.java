package com.skillportal.enrollment;

import com.skillportal.exception.BadRequestException;
import com.skillportal.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class EnrollmentService {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentService.class);

    private final EnrollmentRepository enrollmentRepository;
    private final RazorpayService razorpayService;
    private final PasswordEncoder passwordEncoder;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             RazorpayService razorpayService,
                             PasswordEncoder passwordEncoder) {
        this.enrollmentRepository = enrollmentRepository;
        this.razorpayService = razorpayService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Admin generates a secure enrollment payment link instead of directly creating the student.
     */
    @Transactional
    public EnrollmentDto.EnrollmentGenerateResponse generateEnrollment(EnrollmentDto.AdminEnrollmentGenerateRequest req, Long adminId) {
        if (req.getFullName() == null || req.getFullName().trim().length() < 3) {
            throw new BadRequestException("Full name must be at least 3 characters.");
        }
        if (req.getEmail() == null || !req.getEmail().contains("@")) {
            throw new BadRequestException("Valid email address is required.");
        }
        if (req.getStudentIdNumber() == null || req.getStudentIdNumber().isBlank()) {
            throw new BadRequestException("Student ID / Code is required.");
        }
        if (req.getBatchId() == null) {
            throw new BadRequestException("Batch selection is required.");
        }

        // Prevent duplicate students
        if (enrollmentRepository.existsUserByEmail(req.getEmail())) {
            throw new BadRequestException("A student account with this email address already exists.");
        }
        if (enrollmentRepository.existsStudentByCode(req.getStudentIdNumber())) {
            throw new BadRequestException("A student with this Student ID Code already exists.");
        }

        // Calculate amount in paise (default ₹4,999.00 = 499900 paise)
        long amountInPaise = 499900L;
        if (req.getAmountInRupees() != null && req.getAmountInRupees() > 0) {
            amountInPaise = Math.round(req.getAmountInRupees() * 100);
        }

        // Generate non-guessable, secure random enrollment token
        String token = "ENR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        String passwordHash = null;
        if (req.getPassword() != null && req.getPassword().length() >= 6) {
            passwordHash = passwordEncoder.encode(req.getPassword());
        }

        enrollmentRepository.createEnrollment(req, token, amountInPaise, adminId, passwordHash);

        EnrollmentDto.EnrollmentGenerateResponse resp = new EnrollmentDto.EnrollmentGenerateResponse();
        resp.setEnrollmentToken(token);
        resp.setPaymentLink("/enroll/" + token);
        resp.setAmountInRupees(amountInPaise / 100.0);
        resp.setStudentName(req.getFullName().trim());
        resp.setEmail(req.getEmail().trim().toLowerCase());

        Optional<EnrollmentRepository.EnrollmentRecord> recordOpt = enrollmentRepository.findByToken(token);
        recordOpt.ifPresent(record -> {
            resp.setBatchName(record.batchName);
            resp.setCourseTitle(record.courseTitle);
        });

        log.info("Admin {} generated enrollment token {} for student {}", adminId, token, req.getEmail());
        return resp;
    }

    /**
     * Public endpoint: Student opens the link to review details and fee before paying.
     */
    public EnrollmentDto.StudentEnrollmentDetailResponse getEnrollmentDetails(String token) {
        EnrollmentRepository.EnrollmentRecord record = enrollmentRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment link not found or expired."));

        EnrollmentDto.StudentEnrollmentDetailResponse resp = new EnrollmentDto.StudentEnrollmentDetailResponse();
        resp.setEnrollmentToken(record.enrollmentToken);
        resp.setFullName(record.fullName);
        resp.setEmail(record.email);
        resp.setStudentIdNumber(record.studentIdNumber);
        resp.setPhone(record.phone);
        resp.setCollege(record.college);
        resp.setBatchId(record.batchId);
        resp.setBatchName(record.batchName != null ? record.batchName : "Selected Cohort");
        resp.setCourseId(record.courseId);
        resp.setCourseTitle(record.courseTitle != null ? record.courseTitle : "Full-Stack Software Engineering");
        resp.setAmountInPaise(record.amountInPaise);
        resp.setAmountInRupees(record.amountInPaise / 100.0);
        resp.setCurrency(record.currency != null ? record.currency : "INR");
        resp.setPaymentStatus(record.paymentStatus);
        resp.setEnrollmentStatus(record.enrollmentStatus);
        resp.setRazorpayKeyId(razorpayService.getKeyId());
        resp.setPaid("PAID".equalsIgnoreCase(record.paymentStatus) || "COMPLETED".equalsIgnoreCase(record.enrollmentStatus));
        resp.setLiveGateway(razorpayService.isLiveRazorpayConfigured());

        return resp;
    }

    /**
     * Creates an order with Razorpay using the EXACT database-stored amount.
     * Never trusts any client-provided amount!
     */
    public EnrollmentDto.RazorpayOrderCreateResponse createRazorpayOrder(String token) {
        EnrollmentRepository.EnrollmentRecord record = enrollmentRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found."));

        if ("COMPLETED".equals(record.enrollmentStatus) || "PAID".equals(record.paymentStatus)) {
            throw new BadRequestException("Payment has already been completed for this enrollment.");
        }

        // Amount is strictly fetched from database record
        RazorpayService.RazorpayOrderResult orderResult = razorpayService.createOrder(
                record.amountInPaise,
                record.enrollmentToken,
                record.email,
                record.fullName
        );

        enrollmentRepository.updateRazorpayOrderId(token, orderResult.getOrderId());

        EnrollmentDto.RazorpayOrderCreateResponse resp = new EnrollmentDto.RazorpayOrderCreateResponse();
        resp.setOrderId(orderResult.getOrderId());
        resp.setLiveGateway(orderResult.isLiveGateway());
        resp.setAmount(record.amountInPaise);
        resp.setCurrency(record.currency != null ? record.currency : "INR");
        resp.setKeyId(razorpayService.getKeyId());
        resp.setStudentName(record.fullName);
        resp.setStudentEmail(record.email);
        resp.setStudentPhone(record.phone != null ? record.phone : "");
        resp.setCourseTitle(record.courseTitle != null ? record.courseTitle : "Skillex Academy Course");

        return resp;
    }

    /**
     * CRITICAL PAYMENT VERIFICATION & STUDENT ACTIVATION:
     * Verifies the cryptographic Razorpay signature.
     * ONLY upon verified signature does it create the student account!
     */
    @Transactional
    public Map<String, Object> verifyPaymentAndActivate(String token, EnrollmentDto.PaymentVerificationRequest req) {
        EnrollmentRepository.EnrollmentRecord record = enrollmentRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment record not found."));

        // Idempotency: If already paid and active, return existing userId
        if ("COMPLETED".equals(record.enrollmentStatus) && record.studentUserId != null) {
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Payment already verified. Student account is active.");
            res.put("userId", record.studentUserId);
            res.put("email", record.email);
            res.put("studentIdNumber", record.studentIdNumber);
            return res;
        }

        if (req.getRazorpayPaymentId() == null || req.getRazorpayOrderId() == null) {
            enrollmentRepository.markPaymentFailed(token, req.getRazorpayPaymentId(), "Missing payment ID or order ID");
            throw new BadRequestException("Incomplete payment details received.");
        }

        // Match orderId with database orderId if present
        if (record.razorpayOrderId != null && !record.razorpayOrderId.equals(req.getRazorpayOrderId())) {
            enrollmentRepository.markPaymentFailed(token, req.getRazorpayPaymentId(), "Order ID mismatch");
            throw new BadRequestException("Security alert: Razorpay Order ID mismatch.");
        }

        // CRYPTOGRAPHIC SERVER-SIDE SIGNATURE VERIFICATION
        boolean signatureValid = razorpayService.verifySignature(
                req.getRazorpayOrderId(),
                req.getRazorpayPaymentId(),
                req.getRazorpaySignature()
        );

        if (!signatureValid) {
            enrollmentRepository.markPaymentFailed(token, req.getRazorpayPaymentId(), "Signature verification failed");
            log.error("CRITICAL: Payment signature verification failed for token {}, paymentId {}", token, req.getRazorpayPaymentId());
            throw new BadRequestException("Payment verification failed! Security signature does not match. Student account NOT created.");
        }

        // Optional password set by student during payment checkout
        String passwordHash = null;
        if (req.getPassword() != null && req.getPassword().length() >= 6) {
            passwordHash = passwordEncoder.encode(req.getPassword());
        }

        // ONLY AFTER VERIFIED PAYMENT: Activate Student
        Long userId = enrollmentRepository.markPaymentSuccessAndActivate(
                record,
                req.getRazorpayPaymentId(),
                req.getRazorpaySignature(),
                passwordHash
        );

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Payment verified successfully! Student account activated.");
        res.put("userId", userId);
        res.put("email", record.email);
        res.put("fullName", record.fullName);
        res.put("studentIdNumber", record.studentIdNumber);
        res.put("batchName", record.batchName);
        res.put("courseTitle", record.courseTitle);
        res.put("paymentId", req.getRazorpayPaymentId());

        return res;
    }

    /**
     * Webhook confirmation from Razorpay.
     */
    @Transactional
    public void processWebhook(String payload, String signature) {
        if (!razorpayService.verifyWebhookSignature(payload, signature)) {
            log.warn("Unauthorized webhook attempt rejected.");
            throw new BadRequestException("Invalid webhook signature");
        }

        try {
            // Simple json parse for payment.captured or order.paid
            if (payload.contains("\"event\":\"payment.captured\"") || payload.contains("\"event\":\"order.paid\"")) {
                // Find orderId in payload
                int orderIdx = payload.indexOf("\"order_id\":\"");
                if (orderIdx != -1) {
                    int start = orderIdx + 12;
                    int end = payload.indexOf("\"", start);
                    if (end != -1) {
                        String orderId = payload.substring(start, end);
                        Optional<EnrollmentRepository.EnrollmentRecord> recordOpt = enrollmentRepository.findByOrderId(orderId);
                        if (recordOpt.isPresent()) {
                            EnrollmentRepository.EnrollmentRecord record = recordOpt.get();
                            if (!"COMPLETED".equals(record.enrollmentStatus)) {
                                enrollmentRepository.markPaymentSuccessAndActivate(record, "webhook_captured", "webhook_verified", null);
                                log.info("Webhook successfully processed and activated enrollment for orderId: {}", orderId);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage());
        }
    }

    public List<EnrollmentDto.EnrollmentAdminItem> listEnrollmentsForAdmin(String search, String status, Long batchId) {
        return enrollmentRepository.findAllForAdmin(search, status, batchId);
    }

    @Transactional
    public Map<String, Object> updateCredentials(String token, EnrollmentDto.UpdateCredentialsRequest req) {
        EnrollmentRepository.EnrollmentRecord record = enrollmentRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment record not found."));

        if (!"COMPLETED".equals(record.enrollmentStatus) || record.studentUserId == null) {
            throw new BadRequestException("Credentials can only be updated after payment is verified.");
        }

        String newEmail = null;
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            String cleanEmail = req.getEmail().trim().toLowerCase();
            if (!cleanEmail.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")) {
                throw new BadRequestException("Please enter a valid Gmail / email address.");
            }
            Long existingUserId = enrollmentRepository.findUserIdByEmail(cleanEmail);
            if (existingUserId != null && !existingUserId.equals(record.studentUserId)) {
                throw new BadRequestException("This Gmail / email address is already registered to another account.");
            }
            newEmail = cleanEmail;
        }

        String passwordHash = null;
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            if (req.getPassword().trim().length() < 6) {
                throw new BadRequestException("Password must be at least 6 characters long.");
            }
            passwordHash = passwordEncoder.encode(req.getPassword().trim());
        }

        if (newEmail == null && passwordHash == null) {
            throw new BadRequestException("Please provide a valid Gmail or password to update.");
        }

        enrollmentRepository.updateStudentCredentials(record.studentUserId, token, newEmail, passwordHash);

        log.info("Student credentials updated for userId: {}, token: {}", record.studentUserId, token);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Login credentials updated successfully.");
        res.put("email", newEmail != null ? newEmail : record.email);
        res.put("userId", record.studentUserId);
        return res;
    }
}
