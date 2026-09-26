package com.skillportal.coding;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CodingDto {

    public static class RunCodeRequest {
        @NotNull(message = "Problem ID is required")
        private Long problemId;

        @NotBlank(message = "Code is required")
        private String code;

        @NotBlank(message = "Language is required")
        private String language;

        private String customInput;

        public Long getProblemId() { return problemId; }
        public void setProblemId(Long problemId) { this.problemId = problemId; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }

        public String getCustomInput() { return customInput; }
        public void setCustomInput(String customInput) { this.customInput = customInput; }
    }

    public static class RunCodeResponse {
        private String status;
        private int passedCount;
        private int totalCount;
        private int runtimeMs;
        private int memoryKb;
        private String compileOutput;
        private List<CodeExecutionEngine.TestCaseResult> testCaseResults;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getPassedCount() { return passedCount; }
        public void setPassedCount(int passedCount) { this.passedCount = passedCount; }

        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }

        public int getRuntimeMs() { return runtimeMs; }
        public void setRuntimeMs(int runtimeMs) { this.runtimeMs = runtimeMs; }

        public int getMemoryKb() { return memoryKb; }
        public void setMemoryKb(int memoryKb) { this.memoryKb = memoryKb; }

        public String getCompileOutput() { return compileOutput; }
        public void setCompileOutput(String compileOutput) { this.compileOutput = compileOutput; }

        public List<CodeExecutionEngine.TestCaseResult> getTestCaseResults() { return testCaseResults; }
        public void setTestCaseResults(List<CodeExecutionEngine.TestCaseResult> testCaseResults) { this.testCaseResults = testCaseResults; }
    }

    public static class SubmitCodeRequest {
        @NotNull(message = "Problem ID is required")
        private Long problemId;

        @NotNull(message = "Question ID is required")
        private Long questionId;

        @NotBlank(message = "Code is required")
        private String code;

        @NotBlank(message = "Language is required")
        private String language;

        private Long assignmentId;

        public Long getProblemId() { return problemId; }
        public void setProblemId(Long problemId) { this.problemId = problemId; }

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }

        public Long getAssignmentId() { return assignmentId; }
        public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    }

    public static class SubmitCodeResponse {
        private Long submissionId;
        private String status;
        private int passedTestCases;
        private int totalTestCases;
        private int runtimeMs;
        private int memoryKb;
        private int marksAwarded;
        private String compileOutput;
        private List<CodeExecutionEngine.TestCaseResult> testCaseResults;

        public Long getSubmissionId() { return submissionId; }
        public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getPassedTestCases() { return passedTestCases; }
        public void setPassedTestCases(int passedTestCases) { this.passedTestCases = passedTestCases; }

        public int getTotalTestCases() { return totalTestCases; }
        public void setTotalTestCases(int totalTestCases) { this.totalTestCases = totalTestCases; }

        public int getRuntimeMs() { return runtimeMs; }
        public void setRuntimeMs(int runtimeMs) { this.runtimeMs = runtimeMs; }

        public int getMemoryKb() { return memoryKb; }
        public void setMemoryKb(int memoryKb) { this.memoryKb = memoryKb; }

        public int getMarksAwarded() { return marksAwarded; }
        public void setMarksAwarded(int marksAwarded) { this.marksAwarded = marksAwarded; }

        public String getCompileOutput() { return compileOutput; }
        public void setCompileOutput(String compileOutput) { this.compileOutput = compileOutput; }

        public List<CodeExecutionEngine.TestCaseResult> getTestCaseResults() { return testCaseResults; }
        public void setTestCaseResults(List<CodeExecutionEngine.TestCaseResult> testCaseResults) { this.testCaseResults = testCaseResults; }
    }

    public static class SubmissionHistoryItem {
        private Long id;
        private Long questionId;
        private String language;
        private String status;
        private int passedCases;
        private int totalCases;
        private int runtimeMs;
        private int memoryKb;
        private String submittedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getPassedCases() { return passedCases; }
        public void setPassedCases(int passedCases) { this.passedCases = passedCases; }

        public int getTotalCases() { return totalCases; }
        public void setTotalCases(int totalCases) { this.totalCases = totalCases; }

        public int getRuntimeMs() { return runtimeMs; }
        public void setRuntimeMs(int runtimeMs) { this.runtimeMs = runtimeMs; }

        public int getMemoryKb() { return memoryKb; }
        public void setMemoryKb(int memoryKb) { this.memoryKb = memoryKb; }

        public String getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }
    }

    public static class RecordSolvedRequest {
        private Long questionId;
        private int marks;
        private Long assignmentId;
        private String code;
        private String language;
        private int runtimeMs;

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }

        public int getMarks() { return marks; }
        public void setMarks(int marks) { this.marks = marks; }

        public Long getAssignmentId() { return assignmentId; }
        public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }

        public int getRuntimeMs() { return runtimeMs; }
        public void setRuntimeMs(int runtimeMs) { this.runtimeMs = runtimeMs; }
    }
}
