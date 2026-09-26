package com.skillportal.coding;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/coding")
@Tag(name = "Coding Engine & Execution", description = "Endpoints for running code against sample tests and submitting for evaluation")
public class CodingController {

    private final CodingService codingService;

    public CodingController(CodingService codingService) {
        this.codingService = codingService;
    }

    @PostMapping("/run")
    @Operation(summary = "Run code against visible sample test cases or custom input")
    public ResponseEntity<ApiResponse<CodingDto.RunCodeResponse>> runCode(@Valid @RequestBody CodingDto.RunCodeRequest request) {
        CodingDto.RunCodeResponse response = codingService.runCode(request);
        return ResponseEntity.ok(ApiResponse.success("Code run completed", response));
    }

    @PostMapping("/submissions")
    @Operation(summary = "Submit code for official grading against all hidden & visible test cases")
    public ResponseEntity<ApiResponse<CodingDto.SubmitCodeResponse>> submitCode(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CodingDto.SubmitCodeRequest request) {
        CodingDto.SubmitCodeResponse response = codingService.submitCode(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Submission evaluated", response));
    }

    @PostMapping("/record-solved")
    @Operation(summary = "Record question solved and award points in real time to leaderboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recordSolved(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CodingDto.RecordSolvedRequest request) {
        Long userId = principal != null ? principal.getId() : 1L;
        codingService.recordSolved(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Question solved recorded and leaderboard updated", Map.of("solved", true)));
    }

    @GetMapping("/questions/{questionId}/submissions")
    @Operation(summary = "Get student submission history for a specific coding question")
    public ResponseEntity<ApiResponse<List<CodingDto.SubmissionHistoryItem>>> getSubmissionHistory(
            @PathVariable Long questionId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<CodingDto.SubmissionHistoryItem> history = codingService.getSubmissionHistory(principal.getId(), questionId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
