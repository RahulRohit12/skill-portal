package com.skillportal.coding;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class CodingRepository {

    private final JdbcTemplate jdbcTemplate;

    public CodingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CodeExecutionEngine.TestCaseItem> findTestCasesByProblemId(Long problemId, boolean includeHidden) {
        String sql = includeHidden ?
                "SELECT id, input_data, expected_output, is_hidden FROM test_cases WHERE coding_problem_id = ? OR coding_problem_id IN (SELECT id FROM coding_problems WHERE question_id = ?) ORDER BY order_index ASC" :
                "SELECT id, input_data, expected_output, is_hidden FROM test_cases WHERE (coding_problem_id = ? OR coding_problem_id IN (SELECT id FROM coding_problems WHERE question_id = ?)) AND is_hidden = FALSE ORDER BY order_index ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new CodeExecutionEngine.TestCaseItem(
                rs.getLong("id"),
                rs.getString("input_data"),
                rs.getString("expected_output"),
                rs.getBoolean("is_hidden")
        ), problemId, problemId);
    }

    public Long saveSubmission(Long userId, Long problemId, Long questionId, String code, String language,
                               String status, int passed, int total, int runtimeMs, int memoryKb, String errorOutput) {
        String sql = "INSERT INTO coding_submissions (user_id, problem_id, question_id, code, language, status, " +
                     "passed_test_cases, total_test_cases, runtime_ms, memory_kb, error_output) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, userId);
            ps.setLong(2, problemId);
            ps.setLong(3, questionId);
            ps.setString(4, code);
            ps.setString(5, language);
            ps.setString(6, status);
            ps.setInt(7, passed);
            ps.setInt(8, total);
            ps.setInt(9, runtimeMs);
            ps.setInt(10, memoryKb);
            ps.setString(11, errorOutput);
            return ps;
        }, keyHolder);

        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public void updateQuestionAttempt(Long userId, Long questionId, Long assignmentId, String status, int marksObtained) {
        String sql = "INSERT INTO question_attempts (user_id, question_id, assignment_id, attempt_type, status, marks_obtained) " +
                     "VALUES (?, ?, ?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE status = VALUES(status), marks_obtained = GREATEST(marks_obtained, VALUES(marks_obtained))";
        String attemptType = assignmentId != null ? "ASSIGNMENT" : "PRACTICE";
        jdbcTemplate.update(sql, userId, questionId, assignmentId, attemptType, status, marksObtained);
    }

    public void awardPointsAndLogProgress(Long userId, Long questionId, int marks) {
        // Increment student profile total_points
        String pointSql = "UPDATE students SET total_points = total_points + ? WHERE user_id = ?";
        int updated = jdbcTemplate.update(pointSql, marks, userId);
        if (updated == 0) {
            String insertSql = "INSERT INTO students (user_id, student_id_number, total_points) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE total_points = total_points + ?";
            try {
                jdbcTemplate.update(insertSql, userId, "SX-" + userId, marks, marks);
            } catch (Exception ignored) {}
        }

        // Record progress event
        String progressSql = "INSERT INTO progress_events (user_id, event_type, reference_id, details) VALUES (?, 'QUESTION_SOLVED', ?, ?)";
        try {
            jdbcTemplate.update(progressSql, userId, questionId, "Solved coding problem for question " + questionId + " (" + marks + " pts)");
        } catch (Exception ignored) {}
    }

    public List<CodingDto.SubmissionHistoryItem> findSubmissions(Long userId, Long questionId) {
        String sql = "SELECT id, question_id, language, status, passed_test_cases, total_test_cases, runtime_ms, memory_kb, submitted_at " +
                     "FROM coding_submissions WHERE user_id = ? AND question_id = ? ORDER BY id DESC LIMIT 20";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            CodingDto.SubmissionHistoryItem item = new CodingDto.SubmissionHistoryItem();
            item.setId(rs.getLong("id"));
            item.setQuestionId(rs.getLong("question_id"));
            item.setLanguage(rs.getString("language"));
            item.setStatus(rs.getString("status"));
            item.setPassedCases(rs.getInt("passed_test_cases"));
            item.setTotalCases(rs.getInt("total_test_cases"));
            item.setRuntimeMs(rs.getInt("runtime_ms"));
            item.setMemoryKb(rs.getInt("memory_kb"));
            item.setSubmittedAt(rs.getTimestamp("submitted_at").toInstant().toString());
            return item;
        }, userId, questionId);
    }

    public Optional<CodingDto.SubmissionHistoryItem> findSubmissionById(Long id, Long userId) {
        String sql = "SELECT id, question_id, language, status, passed_test_cases, total_test_cases, runtime_ms, memory_kb, submitted_at " +
                     "FROM coding_submissions WHERE id = ? AND user_id = ?";
        try {
            CodingDto.SubmissionHistoryItem item = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                CodingDto.SubmissionHistoryItem i = new CodingDto.SubmissionHistoryItem();
                i.setId(rs.getLong("id"));
                i.setQuestionId(rs.getLong("question_id"));
                i.setLanguage(rs.getString("language"));
                i.setStatus(rs.getString("status"));
                i.setPassedCases(rs.getInt("passed_test_cases"));
                i.setTotalCases(rs.getInt("total_test_cases"));
                i.setRuntimeMs(rs.getInt("runtime_ms"));
                i.setMemoryKb(rs.getInt("memory_kb"));
                i.setSubmittedAt(rs.getTimestamp("submitted_at").toInstant().toString());
                return i;
            }, id, userId);
            return Optional.ofNullable(item);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public int getQuestionMarks(Long questionId) {
        String sql = "SELECT marks FROM questions WHERE id = ?";
        try {
            Integer marks = jdbcTemplate.queryForObject(sql, Integer.class, questionId);
            return marks != null ? marks : 10;
        } catch (Exception e) {
            return 10;
        }
    }

    public boolean isQuestionSolvedByUser(Long userId, Long questionId) {
        String sql = "SELECT COUNT(*) FROM question_attempts WHERE user_id = ? AND question_id = ? AND status = 'SOLVED'";
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId, questionId);
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    public int getStudentTotalPoints(Long userId) {
        String sql = "SELECT total_points FROM students WHERE user_id = ?";
        try {
            Integer p = jdbcTemplate.queryForObject(sql, Integer.class, userId);
            return p != null ? p : 0;
        } catch (Exception e) {
            return 0;
        }
    }
}
