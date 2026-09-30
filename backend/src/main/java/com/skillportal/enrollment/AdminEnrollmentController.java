package com.skillportal.enrollment;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/enrollments")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Enrollments", description = "Admin endpoints for generating enrollment links and monitoring payment status")
public class AdminEnrollmentController {

    private final EnrollmentService enrollmentService;

    public AdminEnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/generate")
    @Operation(summary = "Generate a secure student course enrollment and payment link")
    public ResponseEntity<ApiResponse<EnrollmentDto.EnrollmentGenerateResponse>> generateEnrollment(
            @RequestBody EnrollmentDto.AdminEnrollmentGenerateRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long adminId = principal != null ? principal.getId() : null;
        EnrollmentDto.EnrollmentGenerateResponse response = enrollmentService.generateEnrollment(req, adminId);
        return ResponseEntity.ok(ApiResponse.success("Enrollment payment link generated successfully", response));
    }

    @GetMapping("/list")
    @Operation(summary = "Get list of all generated student enrollments, payment status, and order IDs")
    public ResponseEntity<ApiResponse<List<EnrollmentDto.EnrollmentAdminItem>>> listEnrollments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long batchId) {
        List<EnrollmentDto.EnrollmentAdminItem> items = enrollmentService.listEnrollmentsForAdmin(search, status, batchId);
        return ResponseEntity.ok(ApiResponse.success(items));
    }
}
