package com.skillportal.assignment;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class AssignmentRepository {

    private final JdbcTemplate jdbcTemplate;

    public AssignmentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AssignmentDto.AssignmentSummary> findAllAssignments(Long userId) {
        String sql = "SELECT * FROM assignments WHERE is_published = TRUE AND is_deleted = FALSE ORDER BY id ASC";
        List<AssignmentDto.AssignmentSummary> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
            AssignmentDto.AssignmentSummary a = new AssignmentDto.AssignmentSummary();
            a.setId(rs.getLong("id"));
            a.setTitle(rs.getString("title"));
            a.setDescription(rs.getString("description"));
            a.setDifficulty(rs.getString("difficulty"));
            a.setTotalMarks(rs.getInt("total_marks"));
            a.setTimeLimitMinutes(rs.getInt("time_limit_minutes"));
            a.setStatus("NOT_STARTED");
            return a;
        });

        if (list.isEmpty()) {
            return list;
        }

        // 1. Batch load all sections for all published assignments
        String secSql = "SELECT s.id, s.assignment_id, s.section_number, s.topic_name, s.title, s.description " +
                        "FROM assignment_sections s " +
                        "JOIN assignments a ON s.assignment_id = a.id " +
                        "WHERE a.is_published = TRUE AND a.is_deleted = FALSE " +
                        "ORDER BY s.assignment_id ASC, s.section_number ASC";

        List<AssignmentDto.SectionSummary> allSections = jdbcTemplate.query(secSql, (rs, rowNum) -> {
            AssignmentDto.SectionSummary s = new AssignmentDto.SectionSummary();
            s.setId(rs.getLong("id"));
            s.setAssignmentId(rs.getLong("assignment_id"));
            s.setSectionNumber(rs.getInt("section_number"));
            s.setTopicName(rs.getString("topic_name"));
            s.setTitle(rs.getString("title"));
            s.setDescription(rs.getString("description"));
            return s;
        });

        // 2. Batch load all questions & attempt statuses across all sections
        String qSql;
        Object[] qParams;
        if (userId != null) {
            qSql = "SELECT aq.section_id, s.assignment_id, q.id AS question_id, q.marks, " +
                   "qa.status AS attempt_status, qa.marks_obtained " +
                   "FROM assignment_questions aq " +
                   "JOIN questions q ON aq.question_id = q.id " +
                   "JOIN assignment_sections s ON aq.section_id = s.id " +
                   "JOIN assignments a ON s.assignment_id = a.id " +
                   "LEFT JOIN (" +
                   "    SELECT qa1.question_id, qa1.status, qa1.marks_obtained " +
                   "    FROM question_attempts qa1 " +
                   "    INNER JOIN (" +
                   "        SELECT question_id, MAX(id) AS max_id " +
                   "        FROM question_attempts " +
                   "        WHERE user_id = ? " +
                   "        GROUP BY question_id " +
                   "    ) qa2 ON qa1.id = qa2.max_id " +
                   ") qa ON q.id = qa.question_id " +
                   "WHERE a.is_published = TRUE AND a.is_deleted = FALSE " +
                   "ORDER BY s.assignment_id ASC, s.section_number ASC, aq.order_index ASC";
            qParams = new Object[]{userId};
        } else {
            qSql = "SELECT aq.section_id, s.assignment_id, q.id AS question_id, q.marks, " +
                   "'NOT_ATTEMPTED' AS attempt_status, 0 AS marks_obtained " +
                   "FROM assignment_questions aq " +
                   "JOIN questions q ON aq.question_id = q.id " +
                   "JOIN assignment_sections s ON aq.section_id = s.id " +
                   "JOIN assignments a ON s.assignment_id = a.id " +
                   "WHERE a.is_published = TRUE AND a.is_deleted = FALSE " +
                   "ORDER BY s.assignment_id ASC, s.section_number ASC, aq.order_index ASC";
            qParams = new Object[]{};
        }

        // Section stats aggregation container
        class SectionStat {
            int qCount = 0;
            int solvedCount = 0;
            int marksObtained = 0;
        }

        Map<Long, SectionStat> statsBySectionId = new HashMap<>();
        jdbcTemplate.query(qSql, rs -> {
            Long secId = rs.getLong("section_id");
            SectionStat stat = statsBySectionId.computeIfAbsent(secId, k -> new SectionStat());
            stat.qCount++;
            String status = rs.getString("attempt_status");
            if ("SOLVED".equalsIgnoreCase(status)) {
                stat.solvedCount++;
                stat.marksObtained += rs.getInt("marks_obtained");
            }
        }, qParams);

        // Group sections by assignment_id
        Map<Long, List<AssignmentDto.SectionSummary>> sectionsByAssignmentId = new HashMap<>();
        for (AssignmentDto.SectionSummary s : allSections) {
            SectionStat stat = statsBySectionId.getOrDefault(s.getId(), new SectionStat());
            s.setQuestionCount(stat.qCount);
            s.setSolvedCount(stat.solvedCount);
            s.setMarksObtained(stat.marksObtained);
            sectionsByAssignmentId.computeIfAbsent(s.getAssignmentId(), k -> new ArrayList<>()).add(s);
        }

        // Aggregate statistics per assignment
        for (AssignmentDto.AssignmentSummary a : list) {
            List<AssignmentDto.SectionSummary> sections = sectionsByAssignmentId.getOrDefault(a.getId(), Collections.emptyList());
            a.setTotalSections(sections.size());

            int completedSec = 0;
            int totalQ = 0;
            int solvedQ = 0;
            int marksObtained = 0;
            boolean previousSectionCompleted = true;

            for (AssignmentDto.SectionSummary s : sections) {
                if (!previousSectionCompleted) {
                    s.setLocked(true);
                    s.setStatus("LOCKED");
                } else {
                    s.setLocked(false);
                    if (s.getSolvedCount() == s.getQuestionCount() && s.getQuestionCount() > 0) {
                        s.setStatus("COMPLETED");
                    } else if (s.getSolvedCount() > 0) {
                        s.setStatus("IN_PROGRESS");
                    } else {
                        s.setStatus("AVAILABLE");
                    }
                }

                if ("COMPLETED".equals(s.getStatus())) {
                    completedSec++;
                }
                totalQ += s.getQuestionCount();
                solvedQ += s.getSolvedCount();
                marksObtained += s.getMarksObtained();

                previousSectionCompleted = "COMPLETED".equals(s.getStatus());
            }

            a.setCompletedSections(completedSec);
            a.setTotalQuestions(totalQ);
            a.setSolvedQuestions(solvedQ);
            a.setMarksObtained(marksObtained);

            double pct = a.getTotalMarks() > 0 ? ((double) marksObtained / a.getTotalMarks()) * 100.0 : 0.0;
            a.setPercentage(Math.round(pct * 10.0) / 10.0);

            if (solvedQ == totalQ && totalQ > 0) {
                a.setStatus("COMPLETED");
            } else if (solvedQ > 0) {
                a.setStatus("IN_PROGRESS");
            } else {
                a.setStatus("NOT_STARTED");
            }
        }

        return list;
    }

    public Optional<AssignmentDto.AssignmentDetail> findAssignmentById(Long id, Long userId) {
        String sql = "SELECT * FROM assignments WHERE id = ? AND is_published = TRUE AND is_deleted = FALSE";
        try {
            AssignmentDto.AssignmentDetail detail = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                AssignmentDto.AssignmentDetail a = new AssignmentDto.AssignmentDetail();
                a.setId(rs.getLong("id"));
                a.setTitle(rs.getString("title"));
                a.setDescription(rs.getString("description"));
                a.setDifficulty(rs.getString("difficulty"));
                a.setTotalMarks(rs.getInt("total_marks"));
                a.setTimeLimitMinutes(rs.getInt("time_limit_minutes"));
                return a;
            }, id);

            if (detail != null) {
                detail.setSections(findSectionsByAssignmentId(id, userId));

                int totalMarksObtained = 0;
                for (AssignmentDto.SectionSummary s : detail.getSections()) {
                    totalMarksObtained += s.getMarksObtained();
                }
                detail.setMarksObtained(totalMarksObtained);
                double pct = detail.getTotalMarks() > 0 ? ((double) totalMarksObtained / detail.getTotalMarks()) * 100.0 : 0.0;
                detail.setPercentage(Math.round(pct * 10.0) / 10.0);
            }
            return Optional.ofNullable(detail);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<AssignmentDto.SectionSummary> findSectionsByAssignmentId(Long assignmentId, Long userId) {
        String sql = "SELECT * FROM assignment_sections WHERE assignment_id = ? ORDER BY section_number ASC";
        List<AssignmentDto.SectionSummary> sections = jdbcTemplate.query(sql, (rs, rowNum) -> {
            AssignmentDto.SectionSummary s = new AssignmentDto.SectionSummary();
            s.setId(rs.getLong("id"));
            s.setAssignmentId(rs.getLong("assignment_id"));
            s.setSectionNumber(rs.getInt("section_number"));
            s.setTopicName(rs.getString("topic_name"));
            s.setTitle(rs.getString("title"));
            s.setDescription(rs.getString("description"));
            s.setQuestions(new ArrayList<>());
            return s;
        }, assignmentId);

        if (sections.isEmpty()) {
            return sections;
        }

        // Batch load all questions across all sections of this assignment in a single query
        String qSql;
        Object[] qParams;
        if (userId != null) {
            qSql = "SELECT aq.section_id, q.id, q.title, q.question_type, q.difficulty, q.marks, " +
                   "qa.status AS attempt_status, qa.marks_obtained, " +
                   "(CASE WHEN bm.id IS NOT NULL THEN 1 ELSE 0 END) AS is_bm " +
                   "FROM assignment_questions aq " +
                   "JOIN questions q ON aq.question_id = q.id " +
                   "JOIN assignment_sections s ON aq.section_id = s.id " +
                   "LEFT JOIN (" +
                   "    SELECT qa1.question_id, qa1.status, qa1.marks_obtained " +
                   "    FROM question_attempts qa1 " +
                   "    INNER JOIN (" +
                   "        SELECT question_id, MAX(id) AS max_id " +
                   "        FROM question_attempts " +
                   "        WHERE user_id = ? " +
                   "        GROUP BY question_id " +
                   "    ) qa2 ON qa1.id = qa2.max_id " +
                   ") qa ON q.id = qa.question_id " +
                   "LEFT JOIN bookmarks bm ON bm.user_id = ? AND bm.target_type = 'QUESTION' AND bm.target_id = q.id " +
                   "WHERE s.assignment_id = ? " +
                   "ORDER BY s.section_number ASC, aq.order_index ASC";
            qParams = new Object[]{userId, userId, assignmentId};
        } else {
            qSql = "SELECT aq.section_id, q.id, q.title, q.question_type, q.difficulty, q.marks, " +
                   "'NOT_ATTEMPTED' AS attempt_status, 0 AS marks_obtained, 0 AS is_bm " +
                   "FROM assignment_questions aq " +
                   "JOIN questions q ON aq.question_id = q.id " +
                   "JOIN assignment_sections s ON aq.section_id = s.id " +
                   "WHERE s.assignment_id = ? " +
                   "ORDER BY s.section_number ASC, aq.order_index ASC";
            qParams = new Object[]{assignmentId};
        }

        Map<Long, List<AssignmentDto.QuestionSummary>> questionsBySectionId = new HashMap<>();
        jdbcTemplate.query(qSql, rs -> {
            AssignmentDto.QuestionSummary q = new AssignmentDto.QuestionSummary();
            q.setId(rs.getLong("id"));
            q.setTitle(rs.getString("title"));
            q.setQuestionType(rs.getString("question_type"));
            q.setDifficulty(rs.getString("difficulty"));
            q.setMarks(rs.getInt("marks"));
            String attStatus = rs.getString("attempt_status");
            q.setStatus(attStatus != null ? attStatus : "NOT_ATTEMPTED");
            q.setMarksObtained(rs.getInt("marks_obtained"));
            q.setBookmarked(rs.getInt("is_bm") > 0);

            Long secId = rs.getLong("section_id");
            questionsBySectionId.computeIfAbsent(secId, k -> new ArrayList<>()).add(q);
        }, qParams);

        boolean previousSectionCompleted = true; // Section 1 is always unlocked

        for (AssignmentDto.SectionSummary s : sections) {
            List<AssignmentDto.QuestionSummary> questions = questionsBySectionId.getOrDefault(s.getId(), Collections.emptyList());
            s.setQuestions(questions);
            s.setQuestionCount(questions.size());

            int solved = 0;
            int marksObtained = 0;
            int totalMarks = 0;
            for (AssignmentDto.QuestionSummary q : questions) {
                totalMarks += q.getMarks();
                if ("SOLVED".equals(q.getStatus())) {
                    solved++;
                    marksObtained += q.getMarksObtained();
                }
            }
            s.setSolvedCount(solved);
            s.setTotalMarks(totalMarks);
            s.setMarksObtained(marksObtained);

            // Sequential unlocking rule (Requirement 15):
            if (!previousSectionCompleted) {
                s.setLocked(true);
                s.setStatus("LOCKED");
            } else {
                s.setLocked(false);
                if (s.getSolvedCount() == s.getQuestionCount() && s.getQuestionCount() > 0) {
                    s.setStatus("COMPLETED");
                } else if (s.getSolvedCount() > 0) {
                    s.setStatus("IN_PROGRESS");
                } else {
                    s.setStatus("AVAILABLE");
                }
            }

            previousSectionCompleted = "COMPLETED".equals(s.getStatus());
        }

        return sections;
    }

    public Optional<AssignmentDto.SectionSummary> findSectionById(Long sectionId, Long userId) {
        String sql = "SELECT * FROM assignment_sections WHERE id = ?";
        try {
            AssignmentDto.SectionSummary s = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                AssignmentDto.SectionSummary sec = new AssignmentDto.SectionSummary();
                sec.setId(rs.getLong("id"));
                sec.setAssignmentId(rs.getLong("assignment_id"));
                sec.setSectionNumber(rs.getInt("section_number"));
                sec.setTopicName(rs.getString("topic_name"));
                sec.setTitle(rs.getString("title"));
                sec.setDescription(rs.getString("description"));
                return sec;
            }, sectionId);

            if (s != null) {
                List<AssignmentDto.SectionSummary> allSections = findSectionsByAssignmentId(s.getAssignmentId(), userId);
                for (AssignmentDto.SectionSummary item : allSections) {
                    if (item.getId().equals(sectionId)) {
                        return Optional.of(item);
                    }
                }
            }
            return Optional.ofNullable(s);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public AssignmentDto.SectionSummary createSection(Long assignmentId, String topicName, String title, String description) {
        String numSql = "SELECT COALESCE(MAX(section_number), 0) + 1 FROM assignment_sections WHERE assignment_id = ?";
        Integer nextSecNum = jdbcTemplate.queryForObject(numSql, Integer.class, assignmentId);
        int sectionNum = nextSecNum != null ? nextSecNum : 1;

        String insertSql = "INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index) VALUES (?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        final String effectiveTopic = (topicName != null && !topicName.trim().isEmpty()) ? topicName.trim() : "General";
        final String effectiveTitle = (title != null && !title.trim().isEmpty()) ? title.trim() : "New Topic";
        final String effectiveDesc = description != null ? description : "";

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, assignmentId);
            ps.setInt(2, sectionNum);
            ps.setString(3, effectiveTopic);
            ps.setString(4, effectiveTitle);
            ps.setString(5, effectiveDesc);
            ps.setInt(6, sectionNum);
            return ps;
        }, keyHolder);

        Long secId = keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;

        AssignmentDto.SectionSummary s = new AssignmentDto.SectionSummary();
        s.setId(secId);
        s.setAssignmentId(assignmentId);
        s.setSectionNumber(sectionNum);
        s.setTopicName(effectiveTopic);
        s.setTitle(effectiveTitle);
        s.setDescription(effectiveDesc);
        s.setStatus("AVAILABLE");
        s.setQuestions(new ArrayList<>());
        return s;
    }

    public List<AssignmentDto.QuestionSummary> createQuestionsForSection(Long sectionId, List<AssignmentDto.CreateQuestionItem> items) {
        String secSql = "SELECT assignment_id FROM assignment_sections WHERE id = ?";
        Long assignmentId = jdbcTemplate.queryForObject(secSql, Long.class, sectionId);

        String orderSql = "SELECT COALESCE(MAX(order_index), 0) FROM assignment_questions WHERE section_id = ?";
        Integer maxOrder = jdbcTemplate.queryForObject(orderSql, Integer.class, sectionId);
        int currentOrder = maxOrder != null ? maxOrder : 0;

        List<AssignmentDto.QuestionSummary> createdList = new ArrayList<>();
        int totalNewMarks = 0;

        for (AssignmentDto.CreateQuestionItem item : items) {
            currentOrder++;
            int marks = item.getMarks() > 0 ? item.getMarks() : 10;
            String difficulty = (item.getDifficulty() != null && !item.getDifficulty().isBlank()) ? item.getDifficulty().toUpperCase() : "EASY";

            // 1. Insert into questions
            String qSql = "INSERT INTO questions (title, description, question_type, difficulty, marks, is_active, current_version) VALUES (?, ?, 'CODING', ?, ?, TRUE, 1)";
            KeyHolder qKeyHolder = new GeneratedKeyHolder();
            final String qTitle = item.getTitle();
            final String qDesc = item.getDescription() != null ? item.getDescription() : item.getTitle();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(qSql, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, qTitle);
                ps.setString(2, qDesc);
                ps.setString(3, difficulty);
                ps.setInt(4, marks);
                return ps;
            }, qKeyHolder);
            Long questionId = qKeyHolder.getKey() != null ? qKeyHolder.getKey().longValue() : null;
            if (questionId == null) continue;

            // 2. Insert into coding_problems
            String defaultStarter = "import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Write solution here\n    }\n}";
            String starter = (item.getStarterCodeJava() != null && !item.getStarterCodeJava().isBlank()) ? item.getStarterCodeJava() : defaultStarter;

            String cpSql = "INSERT INTO coding_problems (question_id, problem_statement, input_format, output_format, constraints, starter_code_java, time_limit_ms, memory_limit_mb) VALUES (?, ?, ?, ?, ?, ?, 2000, 256)";
            KeyHolder cpKeyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(cpSql, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, questionId);
                ps.setString(2, qDesc);
                ps.setString(3, item.getInputFormat() != null ? item.getInputFormat() : "");
                ps.setString(4, item.getOutputFormat() != null ? item.getOutputFormat() : "");
                ps.setString(5, item.getConstraints() != null ? item.getConstraints() : "");
                ps.setString(6, starter);
                return ps;
            }, cpKeyHolder);
            Long codingProblemId = cpKeyHolder.getKey() != null ? cpKeyHolder.getKey().longValue() : questionId;

            // 3. Insert test cases
            if (item.getTestCases() != null && !item.getTestCases().isEmpty()) {
                String tcSql = "INSERT INTO test_cases (coding_problem_id, input_data, expected_output, is_hidden, order_index) VALUES (?, ?, ?, ?, ?)";
                int tcOrder = 1;
                for (AssignmentDto.TestCaseItem tc : item.getTestCases()) {
                    jdbcTemplate.update(tcSql, codingProblemId,
                            tc.getInputData() != null ? tc.getInputData() : "",
                            tc.getExpectedOutput() != null ? tc.getExpectedOutput() : "",
                            tc.isHidden(),
                            tcOrder++);
                }
            } else {
                String tcSql = "INSERT INTO test_cases (coding_problem_id, input_data, expected_output, is_hidden, order_index) VALUES (?, '1', '1', FALSE, 1)";
                jdbcTemplate.update(tcSql, codingProblemId);
            }

            // 4. Link into assignment_questions
            String linkSql = "INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index) VALUES (?, ?, ?)";
            jdbcTemplate.update(linkSql, sectionId, questionId, currentOrder);

            totalNewMarks += marks;

            AssignmentDto.QuestionSummary summary = new AssignmentDto.QuestionSummary();
            summary.setId(questionId);
            summary.setTitle(item.getTitle());
            summary.setQuestionType("CODING");
            summary.setDifficulty(difficulty);
            summary.setMarks(marks);
            summary.setStatus("NOT_ATTEMPTED");
            summary.setMarksObtained(0);
            summary.setBookmarked(false);
            createdList.add(summary);
        }

        // 5. Update assignment total_marks
        if (assignmentId != null && totalNewMarks > 0) {
            String updSql = "UPDATE assignments SET total_marks = total_marks + ? WHERE id = ?";
            jdbcTemplate.update(updSql, totalNewMarks, assignmentId);
        }

        return createdList;
    }
}
