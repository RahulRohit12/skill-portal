package com.skillportal.admin;

import com.skillportal.exception.ResourceNotFoundException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.*;

@Repository
public class AdminRepository {

    private final JdbcTemplate jdbcTemplate;

    public AdminRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ==========================================
    // 1. OVERVIEW & ANALYTICS
    // ==========================================
    public AdminDto.AdminOverview getOverview() {
        AdminDto.AdminOverview overview = new AdminDto.AdminOverview();

        overview.setTotalStudents(queryCount("SELECT COUNT(*) FROM students"));
        overview.setActiveStudents(queryCount("SELECT COUNT(*) FROM users WHERE role = 'ROLE_STUDENT' AND status = 'ACTIVE'"));
        overview.setInactiveStudents(queryCount("SELECT COUNT(*) FROM users WHERE role = 'ROLE_STUDENT' AND status != 'ACTIVE'"));
        overview.setTotalCourses(queryCount("SELECT COUNT(*) FROM courses WHERE is_deleted = FALSE"));
        overview.setTotalBatches(queryCount("SELECT COUNT(*) FROM batches"));
        overview.setTotalAssignments(queryCount("SELECT COUNT(*) FROM assignments WHERE is_deleted = FALSE"));
        overview.setTotalTests(queryCount("SELECT COUNT(*) FROM tests WHERE is_deleted = FALSE"));
        overview.setTotalQuestions(queryCount("SELECT COUNT(*) FROM questions WHERE is_active = TRUE"));
        overview.setTotalSubmissions(queryCount("SELECT COUNT(*) FROM coding_submissions"));
        overview.setTotalAttendanceSessions(queryCount("SELECT COUNT(*) FROM attendance_sessions"));

        Double avgAtt = jdbcTemplate.queryForObject(
                "SELECT AVG(CASE WHEN status = 'PRESENT' THEN 100.0 WHEN status = 'LATE' THEN 50.0 ELSE 0.0 END) FROM attendance_records",
                Double.class);
        overview.setAverageAttendance(avgAtt != null ? Math.round(avgAtt * 10.0) / 10.0 : 85.0);

        Double avgTest = jdbcTemplate.queryForObject(
                "SELECT AVG(percentage) FROM test_attempts WHERE status IN ('SUBMITTED', 'AUTO_SUBMITTED', 'EVALUATED')",
                Double.class);
        overview.setAverageTestScore(avgTest != null ? Math.round(avgTest * 10.0) / 10.0 : 78.0);

        overview.setAssignmentCompletionRate(82.5);

        // Recent students
        String studentSql = "SELECT u.id AS user_id, st.id AS student_id, u.full_name, u.email, u.status, u.created_at, " +
                            "st.student_id_number, st.phone, st.college, st.total_points, b.name AS batch_name, b.id AS batch_id " +
                            "FROM students st " +
                            "JOIN users u ON st.user_id = u.id " +
                            "LEFT JOIN batches b ON st.batch_id = b.id " +
                            "ORDER BY u.id DESC LIMIT 5";

        List<AdminDto.StudentAdminItem> recentStudents = jdbcTemplate.query(studentSql, (rs, rowNum) -> {
            AdminDto.StudentAdminItem s = new AdminDto.StudentAdminItem();
            s.setUserId(rs.getLong("user_id"));
            s.setStudentId(rs.getLong("student_id"));
            s.setName(rs.getString("full_name"));
            s.setEmail(rs.getString("email"));
            s.setStatus(rs.getString("status"));
            s.setStudentIdNumber(rs.getString("student_id_number"));
            s.setPhone(rs.getString("phone"));
            s.setCollege(rs.getString("college"));
            s.setPoints(rs.getInt("total_points"));
            s.setBatchId(rs.getLong("batch_id"));
            s.setBatchName(rs.getString("batch_name"));
            s.setCreatedAt(rs.getTimestamp("created_at").toInstant().toString());
            return s;
        });
        overview.setRecentStudents(recentStudents);

        // Recent submissions
        String subSql = "SELECT cs.id, cs.language, cs.status, cs.runtime_ms, cs.submitted_at, " +
                        "u.full_name AS student_name, q.title AS question_title " +
                        "FROM coding_submissions cs " +
                        "JOIN users u ON cs.user_id = u.id " +
                        "JOIN questions q ON cs.question_id = q.id " +
                        "ORDER BY cs.id DESC LIMIT 5";

        List<AdminDto.SubmissionAdminItem> recentSubs = jdbcTemplate.query(subSql, (rs, rowNum) -> {
            AdminDto.SubmissionAdminItem sub = new AdminDto.SubmissionAdminItem();
            sub.setSubmissionId(rs.getLong("id"));
            sub.setStudentName(rs.getString("student_name"));
            sub.setQuestionTitle(rs.getString("question_title"));
            sub.setLanguage(rs.getString("language"));
            sub.setStatus(rs.getString("status"));
            sub.setRuntimeMs(rs.getInt("runtime_ms"));
            sub.setSubmittedAt(rs.getTimestamp("submitted_at").toInstant().toString());
            return sub;
        });
        overview.setRecentSubmissions(recentSubs);

        // Upcoming tests
        String upTestSql = "SELECT t.id, t.title, t.end_time, b.name AS batch_name FROM tests t " +
                           "LEFT JOIN batches b ON t.batch_id = b.id " +
                           "WHERE t.is_published = TRUE AND t.is_deleted = FALSE ORDER BY t.id ASC LIMIT 3";
        List<AdminDto.UpcomingAdminEvent> upTests = jdbcTemplate.query(upTestSql, (rs, rowNum) -> {
            AdminDto.UpcomingAdminEvent ev = new AdminDto.UpcomingAdminEvent();
            ev.setId(rs.getLong("id"));
            ev.setTitle(rs.getString("title"));
            ev.setDeadline(rs.getTimestamp("end_time") != null ? rs.getTimestamp("end_time").toString() : "2026-06-30");
            ev.setTargetBatch(rs.getString("batch_name") != null ? rs.getString("batch_name") : "All Batches");
            return ev;
        });
        overview.setUpcomingTests(upTests);

        // Upcoming assignments
        String upAssignSql = "SELECT a.id, a.title, a.due_date, b.name AS batch_name FROM assignments a " +
                             "LEFT JOIN batches b ON a.batch_id = b.id " +
                             "WHERE a.is_published = TRUE AND a.is_deleted = FALSE ORDER BY a.id ASC LIMIT 3";
        List<AdminDto.UpcomingAdminEvent> upAssign = jdbcTemplate.query(upAssignSql, (rs, rowNum) -> {
            AdminDto.UpcomingAdminEvent ev = new AdminDto.UpcomingAdminEvent();
            ev.setId(rs.getLong("id"));
            ev.setTitle(rs.getString("title"));
            ev.setDeadline(rs.getTimestamp("due_date") != null ? rs.getTimestamp("due_date").toString() : "2026-05-30");
            ev.setTargetBatch(rs.getString("batch_name") != null ? rs.getString("batch_name") : "All Batches");
            return ev;
        });
        overview.setUpcomingAssignments(upAssign);

        return overview;
    }

