package com.skillportal.enrollment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class EnrollmentRepository {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentRepository.class);
    private final JdbcTemplate jdbcTemplate;

    public EnrollmentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean existsUserByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email.trim().toLowerCase());
        return count != null && count > 0;
    }

    public boolean existsStudentByCode(String code) {
        String sql = "SELECT COUNT(*) FROM students WHERE LOWER(student_id_number) = LOWER(?)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, code.trim().toLowerCase());
        return count != null && count > 0;
    }

    public Long createEnrollment(EnrollmentDto.AdminEnrollmentGenerateRequest req, String token, Long amountInPaise, Long adminId, String passwordHash) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO student_enrollments (enrollment_token, full_name, email, student_id_number, phone, college, " +
                    "semester_or_year, batch_id, course_id, amount_in_paise, currency, payment_status, enrollment_status, " +
                    "created_by_admin_id, password_hash) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'PENDING', 'PENDING', ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, token);
            ps.setString(2, req.getFullName().trim());
            ps.setString(3, req.getEmail().trim().toLowerCase());
            ps.setString(4, req.getStudentIdNumber().trim().toUpperCase());
            ps.setString(5, req.getPhone() != null ? req.getPhone().trim() : null);
            ps.setString(6, req.getCollege() != null ? req.getCollege().trim() : null);
            ps.setString(7, req.getSemesterOrYear() != null ? req.getSemesterOrYear().trim() : null);
            ps.setLong(8, req.getBatchId());
            if (req.getCourseId() != null) {
                ps.setLong(9, req.getCourseId());
            } else {
                ps.setNull(9, java.sql.Types.BIGINT);
            }
            ps.setLong(10, amountInPaise);
            if (adminId != null) {
                ps.setLong(11, adminId);
            } else {
                ps.setNull(11, java.sql.Types.BIGINT);
            }
            ps.setString(12, passwordHash);
            return ps;
        }, keyHolder);

        return Objects.requireNonNull(keyHolder.getKey()).longValue();
    }

    public Optional<EnrollmentRecord> findByToken(String token) {
        String sql = "SELECT e.*, b.name AS batch_name, b.code AS batch_code, c.title AS course_title " +
                     "FROM student_enrollments e " +
                     "LEFT JOIN batches b ON e.batch_id = b.id " +
                     "LEFT JOIN courses c ON e.course_id = c.id " +
                     "WHERE e.enrollment_token = ?";
        try {
            EnrollmentRecord record = jdbcTemplate.queryForObject(sql, enrollmentRowMapper, token);
            return Optional.ofNullable(record);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<EnrollmentRecord> findByOrderId(String orderId) {
        String sql = "SELECT e.*, b.name AS batch_name, b.code AS batch_code, c.title AS course_title " +
                     "FROM student_enrollments e " +
                     "LEFT JOIN batches b ON e.batch_id = b.id " +
                     "LEFT JOIN courses c ON e.course_id = c.id " +
                     "WHERE e.razorpay_order_id = ?";
        try {
            EnrollmentRecord record = jdbcTemplate.queryForObject(sql, enrollmentRowMapper, orderId);
            return Optional.ofNullable(record);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void updateRazorpayOrderId(String token, String orderId) {
        jdbcTemplate.update("UPDATE student_enrollments SET razorpay_order_id = ? WHERE enrollment_token = ?",
                orderId, token);
    }

    public void markPaymentFailed(String token, String paymentId, String reason) {
        jdbcTemplate.update("UPDATE student_enrollments SET payment_status = 'FAILED', razorpay_payment_id = ? " +
                            "WHERE enrollment_token = ? AND enrollment_status != 'COMPLETED'",
                paymentId, token);
    }

    /**
     * CRITICAL ATOMIC TRANSACTION:
     * ONLY executed upon verified successful payment!
     * Creates User, Student with QR identity, Course enrollment, updates student_enrollments, and sends welcome notification.
     */
    @Transactional
    public Long markPaymentSuccessAndActivate(EnrollmentRecord record, String paymentId, String signature, String passwordHash) {
        // Guard against duplicate execution (Idempotency)
        if ("COMPLETED".equals(record.enrollmentStatus) && record.studentUserId != null) {
            log.info("Enrollment token {} already activated with userId {}", record.enrollmentToken, record.studentUserId);
            return record.studentUserId;
        }

        // 1. Create or retrieve User
        Long userId;
        try {
            userId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE LOWER(email) = LOWER(?)",
                    Long.class, record.email.trim().toLowerCase());
        } catch (EmptyResultDataAccessException e) {
            userId = null;
        }

        if (userId == null) {
            String finalPasswordHash = passwordHash != null && !passwordHash.isBlank()
                    ? passwordHash
                    : (record.passwordHash != null ? record.passwordHash : "$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/kC36.P5f9G64y19pP4t1.2Y341.");

            KeyHolder userKeyHolder = new GeneratedKeyHolder();
            final String fPassHash = finalPasswordHash;
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                        "INSERT INTO users (email, password_hash, full_name, role, status) VALUES (?, ?, ?, 'ROLE_STUDENT', 'ACTIVE')",
                        Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, record.email.trim().toLowerCase());
                ps.setString(2, fPassHash);
                ps.setString(3, record.fullName.trim());
                return ps;
            }, userKeyHolder);

            userId = Objects.requireNonNull(userKeyHolder.getKey()).longValue();
        }

        // 2. Create Student profile with Unique Cryptographic QR Token
        Long studentId;
        try {
            studentId = jdbcTemplate.queryForObject("SELECT id FROM students WHERE user_id = ?",
                    Long.class, userId);
        } catch (EmptyResultDataAccessException e) {
            studentId = null;
        }

        if (studentId == null) {
            String qrToken = "QR-" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
            KeyHolder studentKeyHolder = new GeneratedKeyHolder();
            final Long fUserId = userId;
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                        "INSERT INTO students (user_id, student_id_number, phone, college, semester_or_year, batch_id, total_points, qr_token, qr_status, qr_generated_at) " +
                        "VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'ACTIVE', CURRENT_TIMESTAMP)",
                        Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, fUserId);
                ps.setString(2, record.studentIdNumber.trim().toUpperCase());
                ps.setString(3, record.phone);
                ps.setString(4, record.college);
                ps.setString(5, record.semesterOrYear);
                ps.setLong(6, record.batchId);
                ps.setString(7, qrToken);
                return ps;
            }, studentKeyHolder);

            studentId = Objects.requireNonNull(studentKeyHolder.getKey()).longValue();
        } else {
            // Update existing student with batch and phone
            jdbcTemplate.update("UPDATE students SET batch_id = ?, phone = ?, college = ? WHERE id = ?",
                    record.batchId, record.phone, record.college, studentId);
        }

        // 3. Enroll into course if courseId present
        if (record.courseId != null) {
            jdbcTemplate.update(
                    "INSERT INTO enrollments (student_id, course_id, status) VALUES (?, ?, 'ACTIVE') " +
                    "ON DUPLICATE KEY UPDATE status = 'ACTIVE'",
                    studentId, record.courseId);
        }

        // 4. Update student_enrollments record
        jdbcTemplate.update(
                "UPDATE student_enrollments SET payment_status = 'PAID', enrollment_status = 'COMPLETED', " +
                "razorpay_payment_id = ?, razorpay_signature = ?, student_user_id = ?, paid_at = CURRENT_TIMESTAMP " +
                "WHERE enrollment_token = ?",
                paymentId, signature, userId, record.enrollmentToken);

        // 5. Create Welcome Notification in portal feed
        String notifTitle = "🎉 Welcome to Skillex Academy!";
        String notifMsg = String.format("Payment verified successfully! You have been enrolled in %s (%s). Welcome aboard!",
                record.courseTitle != null ? record.courseTitle : "Engineering Portal",
                record.batchName != null ? record.batchName : "Cohort");
        jdbcTemplate.update(
                "INSERT INTO notifications (user_id, title, message, type, link_url, is_read) VALUES (?, ?, ?, 'ENROLLMENT', '/', FALSE)",
                userId, notifTitle, notifMsg);

        log.info("Student successfully activated! UserId: {}, StudentId: {}, Token: {}", userId, studentId, record.enrollmentToken);
        return userId;
    }

    public Long findUserIdByEmail(String email) {
        try {
            return jdbcTemplate.queryForObject("SELECT id FROM users WHERE LOWER(email) = LOWER(?)",
                    Long.class, email.trim().toLowerCase());
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    @Transactional
    public void updateStudentCredentials(Long userId, String token, String email, String passwordHash) {
        if (email != null && !email.isBlank()) {
            String cleanEmail = email.trim().toLowerCase();
            jdbcTemplate.update("UPDATE users SET email = ? WHERE id = ?", cleanEmail, userId);
            jdbcTemplate.update("UPDATE student_enrollments SET email = ? WHERE enrollment_token = ?", cleanEmail, token);
        }
        if (passwordHash != null && !passwordHash.isBlank()) {
            jdbcTemplate.update("UPDATE users SET password_hash = ? WHERE id = ?", passwordHash, userId);
            jdbcTemplate.update("UPDATE student_enrollments SET password_hash = ? WHERE enrollment_token = ?", passwordHash, token);
        }
    }

    public List<EnrollmentDto.EnrollmentAdminItem> findAllForAdmin(String search, String status, Long batchId) {
        StringBuilder sql = new StringBuilder(
                "SELECT e.*, b.name AS batch_name, c.title AS course_title " +
                "FROM student_enrollments e " +
                "LEFT JOIN batches b ON e.batch_id = b.id " +
                "LEFT JOIN courses c ON e.course_id = c.id " +
                "WHERE 1=1 ");

        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            sql.append("AND (LOWER(e.full_name) LIKE ? OR LOWER(e.email) LIKE ? OR LOWER(e.student_id_number) LIKE ? OR LOWER(e.enrollment_token) LIKE ?) ");
            String term = "%" + search.trim().toLowerCase() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
            params.add(term);
        }

        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            if ("PAID".equalsIgnoreCase(status) || "PENDING".equalsIgnoreCase(status) || "FAILED".equalsIgnoreCase(status)) {
                sql.append("AND e.payment_status = ? ");
                params.add(status.toUpperCase());
            } else if ("COMPLETED".equalsIgnoreCase(status)) {
                sql.append("AND e.enrollment_status = 'COMPLETED' ");
            }
        }

        if (batchId != null) {
            sql.append("AND e.batch_id = ? ");
            params.add(batchId);
        }

        sql.append("ORDER BY e.created_at DESC LIMIT 150");

        return jdbcTemplate.query(sql.toString(), adminItemRowMapper, params.toArray());
    }

    private final RowMapper<EnrollmentRecord> enrollmentRowMapper = (rs, rowNum) -> {
        EnrollmentRecord r = new EnrollmentRecord();
        r.id = rs.getLong("id");
        r.enrollmentToken = rs.getString("enrollment_token");
        r.fullName = rs.getString("full_name");
        r.email = rs.getString("email");
        r.studentIdNumber = rs.getString("student_id_number");
        r.phone = rs.getString("phone");
        r.college = rs.getString("college");
        r.semesterOrYear = rs.getString("semester_or_year");
        r.batchId = rs.getLong("batch_id");
        r.batchName = rs.getString("batch_name");
        long cId = rs.getLong("course_id");
        r.courseId = rs.wasNull() ? null : cId;
        r.courseTitle = rs.getString("course_title");
        r.amountInPaise = rs.getLong("amount_in_paise");
        r.currency = rs.getString("currency");
        r.paymentStatus = rs.getString("payment_status");
        r.enrollmentStatus = rs.getString("enrollment_status");
        r.razorpayOrderId = rs.getString("razorpay_order_id");
        r.razorpayPaymentId = rs.getString("razorpay_payment_id");
        r.razorpaySignature = rs.getString("razorpay_signature");
        long sUserId = rs.getLong("student_user_id");
        r.studentUserId = rs.wasNull() ? null : sUserId;
        r.passwordHash = rs.getString("password_hash");
        Timestamp createdAt = rs.getTimestamp("created_at");
        r.createdAt = createdAt != null ? createdAt.toInstant() : null;
        Timestamp paidAt = rs.getTimestamp("paid_at");
        r.paidAt = paidAt != null ? paidAt.toInstant() : null;
        return r;
    };

    private final RowMapper<EnrollmentDto.EnrollmentAdminItem> adminItemRowMapper = (rs, rowNum) -> {
        EnrollmentDto.EnrollmentAdminItem item = new EnrollmentDto.EnrollmentAdminItem();
        item.setId(rs.getLong("id"));
        item.setEnrollmentToken(rs.getString("enrollment_token"));
        item.setFullName(rs.getString("full_name"));
        item.setEmail(rs.getString("email"));
        item.setStudentIdNumber(rs.getString("student_id_number"));
        item.setPhone(rs.getString("phone"));
        item.setCollege(rs.getString("college"));
        item.setBatchId(rs.getLong("batch_id"));
        item.setBatchName(rs.getString("batch_name"));
        long cId = rs.getLong("course_id");
        item.setCourseId(rs.wasNull() ? null : cId);
        item.setCourseTitle(rs.getString("course_title"));
        item.setAmountInRupees(rs.getLong("amount_in_paise") / 100.0);
        item.setPaymentStatus(rs.getString("payment_status"));
        item.setEnrollmentStatus(rs.getString("enrollment_status"));
        item.setRazorpayOrderId(rs.getString("razorpay_order_id"));
        item.setRazorpayPaymentId(rs.getString("razorpay_payment_id"));
        long sUserId = rs.getLong("student_user_id");
        item.setStudentUserId(rs.wasNull() ? null : sUserId);
        Timestamp cTs = rs.getTimestamp("created_at");
        item.setCreatedAt(cTs != null ? cTs.toInstant().toString() : null);
        Timestamp pTs = rs.getTimestamp("paid_at");
        item.setPaidAt(pTs != null ? pTs.toInstant().toString() : null);
        return item;
    };

    public Map<String, String> getRazorpayQrSettings() {
        Map<String, String> map = new HashMap<>();
        try {
            jdbcTemplate.query(
                    "SELECT setting_key, setting_value FROM app_settings WHERE setting_key IN ('razorpay_qr_image_url', 'razorpay_upi_id', 'razorpay_payment_link')",
                    (rs) -> {
                        map.put(rs.getString("setting_key"), rs.getString("setting_value"));
                    });
        } catch (Exception e) {
            log.warn("Error reading QR settings from app_settings: {}", e.getMessage());
        }
        return map;
    }

    public void saveRazorpayQrSetting(String key, String value) {
        jdbcTemplate.update(
                "INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
                key, value != null ? value.trim() : "");
    }

    public static class EnrollmentRecord {
        public Long id;
        public String enrollmentToken;
        public String fullName;
        public String email;
        public String studentIdNumber;
        public String phone;
        public String college;
        public String semesterOrYear;
        public Long batchId;
        public String batchName;
        public Long courseId;
        public String courseTitle;
        public Long amountInPaise;
        public String currency;
        public String paymentStatus;
        public String enrollmentStatus;
        public String razorpayOrderId;
        public String razorpayPaymentId;
        public String razorpaySignature;
        public Long studentUserId;
        public String passwordHash;
        public Instant createdAt;
        public Instant paidAt;
    }
}
