package com.skillportal.enrollment;

import com.skillportal.exception.BadRequestException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class EnrollmentServiceTest {

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long getValidBatchId() {
        return jdbcTemplate.queryForObject("SELECT id FROM batches LIMIT 1", Long.class);
    }

    private Long getValidCourseId() {
        return jdbcTemplate.queryForObject("SELECT id FROM courses LIMIT 1", Long.class);
    }

    @Test
    @DisplayName("Admin generates enrollment order: Token created, but NO student user exists yet")
    void testGenerateEnrollmentLinkDoesNotCreateStudent() {
        String testEmail = "test_applicant_" + System.currentTimeMillis() + "@skillportal.test";
        String testStudentId = "STU-APP-" + (System.currentTimeMillis() % 100000);
        Long batchId = getValidBatchId();
        Long courseId = getValidCourseId();

        EnrollmentDto.AdminEnrollmentGenerateRequest request = new EnrollmentDto.AdminEnrollmentGenerateRequest();
        request.setFullName("Aditi Rao");
        request.setEmail(testEmail);
        request.setStudentIdNumber(testStudentId);
        request.setBatchId(batchId);
        request.setCourseId(courseId);
        request.setAmountInRupees(5999.0);
        request.setPhone("+91 9988776655");
        request.setCollege("RV College of Engineering");

        EnrollmentDto.EnrollmentGenerateResponse response = enrollmentService.generateEnrollment(request, 1L);

        assertNotNull(response);
        assertNotNull(response.getEnrollmentToken());
        assertTrue(response.getPaymentLink().contains(response.getEnrollmentToken()));

        // CRITICAL CHECK 1: Enrollment record exists and is PENDING
        EnrollmentDto.StudentEnrollmentDetailResponse details = enrollmentService.getEnrollmentDetails(response.getEnrollmentToken());
        assertEquals("PENDING", details.getPaymentStatus());
        assertEquals("PENDING", details.getEnrollmentStatus());
        assertFalse(details.isPaid());
        assertEquals(5999.0, details.getAmountInRupees());

        // CRITICAL CHECK 2: User account MUST NOT exist
        Integer userCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE email = ?",
                Integer.class,
                testEmail
        );
        assertEquals(0, userCount, "User account MUST NOT be created before payment is completed!");

        // Clean up
        jdbcTemplate.update("DELETE FROM student_enrollments WHERE enrollment_token = ?", response.getEnrollmentToken());
    }

    @Test
    @DisplayName("Invalid payment signature rejected: Student account MUST NOT be created")
    void testInvalidPaymentSignatureRejectedAndNoStudentCreated() {
        String testEmail = "fraud_test_" + System.currentTimeMillis() + "@skillportal.test";
        String testStudentId = "STU-FRAUD-" + (System.currentTimeMillis() % 100000);
        Long batchId = getValidBatchId();
        Long courseId = getValidCourseId();

        EnrollmentDto.AdminEnrollmentGenerateRequest request = new EnrollmentDto.AdminEnrollmentGenerateRequest();
        request.setFullName("Fraud Test User");
        request.setEmail(testEmail);
        request.setStudentIdNumber(testStudentId);
        request.setBatchId(batchId);
        request.setCourseId(courseId);
        request.setAmountInRupees(4999.0);

        EnrollmentDto.EnrollmentGenerateResponse genRes = enrollmentService.generateEnrollment(request, 1L);
        String token = genRes.getEnrollmentToken();

        // Simulate order creation
        EnrollmentDto.RazorpayOrderCreateResponse order = enrollmentService.createRazorpayOrder(token);
        assertNotNull(order.getOrderId());

        // Attempt verification with forged / invalid signature
        EnrollmentDto.PaymentVerificationRequest fakeReq = new EnrollmentDto.PaymentVerificationRequest();
        fakeReq.setRazorpayOrderId(order.getOrderId());
        fakeReq.setRazorpayPaymentId("pay_fake_123456");
        fakeReq.setRazorpaySignature("FORGED_INVALID_SIGNATURE_abc123");

        Exception exception = assertThrows(BadRequestException.class, () -> {
            enrollmentService.verifyPaymentAndActivate(token, fakeReq);
        });

        assertTrue(exception.getMessage().contains("Payment verification failed") ||
                   exception.getMessage().contains("Security signature does not match"));

        // CRITICAL CHECK: User account MUST NOT be created
        Integer userCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE email = ?",
                Integer.class,
                testEmail
        );
        assertEquals(0, userCount, "User MUST NOT be created upon signature verification failure!");

        // Clean up
        jdbcTemplate.update("DELETE FROM student_enrollments WHERE enrollment_token = ?", token);
    }

    @Test
    @DisplayName("Verified successful payment: Creates student, activates account, QR badge, and enrolls in course")
    void testSuccessfulPaymentVerificationCreatesStudent() {
        String testEmail = "paid_student_" + System.currentTimeMillis() + "@skillportal.test";
        String testStudentId = "STU-PAID-" + (System.currentTimeMillis() % 100000);
        Long batchId = getValidBatchId();
        Long courseId = getValidCourseId();

        EnrollmentDto.AdminEnrollmentGenerateRequest request = new EnrollmentDto.AdminEnrollmentGenerateRequest();
        request.setFullName("Priya Sharma");
        request.setEmail(testEmail);
        request.setStudentIdNumber(testStudentId);
        request.setBatchId(batchId);
        request.setCourseId(courseId);
        request.setAmountInRupees(4999.0);
        request.setPhone("+91 9123456780");
        request.setCollege("PES University");

        EnrollmentDto.EnrollmentGenerateResponse genRes = enrollmentService.generateEnrollment(request, 1L);
        String token = genRes.getEnrollmentToken();

        // 1. Create Order
        EnrollmentDto.RazorpayOrderCreateResponse order = enrollmentService.createRazorpayOrder(token);
        String orderId = order.getOrderId();
        String paymentId = "pay_test_" + System.currentTimeMillis();

        // 2. Generate cryptographically valid HMAC-SHA256 signature for this test
        String validSignature = razorpayService.generateTestSignature(orderId, paymentId);

        // 3. Verify Payment
        EnrollmentDto.PaymentVerificationRequest verifyReq = new EnrollmentDto.PaymentVerificationRequest();
        verifyReq.setRazorpayOrderId(orderId);
        verifyReq.setRazorpayPaymentId(paymentId);
        verifyReq.setRazorpaySignature(validSignature);
        verifyReq.setPassword("SecureStudentPass123!");

        Map<String, Object> result = enrollmentService.verifyPaymentAndActivate(token, verifyReq);

        assertNotNull(result);
        assertEquals(true, result.get("success"));
        assertNotNull(result.get("userId"));
        assertNotNull(result.get("studentIdNumber"));

        // 4. Verify User in Database
        Map<String, Object> user = jdbcTemplate.queryForMap(
                "SELECT id, email, role, status FROM users WHERE email = ?",
                testEmail
        );
        assertEquals("ROLE_STUDENT", user.get("role"));
        assertEquals("ACTIVE", user.get("status"));
        Long userId = ((Number) user.get("id")).longValue();

        // 5. Verify Student Profile and QR Identity in Database
        Map<String, Object> student = jdbcTemplate.queryForMap(
                "SELECT id, student_id_number, qr_token, qr_status, batch_id FROM students WHERE user_id = ?",
                userId
        );
        assertEquals(testStudentId, student.get("student_id_number"));
        assertEquals("ACTIVE", student.get("qr_status"));
        assertNotNull(student.get("qr_token"));

        // 6. Verify Enrollment in course (via enrollments table)
        Integer courseEnrollmentCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM enrollments WHERE student_id = ? AND course_id = ?",
                Integer.class,
                student.get("id"),
                courseId
        );
        assertTrue(courseEnrollmentCount != null && courseEnrollmentCount >= 1, "Student must be enrolled in course");

        // 7. Verify Idempotence / Repeated call returns already active
        Map<String, Object> repeatResult = enrollmentService.verifyPaymentAndActivate(token, verifyReq);
        assertEquals(true, repeatResult.get("success"));
        assertEquals(userId, repeatResult.get("userId"));

        // Clean up created test data
        Long studentId = ((Number) student.get("id")).longValue();
        jdbcTemplate.update("DELETE FROM notifications WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM enrollments WHERE student_id = ?", studentId);
        jdbcTemplate.update("DELETE FROM student_enrollments WHERE enrollment_token = ?", token);
        jdbcTemplate.update("DELETE FROM students WHERE id = ?", studentId);
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", userId);
    }
}