    // ==========================================
    // 2. STUDENT MANAGEMENT
    // ==========================================
    public List<AdminDto.StudentAdminItem> listStudents(int offset, int limit, String search, Long batchId, Long courseId, String status) {
        StringBuilder sql = new StringBuilder(
                "SELECT u.id AS user_id, st.id AS student_id, u.full_name, u.email, u.status, u.created_at, " +
                "st.student_id_number, st.phone, st.college, st.total_points, st.qr_token, st.qr_status, " +
                "b.id AS batch_id, b.name AS batch_name, c.id AS course_id, c.title AS course_title, " +
                "(SELECT COUNT(DISTINCT cs.problem_id) FROM coding_submissions cs WHERE cs.user_id = u.id AND cs.status = 'ACCEPTED') AS solved_problems, " +
                "(SELECT AVG(percentage) FROM test_attempts ta WHERE ta.user_id = u.id AND ta.status IN ('SUBMITTED', 'AUTO_SUBMITTED', 'EVALUATED')) AS avg_test, " +
                "(SELECT AVG(CASE WHEN ar.status = 'PRESENT' THEN 100.0 WHEN ar.status = 'LATE' THEN 50.0 ELSE 0.0 END) FROM attendance_records ar WHERE ar.student_id = st.id) AS avg_att " +
                "FROM students st " +
                "JOIN users u ON st.user_id = u.id " +
                "LEFT JOIN batches b ON st.batch_id = b.id " +
                "LEFT JOIN enrollments e ON st.id = e.student_id " +
                "LEFT JOIN courses c ON e.course_id = c.id " +
                "WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            sql.append("AND (u.full_name LIKE ? OR u.email LIKE ? OR st.student_id_number LIKE ?) ");
            String p = "%" + search + "%";
            params.add(p);
            params.add(p);
            params.add(p);
        }

        if (batchId != null) {
            sql.append("AND st.batch_id = ? ");
            params.add(batchId);
        }

        if (courseId != null) {
            sql.append("AND c.id = ? ");
            params.add(courseId);
        }

        if (status != null && !status.isBlank()) {
            sql.append("AND u.status = ? ");
            params.add(status);
        }

        sql.append("ORDER BY u.id DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> {
            AdminDto.StudentAdminItem s = new AdminDto.StudentAdminItem();
            s.setUserId(rs.getLong("user_id"));
            s.setStudentId(rs.getLong("student_id"));
            s.setName(rs.getString("full_name"));
            s.setEmail(rs.getString("email"));
            s.setStatus(rs.getString("status"));
            s.setStudentIdNumber(rs.getString("student_id_number"));
            s.setPhone(rs.getString("phone"));
            s.setCollege(rs.getString("college"));
            s.setBatchId(rs.getLong("batch_id"));
            s.setBatchName(rs.getString("batch_name"));
            s.setCourseId(rs.getLong("course_id"));
            s.setCourseTitle(rs.getString("course_title"));
            s.setPoints(rs.getInt("total_points"));
            s.setSolvedProblems(rs.getInt("solved_problems"));
            double att = rs.getDouble("avg_att");
            s.setAttendancePercentage(rs.wasNull() ? 85.0 : Math.round(att * 10.0) / 10.0);
            double testScore = rs.getDouble("avg_test");
            s.setTestPerformance(rs.wasNull() ? 75.0 : Math.round(testScore * 10.0) / 10.0);
            s.setAssignmentProgress(80.0);
            s.setQrToken(rs.getString("qr_token"));
            s.setQrStatus(rs.getString("qr_status"));
            s.setCreatedAt(rs.getTimestamp("created_at").toInstant().toString());
            return s;
        }, params.toArray());
    }

    public AdminDto.StudentDetailResponse getStudentDetail(Long userId) {
        String profileSql = "SELECT u.id AS user_id, st.id AS student_id, u.full_name, u.email, u.status, u.created_at, " +
                            "st.student_id_number, st.phone, st.college, st.semester_or_year, st.avatar_url, st.total_points, st.qr_token, st.qr_status, " +
                            "b.id AS batch_id, b.name AS batch_name, c.id AS course_id, c.title AS course_title " +
                            "FROM students st " +
                            "JOIN users u ON st.user_id = u.id " +
                            "LEFT JOIN batches b ON st.batch_id = b.id " +
                            "LEFT JOIN enrollments e ON st.id = e.student_id " +
                            "LEFT JOIN courses c ON e.course_id = c.id " +
                            "WHERE u.id = ? LIMIT 1";

        AdminDto.StudentAdminItem profile = jdbcTemplate.query(profileSql, rs -> {
            if (rs.next()) {
                AdminDto.StudentAdminItem s = new AdminDto.StudentAdminItem();
                s.setUserId(rs.getLong("user_id"));
                s.setStudentId(rs.getLong("student_id"));
                s.setName(rs.getString("full_name"));
                s.setEmail(rs.getString("email"));
                s.setStatus(rs.getString("status"));
                s.setStudentIdNumber(rs.getString("student_id_number"));
                s.setPhone(rs.getString("phone"));
                s.setCollege(rs.getString("college"));
                s.setBatchId(rs.getLong("batch_id"));
                s.setBatchName(rs.getString("batch_name"));
                s.setCourseId(rs.getLong("course_id"));
                s.setCourseTitle(rs.getString("course_title"));
                s.setPoints(rs.getInt("total_points"));
                s.setQrToken(rs.getString("qr_token"));
                s.setQrStatus(rs.getString("qr_status"));
                s.setCreatedAt(rs.getTimestamp("created_at").toInstant().toString());
                return s;
            }
            return null;
        }, userId);

        if (profile == null) return null;

        AdminDto.StudentDetailResponse detail = new AdminDto.StudentDetailResponse();
        detail.setProfile(profile);

        // Attendance records
        String attSql = "SELECT ar.session_id, ar.status, ar.remarks, ass.session_date, ass.title AS topic " +
                        "FROM attendance_records ar " +
                        "JOIN attendance_sessions ass ON ar.session_id = ass.id " +
                        "WHERE ar.student_id = ? ORDER BY ass.session_date DESC LIMIT 10";
        List<AdminDto.StudentAttendanceRecordItem> attRecords = jdbcTemplate.query(attSql, (rs, rowNum) -> {
            AdminDto.StudentAttendanceRecordItem item = new AdminDto.StudentAttendanceRecordItem();
            item.setSessionId(rs.getLong("session_id"));
            item.setSessionDate(rs.getDate("session_date").toString());
            item.setTopic(rs.getString("topic"));
            item.setStatus(rs.getString("status"));
            item.setRemarks(rs.getString("remarks"));
            return item;
        }, profile.getStudentId());
        detail.setAttendanceRecords(attRecords);

        // Assignment attempts
        String assignSql = "SELECT a.id AS assignment_id, a.title, a.total_marks, " +
                           "COALESCE(SUM(qa.marks_obtained), 0) AS marks_obtained, " +
                           "MAX(qa.submitted_at) AS submitted_at, " +
                           "CASE WHEN SUM(CASE WHEN qa.status = 'SOLVED' THEN 1 ELSE 0 END) > 0 THEN 'SOLVED' ELSE 'IN_PROGRESS' END AS status " +
                           "FROM assignments a " +
                           "JOIN assignment_sections sec ON a.id = sec.assignment_id " +
                           "JOIN assignment_questions aq ON sec.id = aq.section_id " +
                           "JOIN question_attempts qa ON aq.question_id = qa.question_id AND qa.user_id = ? " +
                           "GROUP BY a.id, a.title, a.total_marks ORDER BY submitted_at DESC LIMIT 10";
        List<AdminDto.StudentAssignmentAttemptItem> assignAttempts = jdbcTemplate.query(assignSql, (rs, rowNum) -> {
            AdminDto.StudentAssignmentAttemptItem item = new AdminDto.StudentAssignmentAttemptItem();
            item.setAssignmentId(rs.getLong("assignment_id"));
            item.setTitle(rs.getString("title"));
            item.setMarksObtained(rs.getInt("marks_obtained"));
            item.setTotalMarks(rs.getInt("total_marks"));
            item.setStatus(rs.getString("status"));
            item.setSubmittedAt(rs.getTimestamp("submitted_at") != null ? rs.getTimestamp("submitted_at").toString() : "Recent");
            return item;
        }, userId);
        detail.setAssignmentAttempts(assignAttempts);

        // Test attempts
        String testSql = "SELECT t.id AS test_id, t.title, t.total_marks, ta.total_score, ta.percentage, ta.status, ta.submitted_at " +
                         "FROM test_attempts ta " +
                         "JOIN tests t ON ta.test_id = t.id " +
                         "WHERE ta.user_id = ? ORDER BY ta.submitted_at DESC LIMIT 10";
        List<AdminDto.StudentTestAttemptItem> testAttempts = jdbcTemplate.query(testSql, (rs, rowNum) -> {
            AdminDto.StudentTestAttemptItem item = new AdminDto.StudentTestAttemptItem();
            item.setTestId(rs.getLong("test_id"));
            item.setTitle(rs.getString("title"));
            item.setScore(rs.getInt("total_score"));
            item.setTotalMarks(rs.getInt("total_marks"));
            item.setPercentage(rs.getDouble("percentage"));
            item.setStatus(rs.getString("status"));
            item.setSubmittedAt(rs.getTimestamp("submitted_at") != null ? rs.getTimestamp("submitted_at").toString() : "Recent");
            return item;
        }, userId);
        detail.setTestAttempts(testAttempts);

        // Coding submissions
        String codeSql = "SELECT cs.id, cs.language, cs.status, cs.runtime_ms, cs.submitted_at, q.title AS question_title " +
                         "FROM coding_submissions cs " +
                         "JOIN questions q ON cs.question_id = q.id " +
                         "WHERE cs.user_id = ? ORDER BY cs.submitted_at DESC LIMIT 10";
        List<AdminDto.SubmissionAdminItem> codingSubs = jdbcTemplate.query(codeSql, (rs, rowNum) -> {
            AdminDto.SubmissionAdminItem item = new AdminDto.SubmissionAdminItem();
            item.setSubmissionId(rs.getLong("id"));
            item.setQuestionTitle(rs.getString("question_title"));
            item.setLanguage(rs.getString("language"));
            item.setStatus(rs.getString("status"));
            item.setRuntimeMs(rs.getInt("runtime_ms"));
            item.setSubmittedAt(rs.getTimestamp("submitted_at") != null ? rs.getTimestamp("submitted_at").toString() : "Recent");
            return item;
        }, userId);
        detail.setCodingSubmissions(codingSubs);

        // Activity log
        String actSql = "SELECT event_type, details, created_at FROM progress_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 10";
        List<AdminDto.StudentActivityItem> activities = jdbcTemplate.query(actSql, (rs, rowNum) -> {
            AdminDto.StudentActivityItem item = new AdminDto.StudentActivityItem();
            item.setEventType(rs.getString("event_type"));
            item.setDetails(rs.getString("details"));
            item.setCreatedAt(rs.getTimestamp("created_at").toInstant().toString());
            return item;
        }, userId);
        detail.setActivityLog(activities);

        return detail;
    }

    public boolean existsByEmail(String email) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE email = ?", Integer.class, email);
        return count != null && count > 0;
    }

    public boolean existsByStudentCode(String studentCode) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students WHERE student_id_number = ?", Integer.class, studentCode);
        return count != null && count > 0;
    }

    public Long createStudent(AdminDto.StudentCreateRequest req, String passwordHash) {
        // 1. Insert user
        KeyHolder userKeyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO users (email, password_hash, full_name, role, status) VALUES (?, ?, ?, 'ROLE_STUDENT', ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, req.getEmail().trim().toLowerCase());
            ps.setString(2, passwordHash);
            ps.setString(3, req.getFullName().trim());
            ps.setString(4, req.getStatus() != null ? req.getStatus() : "ACTIVE");
            return ps;
        }, userKeyHolder);

        Long userId = Objects.requireNonNull(userKeyHolder.getKey()).longValue();

        // 2. Insert into students with unique QR identity token
        String qrToken = "QR-" + java.util.UUID.randomUUID().toString().replace("-", "").toUpperCase();
        KeyHolder studentKeyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO students (user_id, student_id_number, phone, college, semester_or_year, batch_id, avatar_url, total_points, qr_token, qr_status, qr_generated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 'ACTIVE', CURRENT_TIMESTAMP)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, userId);
            ps.setString(2, req.getStudentCode().trim());
            ps.setString(3, req.getPhone());
            ps.setString(4, req.getCollege());
            ps.setString(5, req.getSemesterOrYear());
            if (req.getBatchId() != null) ps.setLong(6, req.getBatchId()); else ps.setNull(6, java.sql.Types.BIGINT);
            ps.setString(7, req.getAvatarUrl());
            ps.setString(8, qrToken);
            return ps;
        }, studentKeyHolder);

        Long studentId = Objects.requireNonNull(studentKeyHolder.getKey()).longValue();

        // 4. Enroll in course if courseId provided
        if (req.getCourseId() != null) {
            jdbcTemplate.update("INSERT INTO enrollments (student_id, course_id, status) VALUES (?, ?, 'ACTIVE')",
                    studentId, req.getCourseId());
        }

        return userId;
    }

    public void updateStudent(Long userId, AdminDto.StudentUpdateRequest req) {
        jdbcTemplate.update("UPDATE users SET full_name = ?, status = ? WHERE id = ?",
                req.getFullName(), req.getStatus(), userId);

        jdbcTemplate.update("UPDATE students SET phone = ?, college = ?, semester_or_year = ?, batch_id = ?, avatar_url = ? WHERE user_id = ?",
                req.getPhone(), req.getCollege(), req.getSemesterOrYear(), req.getBatchId(), req.getAvatarUrl(), userId);

        if (req.getCourseId() != null) {
            Long studentId = jdbcTemplate.queryForObject("SELECT id FROM students WHERE user_id = ?", Long.class, userId);
            if (studentId != null) {
                jdbcTemplate.update("INSERT INTO enrollments (student_id, course_id, status) VALUES (?, ?, 'ACTIVE') " +
                                    "ON DUPLICATE KEY UPDATE course_id = VALUES(course_id)", studentId, req.getCourseId());
            }
        }
    }

    public void updateStudentStatus(Long userId, String status) {
        jdbcTemplate.update("UPDATE users SET status = ? WHERE id = ?", status, userId);
    }

    public void resetStudentPassword(Long userId, String passwordHash) {
        jdbcTemplate.update("UPDATE users SET password_hash = ? WHERE id = ?", passwordHash, userId);
    }

    public void assignStudentBatch(Long userId, Long batchId) {
        jdbcTemplate.update("UPDATE students SET batch_id = ? WHERE user_id = ?", batchId, userId);
    }

    public void deleteStudent(Long userId) {
        // 1. Verify user is actually a student
        Integer isStudent = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE id = ? AND role = 'ROLE_STUDENT'",
                Integer.class, userId);
        if (isStudent == null || isStudent == 0) {
            throw new ResourceNotFoundException("Student not found with user ID: " + userId);
        }

        // 2. Fetch student profile IDs
        List<Long> studentIds = jdbcTemplate.query(
                "SELECT id FROM students WHERE user_id = ?",
                (rs, rowNum) -> rs.getLong("id"), userId);

        for (Long studentId : studentIds) {
            jdbcTemplate.update("DELETE FROM attendance_audit_log WHERE student_id = ?", studentId);
            jdbcTemplate.update("DELETE FROM attendance_records WHERE student_id = ?", studentId);
            jdbcTemplate.update("DELETE FROM enrollments WHERE student_id = ?", studentId);
            jdbcTemplate.update("DELETE FROM students WHERE id = ?", studentId);
        }

        // 3. Clear user activities, attempts, and auxiliary records
        jdbcTemplate.update("UPDATE student_enrollments SET student_user_id = NULL WHERE student_user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM job_applications WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM student_job_preferences WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM video_progress WHERE user_id = ?", userId);

        List<Long> attemptIds = jdbcTemplate.query(
                "SELECT id FROM test_attempts WHERE user_id = ?",
                (rs, rowNum) -> rs.getLong("id"), userId);
        for (Long attemptId : attemptIds) {
            jdbcTemplate.update("DELETE FROM test_answers WHERE attempt_id = ?", attemptId);
        }
        jdbcTemplate.update("DELETE FROM test_attempts WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM question_attempts WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM coding_submissions WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM progress_events WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM bookmarks WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM notifications WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM refresh_tokens WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM audit_logs WHERE user_id = ?", userId);

        // 4. Finally delete the student user record
        jdbcTemplate.update("DELETE FROM users WHERE id = ? AND role = 'ROLE_STUDENT'", userId);
    }

    public int deleteAllStudents() {
        // 1. Identify all student user IDs
        List<Long> studentUserIds = jdbcTemplate.query(
                "SELECT id FROM users WHERE role = 'ROLE_STUDENT'",
                (rs, rowNum) -> rs.getLong("id"));

        if (studentUserIds.isEmpty()) {
            return 0;
        }

        // 2. Clear attendance & course enrollments
        List<Long> studentIds = jdbcTemplate.query(
                "SELECT id FROM students",
                (rs, rowNum) -> rs.getLong("id"));
        for (Long studentId : studentIds) {
            jdbcTemplate.update("DELETE FROM attendance_audit_log WHERE student_id = ?", studentId);
            jdbcTemplate.update("DELETE FROM attendance_records WHERE student_id = ?", studentId);
            jdbcTemplate.update("DELETE FROM enrollments WHERE student_id = ?", studentId);
        }
        jdbcTemplate.update("DELETE FROM students");

        // 3. Clear auxiliary tables for students
        jdbcTemplate.update("UPDATE student_enrollments SET student_user_id = NULL");
        jdbcTemplate.update("DELETE FROM job_applications WHERE user_id IN (SELECT id FROM users WHERE role = 'ROLE_STUDENT')");
        jdbcTemplate.update("DELETE FROM student_job_preferences WHERE user_id IN (SELECT id FROM users WHERE role = 'ROLE_STUDENT')");
        jdbcTemplate.update("DELETE FROM video_progress WHERE user_id IN (SELECT id FROM users WHERE role = 'ROLE_STUDENT')");

        List<Long> attemptIds = jdbcTemplate.query(
                "SELECT id FROM test_attempts WHERE user_id IN (SELECT id FROM users WHERE role = 'ROLE_STUDENT')",
                (rs, rowNum) -> rs.getLong("id"));
        for (Long attemptId : attemptIds) {
            jdbcTemplate.update("DELETE FROM test_answers WHERE attempt_id = ?", attemptId);
        }
        jdbcTemplate.update("DELETE FROM test_attempts WHERE user_id IN (SELECT id FROM users WHERE role = 'ROLE_STUDENT')");
        jdbcTemplate.update("DELETE FROM question_attempts WHERE user_id IN (SELECT id FROM users WHERE role = 'ROLE_STUDENT')");
        jdbcTemplate.update("DELETE FROM coding_submissions WHERE user_id IN (SELECT id FROM users WHERE role = 'ROLE_STUDENT')");
        jdbcTemplate.update("DELETE FROM progress_events WHERE user_id IN (SELECT id FROM users WHERE role = 'ROLE_STUDENT')");
        jdbcTemplate.update("DELETE FROM bookmarks WHERE user_id IN (SELECT id FROM users WHERE role = 'ROLE_STUDENT')");
        jdbcTemplate.update("DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE role = 'ROLE_STUDENT')");
        jdbcTemplate.update("DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE role = 'ROLE_STUDENT')");
        jdbcTemplate.update("DELETE FROM audit_logs WHERE user_id IN (SELECT id FROM users WHERE role = 'ROLE_STUDENT')");

        // 4. Delete only student users (Admins & Teachers are strictly protected)
        return jdbcTemplate.update("DELETE FROM users WHERE role = 'ROLE_STUDENT'");
    }

    // ==========================================
    // 3. BATCH MANAGEMENT
    // ==========================================
    public List<AdminDto.BatchItem> listBatches() {
        String sql = "SELECT b.id, b.name, b.code, b.description, b.start_date, b.end_date, b.is_active, " +
                     "c.id AS course_id, c.title AS course_title, " +
                     "COUNT(DISTINCT st.id) AS total_students, " +
                     "SUM(CASE WHEN u.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_students " +
                     "FROM batches b " +
                     "LEFT JOIN courses c ON b.course_id = c.id " +
                     "LEFT JOIN students st ON b.id = st.batch_id " +
                     "LEFT JOIN users u ON st.user_id = u.id " +
                     "GROUP BY b.id, b.name, b.code, b.description, b.start_date, b.end_date, b.is_active, c.id, c.title " +
                     "ORDER BY b.id DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminDto.BatchItem item = new AdminDto.BatchItem();
            item.setId(rs.getLong("id"));
            item.setName(rs.getString("name"));
            item.setCode(rs.getString("code"));
            item.setDescription(rs.getString("description"));
            item.setCourseId(rs.getLong("course_id"));
            item.setCourseTitle(rs.getString("course_title"));
            item.setStartDate(rs.getDate("start_date") != null ? rs.getDate("start_date").toString() : "");
            item.setEndDate(rs.getDate("end_date") != null ? rs.getDate("end_date").toString() : "");
            item.setActive(rs.getBoolean("is_active"));
            item.setTotalStudents(rs.getInt("total_students"));
            item.setActiveStudents(rs.getInt("active_students"));
            item.setAverageAttendance(88.0);
            item.setAssignmentCompletion(76.5);
            item.setAverageTestScore(81.0);
            item.setSolvedCodingProblems(54);
            return item;
        });
    }

    public Long createBatch(AdminDto.BatchCreateRequest req) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO batches (name, code, description, course_id, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, req.getName().trim());
            ps.setString(2, req.getCode().trim().toUpperCase());
            ps.setString(3, req.getDescription());
            if (req.getCourseId() != null) ps.setLong(4, req.getCourseId()); else ps.setNull(4, java.sql.Types.BIGINT);
            ps.setString(5, req.getStartDate());
            ps.setString(6, req.getEndDate());
            ps.setBoolean(7, req.isActive());
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).longValue();
    }

    public void updateBatch(Long id, AdminDto.BatchCreateRequest req) {
        jdbcTemplate.update("UPDATE batches SET name = ?, code = ?, description = ?, course_id = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?",
                req.getName(), req.getCode(), req.getDescription(), req.getCourseId(), req.getStartDate(), req.getEndDate(), req.isActive(), id);
    }

    public void updateBatchStatus(Long id, boolean isActive) {
        jdbcTemplate.update("UPDATE batches SET is_active = ? WHERE id = ?", isActive, id);
    }

    public void deleteBatch(Long id) {
        jdbcTemplate.update("DELETE FROM batches WHERE id = ?", id);
    }

    public List<AdminDto.StudentAdminItem> getBatchStudents(Long batchId) {
        String sql = "SELECT u.id AS user_id, st.id AS student_id, u.full_name, u.email, u.status, u.created_at, " +
                     "st.student_id_number, st.phone, st.college, st.total_points, b.name AS batch_name " +
                     "FROM students st " +
                     "JOIN users u ON st.user_id = u.id " +
                     "JOIN batches b ON st.batch_id = b.id " +
                     "WHERE b.id = ? ORDER BY u.full_name ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminDto.StudentAdminItem s = new AdminDto.StudentAdminItem();
            s.setUserId(rs.getLong("user_id"));
            s.setStudentId(rs.getLong("student_id"));
            s.setName(rs.getString("full_name"));
            s.setEmail(rs.getString("email"));
            s.setStatus(rs.getString("status"));
            s.setStudentIdNumber(rs.getString("student_id_number"));
            s.setPhone(rs.getString("phone"));
            s.setCollege(rs.getString("college"));
            s.setBatchName(rs.getString("batch_name"));
            s.setPoints(rs.getInt("total_points"));
            s.setCreatedAt(rs.getTimestamp("created_at").toInstant().toString());
            return s;
        }, batchId);
    }

    // ==========================================
    // 4. COURSE & CURRICULUM MANAGEMENT
    // ==========================================
    public List<AdminDto.CourseItem> listCourses() {
        String sql = "SELECT c.id, c.title, c.slug, c.description, c.thumbnail_url, c.order_index, c.is_published, " +
                     "COUNT(DISTINCT s.id) AS total_subjects, " +
                     "COUNT(DISTINCT e.student_id) AS total_students " +
                     "FROM courses c " +
                     "LEFT JOIN subjects s ON c.id = s.course_id " +
                     "LEFT JOIN enrollments e ON c.id = e.course_id " +
                     "WHERE c.is_deleted = FALSE " +
                     "GROUP BY c.id, c.title, c.slug, c.description, c.thumbnail_url, c.order_index, c.is_published " +
                     "ORDER BY c.order_index ASC, c.id ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminDto.CourseItem item = new AdminDto.CourseItem();
            item.setId(rs.getLong("id"));
            item.setTitle(rs.getString("title"));
            item.setSlug(rs.getString("slug"));
            item.setDescription(rs.getString("description"));
            item.setThumbnailUrl(rs.getString("thumbnail_url"));
            item.setOrderIndex(rs.getInt("order_index"));
            item.setPublished(rs.getBoolean("is_published"));
            item.setTotalSubjects(rs.getInt("total_subjects"));
            item.setTotalStudents(rs.getInt("total_students"));
            return item;
        });
    }

    public Long createCourse(AdminDto.CourseCreateRequest req) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO courses (title, slug, description, thumbnail_url, order_index, is_published) VALUES (?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, req.getTitle().trim());
            ps.setString(2, req.getSlug().trim().toLowerCase());
            ps.setString(3, req.getDescription());
            ps.setString(4, req.getThumbnailUrl());
            ps.setInt(5, req.getOrderIndex());
            ps.setBoolean(6, req.isPublished());
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).longValue();
    }

    public void updateCourse(Long id, AdminDto.CourseCreateRequest req) {
        jdbcTemplate.update("UPDATE courses SET title = ?, slug = ?, description = ?, thumbnail_url = ?, order_index = ?, is_published = ? WHERE id = ?",
                req.getTitle(), req.getSlug(), req.getDescription(), req.getThumbnailUrl(), req.getOrderIndex(), req.isPublished(), id);
    }

    public void deleteCourse(Long id) {
        jdbcTemplate.update("UPDATE courses SET is_deleted = TRUE WHERE id = ?", id);
    }

    public Long createSubject(AdminDto.SubjectCreateRequest req) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO subjects (course_id, title, description, order_index, is_published) VALUES (?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, req.getCourseId());
            ps.setString(2, req.getTitle().trim());
            ps.setString(3, req.getDescription());
            ps.setInt(4, req.getOrderIndex());
            ps.setBoolean(5, req.isPublished());
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).longValue();
    }

    public Long createModule(AdminDto.ModuleCreateRequest req) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO modules (subject_id, title, description, order_index, is_published) VALUES (?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, req.getSubjectId());
            ps.setString(2, req.getTitle().trim());
            ps.setString(3, req.getDescription());
            ps.setInt(4, req.getOrderIndex());
            ps.setBoolean(5, req.isPublished());
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).longValue();
    }

    public Long createTopic(AdminDto.TopicCreateRequest req) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO topics (module_id, title, description, order_index, is_published) VALUES (?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, req.getModuleId());
            ps.setString(2, req.getTitle().trim());
            ps.setString(3, req.getDescription());
            ps.setInt(4, req.getOrderIndex());
            ps.setBoolean(5, req.isPublished());
            return ps;
        }, keyHolder);
        Long topicId = Objects.requireNonNull(keyHolder.getKey()).longValue();

        // If a recorded video/YouTube link was provided when creating the topic, attach it immediately
        if (req.getVideoUrl() != null && !req.getVideoUrl().isBlank()) {
            AdminDto.VideoCreateRequest vidReq = new AdminDto.VideoCreateRequest();
            vidReq.setTopicId(topicId);
            vidReq.setTitle(req.getVideoTitle() != null && !req.getVideoTitle().isBlank() ? req.getVideoTitle().trim() : req.getTitle().trim());
            vidReq.setDescription(req.getDescription());
            vidReq.setVideoUrl(req.getVideoUrl().trim());
            vidReq.setThumbnailUrl(req.getThumbnailUrl());
            vidReq.setDurationSeconds(req.getDurationMinutes() > 0 ? req.getDurationMinutes() * 60 : 1800);
            vidReq.setOrderIndex(1);
            vidReq.setPublished(true);
            createVideo(vidReq);
        }

        return topicId;
    }

    // ==========================================
    // 5. ASSIGNMENT MANAGEMENT
    // ==========================================
    public List<AdminDto.AssignmentAdminItem> listAssignments() {
        String sql = "SELECT a.id, a.title, a.description, a.difficulty, a.total_marks, a.passing_marks, a.max_attempts, " +
                     "a.start_date, a.due_date, a.is_published, " +
                     "c.id AS course_id, c.title AS course_title, b.id AS batch_id, b.name AS batch_name, " +
                     "COUNT(DISTINCT sec.id) AS total_sections, " +
                     "COUNT(DISTINCT aq.question_id) AS total_questions " +
                     "FROM assignments a " +
                     "LEFT JOIN courses c ON a.course_id = c.id " +
                     "LEFT JOIN batches b ON a.batch_id = b.id " +
                     "LEFT JOIN assignment_sections sec ON a.id = sec.assignment_id " +
                     "LEFT JOIN assignment_questions aq ON sec.id = aq.section_id " +
                     "WHERE a.is_deleted = FALSE " +
                     "GROUP BY a.id, a.title, a.description, a.difficulty, a.total_marks, a.passing_marks, a.max_attempts, a.start_date, a.due_date, a.is_published, c.id, c.title, b.id, b.name " +
                     "ORDER BY a.id DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminDto.AssignmentAdminItem item = new AdminDto.AssignmentAdminItem();
            item.setId(rs.getLong("id"));
            item.setTitle(rs.getString("title"));
            item.setDescription(rs.getString("description"));
            item.setCourseId(rs.getLong("course_id"));
            item.setCourseTitle(rs.getString("course_title"));
            item.setBatchId(rs.getLong("batch_id"));
            item.setBatchName(rs.getString("batch_name"));
            item.setDifficulty(rs.getString("difficulty"));
            item.setTotalMarks(rs.getInt("total_marks"));
            item.setPassingMarks(rs.getInt("passing_marks"));
            item.setMaxAttempts(rs.getInt("max_attempts"));
            item.setStartDate(rs.getTimestamp("start_date") != null ? rs.getTimestamp("start_date").toString().substring(0, 10) : "");
            item.setDueDate(rs.getTimestamp("due_date") != null ? rs.getTimestamp("due_date").toString().substring(0, 10) : "");
            item.setPublished(rs.getBoolean("is_published"));
            item.setTotalSections(rs.getInt("total_sections"));
            item.setTotalQuestions(rs.getInt("total_questions"));
            item.setStudentCompletions(12);
            return item;
        });
    }

    public Long createAssignment(AdminDto.AssignmentCreateRequest req) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO assignments (title, description, course_id, subject_id, topic_id, batch_id, difficulty, total_marks, passing_marks, max_attempts, start_date, due_date, is_published) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, req.getTitle().trim());
            ps.setString(2, req.getDescription());
            if (req.getCourseId() != null) ps.setLong(3, req.getCourseId()); else ps.setNull(3, java.sql.Types.BIGINT);
            if (req.getSubjectId() != null) ps.setLong(4, req.getSubjectId()); else ps.setNull(4, java.sql.Types.BIGINT);
            if (req.getTopicId() != null) ps.setLong(5, req.getTopicId()); else ps.setNull(5, java.sql.Types.BIGINT);
            if (req.getBatchId() != null) ps.setLong(6, req.getBatchId()); else ps.setNull(6, java.sql.Types.BIGINT);
            ps.setString(7, req.getDifficulty());
            ps.setInt(8, req.getTotalMarks());
            ps.setInt(9, req.getPassingMarks());
            ps.setInt(10, req.getMaxAttempts());
            ps.setTimestamp(11, parseTimestamp(req.getStartDate(), "00:00:00"));
            ps.setTimestamp(12, parseTimestamp(req.getDueDate(), "23:59:59"));
            ps.setBoolean(13, req.isPublished());
            return ps;
        }, keyHolder);

        Long assignmentId = Objects.requireNonNull(keyHolder.getKey()).longValue();

        // Create Sections & link questions
        if (req.getSections() != null) {
            for (int i = 0; i < req.getSections().size(); i++) {
                AdminDto.AssignmentSectionCreateDto sec = req.getSections().get(i);
                int secNum = sec.getSectionNumber() > 0 ? sec.getSectionNumber() : (i + 1);

                KeyHolder secKeyHolder = new GeneratedKeyHolder();
                jdbcTemplate.update(connection -> {
                    PreparedStatement ps = connection.prepareStatement(
                            "INSERT INTO assignment_sections (assignment_id, section_number, title, description, order_index) VALUES (?, ?, ?, ?, ?)",
                            Statement.RETURN_GENERATED_KEYS);
                    ps.setLong(1, assignmentId);
                    ps.setInt(2, secNum);
                    ps.setString(3, sec.getTitle());
                    ps.setString(4, sec.getDescription());
                    ps.setInt(5, secNum);
                    return ps;
                }, secKeyHolder);

                Long secId = Objects.requireNonNull(secKeyHolder.getKey()).longValue();

                if (sec.getQuestionIds() != null) {
                    for (int qIdx = 0; qIdx < sec.getQuestionIds().size(); qIdx++) {
                        Long qId = sec.getQuestionIds().get(qIdx);
                        jdbcTemplate.update("INSERT INTO assignment_questions (section_id, question_id, order_index) VALUES (?, ?, ?) " +
                                            "ON DUPLICATE KEY UPDATE order_index = VALUES(order_index)", secId, qId, qIdx + 1);
                    }
                }
            }
        }

        return assignmentId;
    }

    public void deleteAssignment(Long id) {
        jdbcTemplate.update("UPDATE assignments SET is_deleted = TRUE WHERE id = ?", id);
    }

    // ==========================================
    // 6. QUESTION BANK MANAGEMENT
    // ==========================================
    public List<AdminDto.QuestionBankItem> listQuestions(Long topicId, String questionType, String difficulty, String search) {
        StringBuilder sql = new StringBuilder(
                "SELECT q.id, q.title, q.description, q.question_type, q.difficulty, q.marks, q.negative_marks, q.tags, q.is_active, " +
                "t.id AS topic_id, t.title AS topic_title, s.title AS subject_title, c.title AS course_title " +
                "FROM questions q " +
                "LEFT JOIN topics t ON q.topic_id = t.id " +
                "LEFT JOIN modules m ON t.module_id = m.id " +
                "LEFT JOIN subjects s ON m.subject_id = s.id " +
                "LEFT JOIN courses c ON s.course_id = c.id " +
                "WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();

        if (topicId != null) {
            sql.append("AND q.topic_id = ? ");
            params.add(topicId);
        }

        if (questionType != null && !questionType.isBlank()) {
            sql.append("AND q.question_type = ? ");
            params.add(questionType);
        }

        if (difficulty != null && !difficulty.isBlank()) {
            sql.append("AND q.difficulty = ? ");
            params.add(difficulty);
        }

        if (search != null && !search.isBlank()) {
            sql.append("AND (q.title LIKE ? OR q.description LIKE ? OR q.tags LIKE ?) ");
            String p = "%" + search + "%";
            params.add(p);
            params.add(p);
            params.add(p);
        }

        sql.append("ORDER BY q.id DESC LIMIT 50");

        List<AdminDto.QuestionBankItem> list = jdbcTemplate.query(sql.toString(), (rs, rowNum) -> {
            AdminDto.QuestionBankItem item = new AdminDto.QuestionBankItem();
            item.setId(rs.getLong("id"));
            item.setTitle(rs.getString("title"));
            item.setDescription(rs.getString("description"));
            item.setQuestionType(rs.getString("question_type"));
            item.setDifficulty(rs.getString("difficulty"));
            item.setMarks(rs.getInt("marks"));
            item.setNegativeMarks(rs.getInt("negative_marks"));
            item.setTopicId(rs.getLong("topic_id"));
            item.setTopicTitle(rs.getString("topic_title"));
            item.setSubjectTitle(rs.getString("subject_title"));
            item.setCourseTitle(rs.getString("course_title"));
            item.setTags(rs.getString("tags"));
            item.setActive(rs.getBoolean("is_active"));
            return item;
        }, params.toArray());

        // Attach options for MCQs
        for (AdminDto.QuestionBankItem q : list) {
            if ("MCQ_SINGLE".equals(q.getQuestionType()) || "MCQ_MULTI".equals(q.getQuestionType())) {
                String optSql = "SELECT id, option_label, option_text, is_correct FROM question_options WHERE question_id = ? ORDER BY order_index ASC";
                List<AdminDto.QuestionOptionItem> opts = jdbcTemplate.query(optSql, (rs, rIdx) -> {
                    AdminDto.QuestionOptionItem opt = new AdminDto.QuestionOptionItem();
                    opt.setId(rs.getLong("id"));
                    opt.setOptionLabel(rs.getString("option_label"));
                    opt.setOptionText(rs.getString("option_text"));
                    opt.setCorrect(rs.getBoolean("is_correct"));
                    return opt;
                }, q.getId());
                q.setOptions(opts);
            }
        }

        return list;
    }

    public Long createQuestion(AdminDto.QuestionCreateRequest req) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO questions (title, description, explanation, question_type, difficulty, marks, negative_marks, topic_id, tags, is_active) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, req.getTitle().trim());
            ps.setString(2, req.getDescription());
            ps.setString(3, req.getExplanation());
            ps.setString(4, req.getQuestionType() != null ? req.getQuestionType() : "MCQ_SINGLE");
            ps.setString(5, req.getDifficulty() != null ? req.getDifficulty() : "MEDIUM");
            ps.setInt(6, req.getMarks());
            ps.setInt(7, req.getNegativeMarks());
            if (req.getTopicId() != null) ps.setLong(8, req.getTopicId()); else ps.setNull(8, java.sql.Types.BIGINT);
            ps.setString(9, req.getTags());
            ps.setBoolean(10, req.isActive());
            return ps;
        }, keyHolder);

        Long questionId = Objects.requireNonNull(keyHolder.getKey()).longValue();

        // If MCQ, save options
        if (req.getOptions() != null && !req.getOptions().isEmpty()) {
            for (int i = 0; i < req.getOptions().size(); i++) {
                AdminDto.QuestionOptionItem opt = req.getOptions().get(i);
                jdbcTemplate.update("INSERT INTO question_options (question_id, option_label, option_text, is_correct, order_index) VALUES (?, ?, ?, ?, ?)",
                        questionId, opt.getOptionLabel(), opt.getOptionText(), opt.isCorrect(), i + 1);
            }
        }

        // If CODING, save coding_problems and test_cases
        if ("CODING".equals(req.getQuestionType()) && req.getCodingSpecs() != null) {
            AdminDto.CodingSpecsDto specs = req.getCodingSpecs();
            KeyHolder codingKeyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                        "INSERT INTO coding_problems (question_id, problem_statement, input_format, output_format, constraints, starter_code_java, starter_code_python, starter_code_js, time_limit_ms, memory_limit_mb) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, questionId);
                ps.setString(2, specs.getProblemStatement() != null ? specs.getProblemStatement() : req.getDescription());
                ps.setString(3, specs.getInputFormat());
                ps.setString(4, specs.getOutputFormat());
                ps.setString(5, specs.getConstraints());
                ps.setString(6, specs.getStarterCodeJava());
                ps.setString(7, specs.getStarterCodePython());
                ps.setString(8, specs.getStarterCodeJs());
                ps.setInt(9, specs.getTimeLimitMs());
                ps.setInt(10, specs.getMemoryLimitMb());
                return ps;
            }, codingKeyHolder);

            Long problemId = Objects.requireNonNull(codingKeyHolder.getKey()).longValue();

            if (specs.getTestCases() != null) {
                for (int i = 0; i < specs.getTestCases().size(); i++) {
                    AdminDto.TestCaseItem tc = specs.getTestCases().get(i);
                    jdbcTemplate.update("INSERT INTO test_cases (coding_problem_id, input_data, expected_output, is_hidden, order_index) VALUES (?, ?, ?, ?, ?)",
                            problemId, tc.getInputData(), tc.getExpectedOutput(), tc.isHidden(), i + 1);
                }
            }
        }

        return questionId;
    }

    public void deleteQuestion(Long id) {
        jdbcTemplate.update("UPDATE questions SET is_active = FALSE WHERE id = ?", id);
    }

    // ==========================================
    // 7. TEST / EXAM MANAGEMENT
    // ==========================================
    public List<AdminDto.TestAdminItem> listTests() {
        String sql = "SELECT t.id, t.title, t.description, t.duration_minutes, t.total_marks, t.passing_percentage, t.negative_marks, " +
                     "t.start_time, t.end_time, t.attempt_limit, t.is_published, " +
                     "c.id AS course_id, c.title AS course_title, b.id AS batch_id, b.name AS batch_name, " +
                     "COUNT(DISTINCT tq.question_id) AS total_questions, " +
                     "COUNT(DISTINCT ta.id) AS student_attempts, " +
                     "COALESCE(AVG(ta.percentage), 0.0) AS avg_score " +
                     "FROM tests t " +
                     "LEFT JOIN courses c ON t.course_id = c.id " +
                     "LEFT JOIN batches b ON t.batch_id = b.id " +
                     "LEFT JOIN test_sections ts ON t.id = ts.test_id " +
                     "LEFT JOIN test_questions tq ON ts.id = tq.test_section_id " +
                     "LEFT JOIN test_attempts ta ON t.id = ta.test_id AND ta.status IN ('SUBMITTED', 'AUTO_SUBMITTED', 'EVALUATED') " +
                     "WHERE t.is_deleted = FALSE " +
                     "GROUP BY t.id, t.title, t.description, t.duration_minutes, t.total_marks, t.passing_percentage, t.negative_marks, t.start_time, t.end_time, t.attempt_limit, t.is_published, c.id, c.title, b.id, b.name " +
                     "ORDER BY t.id DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminDto.TestAdminItem item = new AdminDto.TestAdminItem();
            item.setId(rs.getLong("id"));
            item.setTitle(rs.getString("title"));
            item.setDescription(rs.getString("description"));
            item.setCourseId(rs.getLong("course_id"));
            item.setCourseTitle(rs.getString("course_title"));
            item.setBatchId(rs.getLong("batch_id"));
            item.setBatchName(rs.getString("batch_name"));
            item.setDurationMinutes(rs.getInt("duration_minutes"));
            item.setTotalMarks(rs.getInt("total_marks"));
            item.setPassingPercentage(rs.getInt("passing_percentage"));
            item.setNegativeMarks(rs.getInt("negative_marks"));
            item.setStartTime(rs.getTimestamp("start_time") != null ? rs.getTimestamp("start_time").toString().substring(0, 16) : "");
            item.setEndTime(rs.getTimestamp("end_time") != null ? rs.getTimestamp("end_time").toString().substring(0, 16) : "");
            item.setAttemptLimit(rs.getInt("attempt_limit"));
            item.setPublished(rs.getBoolean("is_published"));
            item.setTotalQuestions(rs.getInt("total_questions"));
            item.setStudentAttempts(rs.getInt("student_attempts"));
            item.setAverageScore(Math.round(rs.getDouble("avg_score") * 10.0) / 10.0);
            return item;
        });
    }

    public Long createTest(AdminDto.TestCreateRequest req) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO tests (title, description, course_id, batch_id, duration_minutes, total_marks, passing_percentage, negative_marks, start_time, end_time, attempt_limit, is_published) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, req.getTitle().trim());
            ps.setString(2, req.getDescription());
            if (req.getCourseId() != null) ps.setLong(3, req.getCourseId()); else ps.setNull(3, java.sql.Types.BIGINT);
            if (req.getBatchId() != null) ps.setLong(4, req.getBatchId()); else ps.setNull(4, java.sql.Types.BIGINT);
            ps.setInt(5, req.getDurationMinutes());
            ps.setInt(6, req.getTotalMarks());
            ps.setInt(7, req.getPassingPercentage());
            ps.setInt(8, req.getNegativeMarks());
            ps.setTimestamp(9, parseTimestamp(req.getStartTime(), "00:00:00"));
            ps.setTimestamp(10, parseTimestamp(req.getEndTime(), "23:59:59"));
            ps.setInt(11, req.getAttemptLimit());
            ps.setBoolean(12, req.isPublished());
            return ps;
        }, keyHolder);

        Long testId = Objects.requireNonNull(keyHolder.getKey()).longValue();

        // Create Sections & questions
        if (req.getSections() != null) {
            for (int i = 0; i < req.getSections().size(); i++) {
                AdminDto.TestSectionCreateDto sec = req.getSections().get(i);
                final int sectionOrder = i + 1;
                KeyHolder secKeyHolder = new GeneratedKeyHolder();
                jdbcTemplate.update(connection -> {
                    PreparedStatement ps = connection.prepareStatement(
                            "INSERT INTO test_sections (test_id, title, order_index) VALUES (?, ?, ?)",
                            Statement.RETURN_GENERATED_KEYS);
                    ps.setLong(1, testId);
                    ps.setString(2, sec.getTitle());
                    ps.setInt(3, sectionOrder);
                    return ps;
                }, secKeyHolder);

                Long secId = Objects.requireNonNull(secKeyHolder.getKey()).longValue();

                if (sec.getQuestionIds() != null) {
                    for (int qIdx = 0; qIdx < sec.getQuestionIds().size(); qIdx++) {
                        Long qId = sec.getQuestionIds().get(qIdx);
                        jdbcTemplate.update("INSERT INTO test_questions (test_section_id, question_id, marks, negative_marks, order_index) VALUES (?, ?, 10, ?, ?)",
                                secId, qId, req.getNegativeMarks(), qIdx + 1);
                    }
                }
            }
        }

        return testId;
    }

    public void deleteTest(Long id) {
        jdbcTemplate.update("UPDATE tests SET is_deleted = TRUE WHERE id = ?", id);
    }

    public void publishTest(Long id, boolean published) {
        jdbcTemplate.update("UPDATE tests SET is_published = ? WHERE id = ?", published, id);
    }

    // ==========================================
    // 8. ATTENDANCE REGISTER MANAGEMENT
    // ==========================================
    public List<AdminDto.AttendanceSessionItem> listAttendanceSessions(Long batchId) {
        String sql = "SELECT s.id, s.batch_id, b.name AS batch_name, s.title AS topic, s.session_date, s.start_time, s.end_time, " +
                     "SUM(CASE WHEN r.status = 'PRESENT' THEN 1 ELSE 0 END) AS present_count, " +
                     "SUM(CASE WHEN r.status = 'ABSENT' THEN 1 ELSE 0 END) AS absent_count, " +
                     "SUM(CASE WHEN r.status = 'LATE' THEN 1 ELSE 0 END) AS late_count, " +
                     "COUNT(r.id) AS total_students " +
                     "FROM attendance_sessions s " +
                     "JOIN batches b ON s.batch_id = b.id " +
                     "LEFT JOIN attendance_records r ON s.id = r.session_id " +
                     "WHERE (? IS NULL OR s.batch_id = ?) " +
                     "GROUP BY s.id, s.batch_id, b.name, s.title, s.session_date, s.start_time, s.end_time " +
                     "ORDER BY s.session_date DESC, s.id DESC LIMIT 20";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminDto.AttendanceSessionItem item = new AdminDto.AttendanceSessionItem();
            item.setId(rs.getLong("id"));
            item.setBatchId(rs.getLong("batch_id"));
            item.setBatchName(rs.getString("batch_name"));
            item.setTopic(rs.getString("topic"));
            item.setSessionDate(rs.getDate("session_date").toString());
            item.setStartTime(rs.getTime("start_time") != null ? rs.getTime("start_time").toString() : "");
            item.setEndTime(rs.getTime("end_time") != null ? rs.getTime("end_time").toString() : "");
            item.setPresentCount(rs.getInt("present_count"));
            item.setAbsentCount(rs.getInt("absent_count"));
            item.setLateCount(rs.getInt("late_count"));
            item.setTotalStudents(rs.getInt("total_students"));
            return item;
        }, batchId, batchId);
    }

    public Long createAttendanceSession(AdminDto.AttendanceSessionCreateRequest req, Long instructorUserId) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO attendance_sessions (batch_id, subject_id, title, session_date, start_time, end_time, created_by) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, req.getBatchId());
            if (req.getSubjectId() != null) ps.setLong(2, req.getSubjectId()); else ps.setNull(2, java.sql.Types.BIGINT);
            ps.setString(3, req.getTitle().trim());
            ps.setString(4, req.getSessionDate());
            ps.setString(5, req.getStartTime());
            ps.setString(6, req.getEndTime());
            if (instructorUserId != null) ps.setLong(7, instructorUserId); else ps.setNull(7, java.sql.Types.BIGINT);
            return ps;
        }, keyHolder);

        Long sessionId = Objects.requireNonNull(keyHolder.getKey()).longValue();

        // Auto-seed session with students in batch defaulted to PRESENT
        List<Long> studentIds = jdbcTemplate.query(
                "SELECT id FROM students WHERE batch_id = ?",
                (rs, rowNum) -> rs.getLong("id"),
                req.getBatchId());

        for (Long stId : studentIds) {
            jdbcTemplate.update("INSERT INTO attendance_records (session_id, student_id, status) VALUES (?, ?, 'PRESENT')",
                    sessionId, stId);
        }

        return sessionId;
    }

    public List<AdminDto.StudentAttendanceMarkItem> getSessionAttendanceRecords(Long sessionId) {
        String sql = "SELECT st.id AS student_id, u.full_name, st.student_id_number, r.status, r.remarks " +
                     "FROM attendance_records r " +
                     "JOIN students st ON r.student_id = st.id " +
                     "JOIN users u ON st.user_id = u.id " +
                     "WHERE r.session_id = ? ORDER BY u.full_name ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminDto.StudentAttendanceMarkItem item = new AdminDto.StudentAttendanceMarkItem();
            item.setStudentId(rs.getLong("student_id"));
            item.setStudentName(rs.getString("full_name"));
            item.setStudentCode(rs.getString("student_id_number"));
            item.setStatus(rs.getString("status"));
            item.setRemarks(rs.getString("remarks"));
            return item;
        }, sessionId);
    }

    public void markAttendance(AdminDto.AttendanceMarkRequest req) {
        for (AdminDto.StudentAttendanceMarkItem r : req.getRecords()) {
            jdbcTemplate.update("INSERT INTO attendance_records (session_id, student_id, status, remarks) VALUES (?, ?, ?, ?) " +
                                "ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)",
                    req.getSessionId(), r.getStudentId(), r.getStatus(), r.getRemarks());
        }
    }

    // ==========================================
    // 9. STUDY MATERIALS & VIDEOS
    // ==========================================
    public List<AdminDto.MaterialAdminItem> listMaterials() {
        String sql = "SELECT m.id, m.title, m.description, m.material_type, m.file_url, m.file_size_bytes, m.is_published, m.created_at, " +
                     "c.id AS course_id, c.title AS course_title, s.id AS subject_id, s.title AS subject_title, t.id AS topic_id, t.title AS topic_title " +
                     "FROM study_materials m " +
                     "LEFT JOIN courses c ON m.course_id = c.id " +
                     "LEFT JOIN subjects s ON m.subject_id = s.id " +
                     "LEFT JOIN topics t ON m.topic_id = t.id " +
                     "ORDER BY m.id DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminDto.MaterialAdminItem item = new AdminDto.MaterialAdminItem();
            item.setId(rs.getLong("id"));
            item.setTitle(rs.getString("title"));
            item.setDescription(rs.getString("description"));
            item.setMaterialType(rs.getString("material_type"));
            item.setFileUrl(rs.getString("file_url"));
            item.setFileSizeBytes(rs.getLong("file_size_bytes"));
            item.setPublished(rs.getBoolean("is_published"));
            item.setCourseId(rs.getLong("course_id"));
            item.setCourseTitle(rs.getString("course_title"));
            item.setSubjectId(rs.getLong("subject_id"));
            item.setSubjectTitle(rs.getString("subject_title"));
            item.setTopicId(rs.getLong("topic_id"));
            item.setTopicTitle(rs.getString("topic_title"));
            item.setCreatedAt(rs.getTimestamp("created_at").toInstant().toString());
            return item;
        });
    }

    public Long createMaterial(AdminDto.MaterialCreateRequest req) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO study_materials (course_id, subject_id, module_id, topic_id, title, description, material_type, file_url, file_size_bytes, is_published) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            if (req.getCourseId() != null) ps.setLong(1, req.getCourseId()); else ps.setNull(1, java.sql.Types.BIGINT);
            if (req.getSubjectId() != null) ps.setLong(2, req.getSubjectId()); else ps.setNull(2, java.sql.Types.BIGINT);
            if (req.getModuleId() != null) ps.setLong(3, req.getModuleId()); else ps.setNull(3, java.sql.Types.BIGINT);
            if (req.getTopicId() != null) ps.setLong(4, req.getTopicId()); else ps.setNull(4, java.sql.Types.BIGINT);
            ps.setString(5, req.getTitle().trim());
            ps.setString(6, req.getDescription());
            ps.setString(7, req.getMaterialType());
            ps.setString(8, req.getFileUrl());
            ps.setLong(9, req.getFileSizeBytes());
            ps.setBoolean(10, req.isPublished());
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).longValue();
    }

    public void deleteMaterial(Long id) {
        jdbcTemplate.update("DELETE FROM study_materials WHERE id = ?", id);
    }

    public Long createVideo(AdminDto.VideoCreateRequest req) {
        String videoUrl = req.getVideoUrl() != null ? req.getVideoUrl().trim() : "";
        String thumbnailUrl = req.getThumbnailUrl() != null ? req.getThumbnailUrl().trim() : "";

        String embedUrl = normalizeYouTubeUrl(videoUrl);
        if (thumbnailUrl.isBlank()) {
            thumbnailUrl = extractYouTubeThumbnail(videoUrl);
        }

        final String finalVideoUrl = embedUrl;
        final String finalThumbnailUrl = thumbnailUrl;

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO recorded_classes (topic_id, title, description, video_url, thumbnail_url, duration_seconds, order_index, is_published) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            if (req.getTopicId() != null) ps.setLong(1, req.getTopicId()); else ps.setNull(1, java.sql.Types.BIGINT);
            ps.setString(2, req.getTitle().trim());
            ps.setString(3, req.getDescription());
            ps.setString(4, finalVideoUrl);
            ps.setString(5, finalThumbnailUrl);
            ps.setInt(6, req.getDurationSeconds());
            ps.setInt(7, req.getOrderIndex());
            ps.setBoolean(8, req.isPublished());
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).longValue();
    }

    public List<AdminDto.VideoAdminItem> listVideos() {
        String sql = "SELECT v.id, v.topic_id, v.title, v.description, v.video_url, v.thumbnail_url, " +
                     "v.duration_seconds, v.order_index, v.is_published, t.title AS topic_title, " +
                     "m.title AS module_title, c.title AS course_title " +
                     "FROM recorded_classes v " +
                     "LEFT JOIN topics t ON v.topic_id = t.id " +
                     "LEFT JOIN modules m ON t.module_id = m.id " +
                     "LEFT JOIN subjects s ON m.subject_id = s.id " +
                     "LEFT JOIN courses c ON s.course_id = c.id " +
                     "ORDER BY v.id DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminDto.VideoAdminItem item = new AdminDto.VideoAdminItem();
            item.setId(rs.getLong("id"));
            item.setTopicId(rs.getLong("topic_id"));
            item.setTitle(rs.getString("title"));
            item.setDescription(rs.getString("description"));
            item.setVideoUrl(rs.getString("video_url"));
            item.setThumbnailUrl(rs.getString("thumbnail_url"));
            item.setDurationSeconds(rs.getInt("duration_seconds"));
            item.setOrderIndex(rs.getInt("order_index"));
            item.setPublished(rs.getBoolean("is_published"));
            item.setTopicTitle(rs.getString("topic_title"));
            item.setModuleTitle(rs.getString("module_title"));
            item.setCourseTitle(rs.getString("course_title"));
            return item;
        });
    }

    public void deleteVideo(Long id) {
        jdbcTemplate.update("DELETE FROM recorded_classes WHERE id = ?", id);
    }

    // ==========================================
    // 10. ANNOUNCEMENTS
    // ==========================================
    public int createAnnouncement(AdminDto.AnnouncementCreateRequest req) {
        List<Long> userIds;
        String target = req.getTarget() != null ? req.getTarget().trim().toUpperCase() : "";

        if ("BATCH".equals(target) || (target.isEmpty() && req.getTargetBatchId() != null)) {
            if (req.getTargetBatchId() != null) {
                userIds = jdbcTemplate.query(
                        "SELECT user_id FROM students WHERE batch_id = ?",
                        (rs, rowNum) -> rs.getLong("user_id"),
                        req.getTargetBatchId());
            } else {
                userIds = List.of();
            }
        } else if ("GENERAL".equals(target)) {
            // General announcement targeted to all enrolled students
            userIds = jdbcTemplate.query(
                    "SELECT user_id FROM students",
                    (rs, rowNum) -> rs.getLong("user_id"));
        } else {
            // ALL: Entire platform active users
            userIds = jdbcTemplate.query(
                    "SELECT id FROM users WHERE is_active = TRUE",
                    (rs, rowNum) -> rs.getLong("id"));
        }

        String notifType = (req.getType() != null && !req.getType().isBlank()) ? req.getType().trim().toUpperCase() : "ANNOUNCEMENT";
        for (Long uId : userIds) {
            jdbcTemplate.update("INSERT INTO notifications (user_id, title, message, type, link_url, is_read) VALUES (?, ?, ?, ?, ?, FALSE)",
                    uId, req.getTitle(), req.getMessage(), notifType, req.getLinkUrl());
        }
        return userIds.size();
    }

    private Timestamp parseTimestamp(String input, String defaultTime) {
        if (input == null || input.isBlank()) {
            return null;
        }
        try {
            String clean = input.trim();
            if (clean.endsWith("Z")) {
                clean = clean.substring(0, clean.length() - 1);
            }
            clean = clean.replace('T', ' ');
            if (clean.contains(".")) {
                clean = clean.substring(0, clean.indexOf('.'));
            }
            if (clean.contains(" ")) {
                String[] parts = clean.split(" ");
                String datePart = parts[0];
                String timePart = parts[1];
                if (timePart.length() == 5) {
                    timePart += ":00";
                }
                return Timestamp.valueOf(datePart + " " + timePart);
            } else {
                return Timestamp.valueOf(clean + " " + defaultTime);
            }
        } catch (Exception e) {
            return new Timestamp(System.currentTimeMillis());
        }
    }

    private String normalizeYouTubeUrl(String url) {
        if (url == null || url.isBlank()) return url;
        String trimmed = url.trim();
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
            "(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/|youtube\\.com\\/shorts\\/)([^\"&?\\/\\s]{11})",
            java.util.regex.Pattern.CASE_INSENSITIVE
        );
        java.util.regex.Matcher matcher = pattern.matcher(trimmed);
        if (matcher.find()) {
            String videoId = matcher.group(1);
            return "https://www.youtube.com/embed/" + videoId;
        }
        return trimmed;
    }

    private String extractYouTubeThumbnail(String url) {
        if (url == null || url.isBlank()) return "";
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
            "(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/|youtube\\.com\\/shorts\\/)([^\"&?\\/\\s]{11})",
            java.util.regex.Pattern.CASE_INSENSITIVE
        );
        java.util.regex.Matcher matcher = pattern.matcher(url.trim());
        if (matcher.find()) {
            String videoId = matcher.group(1);
            return "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg";
        }
        return "";
    }

    private int queryCount(String sql) {
        Integer c = jdbcTemplate.queryForObject(sql, Integer.class);
        return c != null ? c : 0;
    }
}
