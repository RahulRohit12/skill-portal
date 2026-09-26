package com.skillportal.attendance;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class AttendanceRepository {

    private final JdbcTemplate jdbcTemplate;

    public AttendanceRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public AttendanceDto.StudentAttendanceSummary getStudentAttendanceSummary(Long userId) {
        AttendanceDto.StudentAttendanceSummary summary = new AttendanceDto.StudentAttendanceSummary();

        // 1. Get student record
        String stSql = "SELECT id, batch_id FROM students WHERE user_id = ?";
        Long studentId;
        Long batchId;
        try {
            Map<String, Object> map = jdbcTemplate.queryForMap(stSql, userId);
            studentId = ((Number) map.get("id")).longValue();
            batchId = map.get("batch_id") != null ? ((Number) map.get("batch_id")).longValue() : null;
        } catch (EmptyResultDataAccessException e) {
            summary.setOverallPercentage(0.0);
            summary.setHistory(List.of());
            summary.setSubjectWise(List.of());
            return summary;
        }

        if (batchId == null) {
            summary.setOverallPercentage(100.0);
            summary.setHistory(List.of());
            summary.setSubjectWise(List.of());
            return summary;
        }

        // Total sessions held for this batch
        String sessSql = "SELECT COUNT(*) FROM attendance_sessions WHERE batch_id = ?";
        Integer totalSessions = jdbcTemplate.queryForObject(sessSql, Integer.class, batchId);
        int total = totalSessions != null ? totalSessions : 0;
        summary.setTotalClasses(total);

        // Present sessions
        String presSql = "SELECT COUNT(*) FROM attendance_records WHERE student_id = ? AND status = 'PRESENT'";
        Integer presCount = jdbcTemplate.queryForObject(presSql, Integer.class, studentId);
        int present = presCount != null ? presCount : 0;
        summary.setPresentClasses(present);
        summary.setAbsentClasses(Math.max(0, total - present));

        double pct = total > 0 ? ((double) present / total) * 100.0 : 100.0;
        summary.setOverallPercentage(Math.round(pct * 10.0) / 10.0);

        // 2. Subject-wise stats
        String subSql = "SELECT s.id AS subject_id, s.title AS subject_title, " +
                        "(SELECT COUNT(*) FROM attendance_sessions as2 WHERE as2.subject_id = s.id AND as2.batch_id = ?) AS total_sub_sessions, " +
                        "(SELECT COUNT(*) FROM attendance_records ar " +
                        " JOIN attendance_sessions as3 ON ar.session_id = as3.id " +
                        " WHERE as3.subject_id = s.id AND ar.student_id = ? AND ar.status = 'PRESENT') AS pres_sub_sessions " +
                        "FROM subjects s WHERE s.is_deleted = FALSE";

        List<AttendanceDto.SubjectAttendanceStat> subStats = jdbcTemplate.query(subSql, (rs, rowNum) -> {
            AttendanceDto.SubjectAttendanceStat st = new AttendanceDto.SubjectAttendanceStat();
            st.setSubjectId(rs.getLong("subject_id"));
            st.setSubjectTitle(rs.getString("subject_title"));
            int subTotal = rs.getInt("total_sub_sessions");
            int subPres = rs.getInt("pres_sub_sessions");
            st.setTotalClasses(subTotal);
            st.setPresentClasses(subPres);
            double subPct = subTotal > 0 ? ((double) subPres / subTotal) * 100.0 : 100.0;
            st.setPercentage(Math.round(subPct * 10.0) / 10.0);
            return st;
        }, batchId, studentId);
        summary.setSubjectWise(subStats);

        // 3. Chronological History
        String histSql = "SELECT ar.session_id, asess.title AS session_title, s.title AS subject_title, " +
                         "asess.session_date, ar.status, ar.remarks " +
                         "FROM attendance_records ar " +
                         "JOIN attendance_sessions asess ON ar.session_id = asess.id " +
                         "LEFT JOIN subjects s ON asess.subject_id = s.id " +
                         "WHERE ar.student_id = ? ORDER BY asess.session_date DESC LIMIT 50";

        List<AttendanceDto.AttendanceHistoryItem> history = jdbcTemplate.query(histSql, (rs, rowNum) -> {
            AttendanceDto.AttendanceHistoryItem item = new AttendanceDto.AttendanceHistoryItem();
            item.setSessionId(rs.getLong("session_id"));
            item.setSessionTitle(rs.getString("session_title"));
            item.setSubjectTitle(rs.getString("subject_title") != null ? rs.getString("subject_title") : "General Lecture");
            item.setSessionDate(rs.getDate("session_date").toString());
            item.setStatus(rs.getString("status"));
            item.setRemarks(rs.getString("remarks"));
            return item;
        }, studentId);
        summary.setHistory(history);

        return summary;
    }

    public Long createSession(Long adminUserId, AttendanceDto.CreateSessionRequest req) {
        String sql = "INSERT INTO attendance_sessions (batch_id, subject_id, title, session_date, created_by) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, req.getBatchId());
            if (req.getSubjectId() != null) ps.setLong(2, req.getSubjectId()); else ps.setNull(2, java.sql.Types.BIGINT);
            ps.setString(3, req.getTitle());
            ps.setDate(4, Date.valueOf(req.getSessionDate()));
            ps.setLong(5, adminUserId);
            return ps;
        }, keyHolder);

        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public void markAttendance(Long sessionId, Long studentId, String status, String remarks) {
        String sql = "INSERT INTO attendance_records (session_id, student_id, status, remarks, attendance_date, marked_at) " +
                     "VALUES (?, ?, ?, ?, CURRENT_DATE, CURRENT_TIMESTAMP) " +
                     "ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)";
        jdbcTemplate.update(sql, sessionId, studentId, status, remarks);
    }

    public static class StudentQrLookup {
        public Long studentId;
        public Long userId;
        public String studentIdNumber;
        public String fullName;
        public String email;
        public String userStatus;
        public Long batchId;
        public String batchName;
        public String avatarUrl;
        public String qrStatus;
    }

    public static class ExistingAttendanceInfo {
        public Long recordId;
        public String status;
        public java.sql.Timestamp markedAt;
        public String source;
        public String remarks;
    }

    public Optional<AttendanceDto.MyQrCodeResponse> getMyQrCode(Long userId) {
        String sql = "SELECT s.id AS student_id, s.student_id_number, u.full_name, u.email, s.phone, s.college, " +
                     "s.batch_id, b.name AS batch_name, c.title AS course_title, " +
                     "s.qr_token, s.qr_status, s.qr_generated_at " +
                     "FROM students s " +
                     "JOIN users u ON s.user_id = u.id " +
                     "LEFT JOIN batches b ON s.batch_id = b.id " +
                     "LEFT JOIN courses c ON b.course_id = c.id " +
                     "WHERE u.id = ?";
        try {
            AttendanceDto.MyQrCodeResponse res = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                AttendanceDto.MyQrCodeResponse r = new AttendanceDto.MyQrCodeResponse();
                r.setStudentId(rs.getLong("student_id"));
                r.setStudentIdNumber(rs.getString("student_id_number"));
                r.setFullName(rs.getString("full_name"));
                r.setEmail(rs.getString("email"));
                r.setPhone(rs.getString("phone"));
                r.setCollege(rs.getString("college"));
                r.setBatchId(rs.getObject("batch_id") != null ? rs.getLong("batch_id") : null);
                r.setBatchName(rs.getString("batch_name") != null ? rs.getString("batch_name") : "Java Full Stack Morning Batch 2026");
                r.setCourseTitle(rs.getString("course_title") != null ? rs.getString("course_title") : "Mastering Java Full Stack Engineering");
                r.setQrToken(rs.getString("qr_token"));
                r.setQrStatus(rs.getString("qr_status"));
                r.setQrGeneratedAt(rs.getTimestamp("qr_generated_at") != null ? rs.getTimestamp("qr_generated_at").toInstant().toString() : null);
                return r;
            }, userId);

            if (res != null && res.getQrToken() == null) {
                String newToken = "QR-" + java.util.UUID.randomUUID().toString().replace("-", "").toUpperCase();
                jdbcTemplate.update("UPDATE students SET qr_token = ?, qr_status = 'ACTIVE', qr_generated_at = CURRENT_TIMESTAMP WHERE id = ?",
                        newToken, res.getStudentId());
                res.setQrToken(newToken);
                res.setQrStatus("ACTIVE");
            }
            return Optional.ofNullable(res);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<StudentQrLookup> findStudentByQrToken(String qrToken) {
        String sql = "SELECT s.id AS student_id, s.user_id, s.student_id_number, u.full_name, u.email, u.status AS user_status, " +
                     "s.batch_id, b.name AS batch_name, s.avatar_url, s.qr_status " +
                     "FROM students s " +
                     "JOIN users u ON s.user_id = u.id " +
                     "LEFT JOIN batches b ON s.batch_id = b.id " +
                     "WHERE s.qr_token = ?";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                StudentQrLookup info = new StudentQrLookup();
                info.studentId = rs.getLong("student_id");
                info.userId = rs.getLong("user_id");
                info.studentIdNumber = rs.getString("student_id_number");
                info.fullName = rs.getString("full_name");
                info.email = rs.getString("email");
                info.userStatus = rs.getString("user_status");
                info.batchId = rs.getObject("batch_id") != null ? rs.getLong("batch_id") : null;
                info.batchName = rs.getString("batch_name") != null ? rs.getString("batch_name") : "Java Full Stack 2026";
                info.avatarUrl = rs.getString("avatar_url");
                info.qrStatus = rs.getString("qr_status");
                return info;
            }, qrToken));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Long findOrCreateTodaySessionForBatch(Long batchId, Long adminUserId) {
        Long targetBatchId = (batchId != null && batchId > 0) ? batchId : 1L;
        String sql = "SELECT id FROM attendance_sessions WHERE batch_id = ? AND session_date = CURRENT_DATE ORDER BY id DESC LIMIT 1";
        try {
            return jdbcTemplate.queryForObject(sql, Long.class, targetBatchId);
        } catch (EmptyResultDataAccessException e) {
            String insertSql = "INSERT INTO attendance_sessions (batch_id, title, session_date, start_time, end_time, created_by) " +
                               "VALUES (?, ?, CURRENT_DATE, '09:00:00', '11:00:00', ?)";
            KeyHolder kh = new GeneratedKeyHolder();
            jdbcTemplate.update(con -> {
                PreparedStatement ps = con.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, targetBatchId);
                ps.setString(2, "Classroom Lecture - " + java.time.LocalDate.now());
                ps.setLong(3, adminUserId != null ? adminUserId : 1L);
                return ps;
            }, kh);
            return kh.getKey() != null ? kh.getKey().longValue() : 1L;
        }
    }

    public Optional<ExistingAttendanceInfo> checkExistingAttendance(Long sessionId, Long studentId) {
        String sql = "SELECT id, status, marked_at, source, remarks FROM attendance_records WHERE session_id = ? AND student_id = ?";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                ExistingAttendanceInfo info = new ExistingAttendanceInfo();
                info.recordId = rs.getLong("id");
                info.status = rs.getString("status");
                info.markedAt = rs.getTimestamp("marked_at");
                info.source = rs.getString("source");
                info.remarks = rs.getString("remarks");
                return info;
            }, sessionId, studentId));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void recordQrAttendance(Long sessionId, Long studentId, Long adminId, String source, String deviceInfo) {
        String sql = "INSERT INTO attendance_records (session_id, student_id, status, marked_by, source, attendance_date, device_info, marked_at) " +
                     "VALUES (?, ?, 'PRESENT', ?, ?, CURRENT_DATE, ?, CURRENT_TIMESTAMP) " +
                     "ON DUPLICATE KEY UPDATE status = 'PRESENT', marked_by = VALUES(marked_by), source = VALUES(source), marked_at = CURRENT_TIMESTAMP";
        jdbcTemplate.update(sql, sessionId, studentId, adminId, source != null ? source : "QR_SCAN", deviceInfo);
    }

    public void logAudit(Long studentId, Long adminId, Long sessionId, String qrToken, String scanStatus, String deviceInfo, String ipAddress, String remarks) {
        String sql = "INSERT INTO attendance_audit_log (student_id, admin_id, session_id, qr_token_used, scan_status, attendance_date, scan_timestamp, device_info, ip_address, remarks) " +
                     "VALUES (?, ?, ?, ?, ?, CURRENT_DATE, CURRENT_TIMESTAMP, ?, ?, ?)";
        jdbcTemplate.update(sql, studentId, adminId, sessionId, qrToken, scanStatus, deviceInfo, ipAddress, remarks);
    }

    public AttendanceDto.CalendarAttendanceResponse getCalendarAttendance(Long userId, int year, int month) {
        AttendanceDto.CalendarAttendanceResponse resp = new AttendanceDto.CalendarAttendanceResponse();
        resp.setYear(year);
        resp.setMonth(month);

        String stSql = "SELECT id, batch_id FROM students WHERE user_id = ?";
        Long studentId;
        Long batchId;
        try {
            Map<String, Object> map = jdbcTemplate.queryForMap(stSql, userId);
            studentId = ((Number) map.get("id")).longValue();
            batchId = map.get("batch_id") != null ? ((Number) map.get("batch_id")).longValue() : 1L;
        } catch (EmptyResultDataAccessException e) {
            resp.setDays(List.of());
            return resp;
        }

        String sql = "SELECT s.id AS session_id, s.title, s.session_date, " +
                     "ar.status AS record_status, ar.marked_at, ar.source " +
                     "FROM attendance_sessions s " +
                     "LEFT JOIN attendance_records ar ON s.id = ar.session_id AND ar.student_id = ? " +
                     "WHERE s.batch_id = ? AND YEAR(s.session_date) = ? AND MONTH(s.session_date) = ? " +
                     "ORDER BY s.session_date ASC";

        List<AttendanceDto.CalendarDayStat> days = jdbcTemplate.query(sql, (rs, rowNum) -> {
            AttendanceDto.CalendarDayStat day = new AttendanceDto.CalendarDayStat();
            java.sql.Date d = rs.getDate("session_date");
            day.setDate(d.toString());
            day.setDayOfWeek(d.toLocalDate().getDayOfWeek().name());
            day.setSessionTitle(rs.getString("title"));
            String recStatus = rs.getString("record_status");
            if ("PRESENT".equalsIgnoreCase(recStatus)) {
                day.setStatus("PRESENT");
            } else if (recStatus != null) {
                day.setStatus(recStatus);
            } else {
                day.setStatus("ABSENT");
            }
            day.setMarkedAt(rs.getTimestamp("marked_at") != null ? rs.getTimestamp("marked_at").toInstant().toString() : null);
            day.setSource(rs.getString("source"));
            return day;
        }, studentId, batchId, year, month);

        int total = days.size();
        int present = 0;
        int absent = 0;
        for (AttendanceDto.CalendarDayStat d : days) {
            if ("PRESENT".equalsIgnoreCase(d.getStatus())) {
                present++;
            } else if ("ABSENT".equalsIgnoreCase(d.getStatus())) {
                absent++;
            }
        }

        resp.setTotalSessions(total);
        resp.setPresentCount(present);
        resp.setAbsentCount(absent);
        double pct = total > 0 ? ((double) present / total) * 100.0 : 100.0;
        resp.setAttendancePercentage(Math.round(pct * 10.0) / 10.0);
        resp.setDays(days);
        return resp;
    }

    public List<AttendanceDto.TodayScanItem> getTodayScans() {
        String sql = "SELECT ar.id, ar.student_id, s.student_id_number, u.full_name AS student_name, " +
                     "b.name AS batch_name, ar.status, ar.marked_at, admin_u.full_name AS marked_by_admin, " +
                     "ar.source, ar.remarks " +
                     "FROM attendance_records ar " +
                     "JOIN students s ON ar.student_id = s.id " +
                     "JOIN users u ON s.user_id = u.id " +
                     "LEFT JOIN batches b ON s.batch_id = b.id " +
                     "LEFT JOIN users admin_u ON ar.marked_by = admin_u.id " +
                     "WHERE ar.attendance_date = CURRENT_DATE " +
                     "ORDER BY ar.marked_at DESC LIMIT 100";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AttendanceDto.TodayScanItem item = new AttendanceDto.TodayScanItem();
            item.setRecordId(rs.getLong("id"));
            item.setStudentId(rs.getLong("student_id"));
            item.setStudentIdNumber(rs.getString("student_id_number"));
            item.setStudentName(rs.getString("student_name"));
            item.setBatchName(rs.getString("batch_name") != null ? rs.getString("batch_name") : "Java Full Stack 2026");
            item.setStatus(rs.getString("status"));
            item.setScanTime(rs.getTimestamp("marked_at") != null ? rs.getTimestamp("marked_at").toString() : "");
            item.setMarkedByAdminName(rs.getString("marked_by_admin") != null ? rs.getString("marked_by_admin") : "Admin Scanner");
            item.setSource(rs.getString("source") != null ? rs.getString("source") : "QR_SCAN");
            item.setRemarks(rs.getString("remarks"));
            return item;
        });
    }

    public void regenerateStudentQrToken(Long studentId, String newToken) {
        String sql = "UPDATE students SET qr_token = ?, qr_status = 'ACTIVE', qr_generated_at = CURRENT_TIMESTAMP WHERE id = ?";
        jdbcTemplate.update(sql, newToken, studentId);
    }

    public void revokeStudentQrToken(Long studentId) {
        String sql = "UPDATE students SET qr_status = 'REVOKED' WHERE id = ?";
        jdbcTemplate.update(sql, studentId);
    }
}

