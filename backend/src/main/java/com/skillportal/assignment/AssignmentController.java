package com.skillportal.assignment;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
@Tag(name = "Assignments & Sections", description = "Endpoints for student assignments and sequential section unlocking")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    @Operation(summary = "Get all assignments with student progress and completion stats")
    public ResponseEntity<ApiResponse<List<AssignmentDto.AssignmentSummary>>> getAllAssignments(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        List<AssignmentDto.AssignmentSummary> list = assignmentService.getAllAssignments(userId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get assignment details with all sections and sequential lock status")
    public ResponseEntity<ApiResponse<AssignmentDto.AssignmentDetail>> getAssignmentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        AssignmentDto.AssignmentDetail detail = assignmentService.getAssignmentById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @GetMapping("/{id}/sections/{sectionId}")
    @Operation(summary = "Get a specific assignment section and its questions (checks sequential lock)")
    public ResponseEntity<ApiResponse<AssignmentDto.SectionSummary>> getSectionById(
            @PathVariable Long id,
            @PathVariable Long sectionId,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        AssignmentDto.SectionSummary section = assignmentService.getSectionById(sectionId, userId);
        return ResponseEntity.ok(ApiResponse.success(section));
    }

    @PostMapping("/{id}/sections")
    @Operation(summary = "Create a new assignment topic/sub-topic section")
    public ResponseEntity<ApiResponse<AssignmentDto.SectionSummary>> createSection(
            @PathVariable Long id,
            @RequestBody AssignmentDto.CreateSectionRequest request) {
        AssignmentDto.SectionSummary section = assignmentService.createSection(id, request);
        return ResponseEntity.ok(ApiResponse.success("Section created successfully", section));
    }

    @PostMapping("/{id}/sections/{sectionId}/questions/batch")
    @Operation(summary = "Batch add coding questions to an assignment section (cross-device sync)")
    public ResponseEntity<ApiResponse<List<AssignmentDto.QuestionSummary>>> createQuestionsForSection(
            @PathVariable Long id,
            @PathVariable Long sectionId,
            @RequestBody List<AssignmentDto.CreateQuestionItem> questions) {
        List<AssignmentDto.QuestionSummary> created = assignmentService.createQuestionsForSection(sectionId, questions);
        return ResponseEntity.ok(ApiResponse.success("Questions added successfully", created));
    }
}
