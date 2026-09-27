package com.skillportal.live;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.List;
import java.util.Optional;

@Repository
public class LiveClassRepository {

    private final JdbcTemplate jdbcTemplate;

    public LiveClassRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long findStudentBatchId(Long userId) {
        if (userId == null) return null;
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT batch_id FROM students WHERE user_id = ?",
                    Long.class,
                    userId
            );
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Optional<LiveClassDto.LiveClassResponse> findActiveByBatchId(Long batchId) {
        if (batchId == null) return Optional.empty();
        String sql = "SELECT lc.id, lc.course_id, c.title AS course_title, lc.batch_id, b.name AS batch_name, " +
                "lc.title, lc.description, lc.instructor_name, lc.meeting_link, lc.status, " +
                "lc.started_at, lc.ended_at, lc.created_at " +
                "FROM live_classes lc " +
                "JOIN batches b ON lc.batch_id = b.id " +
                "LEFT JOIN courses c ON lc.course_id = c.id " +
                "WHERE lc.batch_id = ? AND lc.status = 'ACTIVE' " +
                "ORDER BY lc.id DESC LIMIT 1";
        List<LiveClassDto.LiveClassResponse> results = jdbcTemplate.query(sql, this::mapRow, batchId);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public List<LiveClassDto.LiveClassResponse> findAllActive() {
        String sql = "SELECT lc.id, lc.course_id, c.title AS course_title, lc.batch_id, b.name AS batch_name, " +
                "lc.title, lc.description, lc.instructor_name, lc.meeting_link, lc.status, " +
                "lc.started_at, lc.ended_at, lc.created_at " +
                "FROM live_classes lc " +
                "JOIN batches b ON lc.batch_id = b.id " +
                "LEFT JOIN courses c ON lc.course_id = c.id " +
                "WHERE lc.status = 'ACTIVE' " +
                "ORDER BY lc.id DESC";
        return jdbcTemplate.query(sql, this::mapRow);
    }

    public Optional<LiveClassDto.LiveClassResponse> findById(Long id) {
        if (id == null) return Optional.empty();
        String sql = "SELECT lc.id, lc.course_id, c.title AS course_title, lc.batch_id, b.name AS batch_name, " +
                "lc.title, lc.description, lc.instructor_name, lc.meeting_link, lc.status, " +
                "lc.started_at, lc.ended_at, lc.created_at " +
                "FROM live_classes lc " +
                "JOIN batches b ON lc.batch_id = b.id " +
                "LEFT JOIN courses c ON lc.course_id = c.id " +
                "WHERE lc.id = ?";
        List<LiveClassDto.LiveClassResponse> results = jdbcTemplate.query(sql, this::mapRow, id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public void endActiveSessionsForBatch(Long batchId) {
        if (batchId == null) return;
        jdbcTemplate.update(
                "UPDATE live_classes SET status = 'ENDED', ended_at = CURRENT_TIMESTAMP WHERE batch_id = ? AND status = 'ACTIVE'",
                batchId
        );
    }

    public Long startLiveClass(LiveClassDto.StartLiveClassRequest req, Long userId) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO live_classes (course_id, batch_id, title, description, instructor_name, meeting_link, status, started_at, created_by) " +
                            "VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', CURRENT_TIMESTAMP, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            if (req.getCourseId() != null) {
                ps.setLong(1, req.getCourseId());
            } else {
                ps.setNull(1, Types.BIGINT);
            }
            ps.setLong(2, req.getBatchId());
            ps.setString(3, req.getTitle().trim());
            if (req.getDescription() != null && !req.getDescription().isBlank()) {
                ps.setString(4, req.getDescription().trim());
            } else {
                ps.setNull(4, Types.VARCHAR);
            }
            ps.setString(5, req.getInstructorName().trim());
            ps.setString(6, req.getMeetingLink().trim());
            if (userId != null) {
                ps.setLong(7, userId);
            } else {
                ps.setNull(7, Types.BIGINT);
            }
            return ps;
        }, keyHolder);

        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public boolean endLiveClass(Long id) {
        if (id == null) return false;
        int updated = jdbcTemplate.update(
                "UPDATE live_classes SET status = 'ENDED', ended_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'ACTIVE'",
                id
        );
        return updated > 0;
    }

    private LiveClassDto.LiveClassResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
        LiveClassDto.LiveClassResponse item = new LiveClassDto.LiveClassResponse();
        item.setId(rs.getLong("id"));
        long courseId = rs.getLong("course_id");
        if (!rs.wasNull()) {
            item.setCourseId(courseId);
        }
        item.setCourseTitle(rs.getString("course_title"));
        item.setBatchId(rs.getLong("batch_id"));
        item.setBatchName(rs.getString("batch_name"));
        item.setTitle(rs.getString("title"));
        item.setDescription(rs.getString("description"));
        item.setInstructorName(rs.getString("instructor_name"));
        item.setMeetingLink(rs.getString("meeting_link"));
        item.setStatus(rs.getString("status"));

        Timestamp startedAt = rs.getTimestamp("started_at");
        if (startedAt != null) item.setStartedAt(startedAt.toInstant());

        Timestamp endedAt = rs.getTimestamp("ended_at");
        if (endedAt != null) item.setEndedAt(endedAt.toInstant());

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) item.setCreatedAt(createdAt.toInstant());

        return item;
    }
}
