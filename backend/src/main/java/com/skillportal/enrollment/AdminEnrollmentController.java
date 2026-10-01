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

    @PostMapping("/send-email/{token}")
    @Operation(summary = "Admin sends or resends the official enrollment payment form to student's Gmail")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> sendEmail(@PathVariable String token) {
        java.util.Map<String, Object> result = enrollmentService.sendEnrollmentEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Enrollment payment form sent to student's Gmail", result));
    }

    @GetMapping("/share-message/{token}")
    @Operation(summary = "Get pre-formatted WhatsApp and SMS message links for student enrollment")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getShareMessage(@PathVariable String token) {
        java.util.Map<String, Object> result = enrollmentService.getShareMessage(token);
        return ResponseEntity.ok(ApiResponse.success("Share message generated", result));
    }

    @GetMapping("/settings/razorpay-qr")
    @Operation(summary = "Get Razorpay merchant QR image URL and UPI ID settings")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> getQrSettings() {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.getRazorpayQrSettings()));
    }

    @PostMapping("/settings/razorpay-qr")
    @Operation(summary = "Update Razorpay merchant QR image URL and UPI ID settings")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> updateQrSettings(
            @RequestBody EnrollmentDto.RazorpayQrSettingsRequest req) {
        enrollmentService.saveRazorpayQrSettings(req);
        return ResponseEntity.ok(ApiResponse.success("Razorpay QR settings saved successfully", enrollmentService.getRazorpayQrSettings()));
    }
}
