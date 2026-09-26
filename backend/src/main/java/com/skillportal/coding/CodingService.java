package com.skillportal.coding;

import com.skillportal.dashboard.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CodingService {

    private final CodingRepository codingRepository;
    private final CodeExecutionEngine codeExecutionEngine;
    private final DashboardService dashboardService;

    public CodingService(CodingRepository codingRepository, CodeExecutionEngine codeExecutionEngine, DashboardService dashboardService) {
        this.codingRepository = codingRepository;
        this.codeExecutionEngine = codeExecutionEngine;
        this.dashboardService = dashboardService;
    }

    public CodingDto.RunCodeResponse runCode(CodingDto.RunCodeRequest request) {
        List<CodeExecutionEngine.TestCaseItem> testCases;
        if (request.getCustomInput() != null && !request.getCustomInput().isBlank()) {
            testCases = List.of(new CodeExecutionEngine.TestCaseItem(0L, request.getCustomInput(), "", false));
        } else {
            // Load visible sample test cases only
            testCases = codingRepository.findTestCasesByProblemId(request.getProblemId(), false);
        }

        CodeExecutionEngine.ExecutionRequest execReq = new CodeExecutionEngine.ExecutionRequest(
                request.getCode(),
                request.getLanguage(),
                testCases,
                2000,
                256
        );

        CodeExecutionEngine.ExecutionResult execRes = codeExecutionEngine.execute(execReq);

        CodingDto.RunCodeResponse response = new CodingDto.RunCodeResponse();
        response.setStatus(execRes.getStatus());
        response.setPassedCount(execRes.getPassedCount());
        response.setTotalCount(execRes.getTotalCount());
        response.setRuntimeMs(execRes.getRuntimeMs());
        response.setMemoryKb(execRes.getMemoryKb());
        response.setCompileOutput(execRes.getCompileOutput());
        response.setTestCaseResults(execRes.getTestCaseResults());

        return response;
    }

    @Transactional
    public CodingDto.SubmitCodeResponse submitCode(Long userId, CodingDto.SubmitCodeRequest request) {
        // Load ALL test cases (visible + hidden)
        List<CodeExecutionEngine.TestCaseItem> testCases = codingRepository.findTestCasesByProblemId(request.getProblemId(), true);

        CodeExecutionEngine.ExecutionRequest execReq = new CodeExecutionEngine.ExecutionRequest(
                request.getCode(),
                request.getLanguage(),
                testCases,
                2000,
                256
        );

        CodeExecutionEngine.ExecutionResult execRes = codeExecutionEngine.execute(execReq);

        int maxMarks = codingRepository.getQuestionMarks(request.getQuestionId());
        int marksAwarded = 0;
        if ("ACCEPTED".equals(execRes.getStatus())) {
            marksAwarded = maxMarks;
        } else if (execRes.getTotalCount() > 0) {
            // Partial marks support (Requirement 22)
            marksAwarded = (int) Math.round(((double) execRes.getPassedCount() / execRes.getTotalCount()) * maxMarks);
        }

        // Save submission to database
        Long submissionId = codingRepository.saveSubmission(
                userId,
                request.getProblemId(),
                request.getQuestionId(),
                request.getCode(),
                request.getLanguage(),
                execRes.getStatus(),
                execRes.getPassedCount(),
                execRes.getTotalCount(),
                execRes.getRuntimeMs(),
                execRes.getMemoryKb(),
                execRes.getCompileOutput()
        );

        // Update Question Attempts
        String attemptStatus = "ACCEPTED".equals(execRes.getStatus()) ? "SOLVED" : "ATTEMPTED";
        codingRepository.updateQuestionAttempt(userId, request.getQuestionId(), request.getAssignmentId(), attemptStatus, marksAwarded);

        if ("ACCEPTED".equals(execRes.getStatus())) {
            codingRepository.awardPointsAndLogProgress(userId, request.getQuestionId(), marksAwarded);
            dashboardService.clearCache(null); // Invalidate leaderboard and dashboard cache across all users in real time
        }

        CodingDto.SubmitCodeResponse response = new CodingDto.SubmitCodeResponse();
        response.setSubmissionId(submissionId);
        response.setStatus(execRes.getStatus());
        response.setPassedTestCases(execRes.getPassedCount());
        response.setTotalTestCases(execRes.getTotalCount());
        response.setRuntimeMs(execRes.getRuntimeMs());
        response.setMemoryKb(execRes.getMemoryKb());
        response.setMarksAwarded(marksAwarded);
        response.setCompileOutput(execRes.getCompileOutput());
        response.setTestCaseResults(execRes.getTestCaseResults());

        return response;
    }

    @Transactional
    public void recordSolved(Long userId, CodingDto.RecordSolvedRequest req) {
        Long questionId = req.getQuestionId();
        if (questionId == null) return;
        int marks = req.getMarks() > 0 ? req.getMarks() : codingRepository.getQuestionMarks(questionId);

        boolean alreadySolved = codingRepository.isQuestionSolvedByUser(userId, questionId);

        // Record question attempt as SOLVED
        codingRepository.updateQuestionAttempt(userId, questionId, req.getAssignmentId(), "SOLVED", marks);

        // Save submission record
        codingRepository.saveSubmission(
                userId,
                questionId,
                questionId,
                req.getCode() != null ? req.getCode() : "// Solved via online execution",
                req.getLanguage() != null ? req.getLanguage() : "JAVA",
                "ACCEPTED",
                1,
                1,
                req.getRuntimeMs() > 0 ? req.getRuntimeMs() : 120,
                1024,
                ""
        );

        if (!alreadySolved) {
            codingRepository.awardPointsAndLogProgress(userId, questionId, marks);
        }

        // Bust leaderboard cache for all students so dashboard leaderboard updates immediately
        dashboardService.clearCache(null);
    }

    public List<CodingDto.SubmissionHistoryItem> getSubmissionHistory(Long userId, Long questionId) {
        return codingRepository.findSubmissions(userId, questionId);
    }
}
