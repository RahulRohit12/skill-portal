package com.skillportal.email;

import com.skillportal.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/email")
@Tag(name = "Admin Email Management", description = "Endpoints for diagnosing SMTP connection, saving settings, sending test emails, and updating student recipient emails")
@PreAuthorize("hasRole('ADMIN')")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping("/status")
    @Operation(summary = "Get current SMTP configuration status and recent dispatch audit logs")
    public ResponseEntity<ApiResponse<EmailDto.EmailDiagnosticDto>> getEmailStatus() {
        EmailDto.EmailDiagnosticDto status = emailService.getEmailStatus();
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @PostMapping("/test")
    @Operation(summary = "Send a live diagnostic test email to any specified recipient")
    public ResponseEntity<ApiResponse<EmailDto.EmailTestResult>> sendTestEmail(
            @RequestBody EmailDto.EmailTestRequest request) {
        String target = request != null ? request.getTo() : null;
        EmailDto.EmailTestResult result = emailService.sendTestEmail(target);
        if (result.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
        } else {
            return ResponseEntity.ok(ApiResponse.error(result.getMessage(), result));
        }
    }

    @PostMapping("/settings")
    @Operation(summary = "Save SMTP credentials and default student email directly to runtime database")
    public ResponseEntity<ApiResponse<EmailDto.EmailTestResult>> saveSettings(
            @RequestBody EmailDto.SaveSettingsRequest request) {
        EmailDto.EmailTestResult result = emailService.saveSmtpSettings(request);
        if (result.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.success("SMTP configuration saved and verified successfully!", result));
        } else {
            return ResponseEntity.ok(ApiResponse.error("Configuration saved, but test delivery notice: " + result.getMessage(), result));
        }
    }

    @PostMapping("/update-student-email")
    @Operation(summary = "Update registered email address for a student so attendance notices reach their personal inbox")
    public ResponseEntity<ApiResponse<Void>> updateStudentEmail(
            @RequestBody EmailDto.UpdateStudentEmailRequest request) {
        if (request == null || request.getStudentId() == null || request.getEmail() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Student ID and new email are required"));
        }
        boolean updated = emailService.updateStudentEmail(request.getStudentId(), request.getEmail());
        if (updated) {
            return ResponseEntity.ok(ApiResponse.success("Student email updated to " + request.getEmail() + " successfully", null));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Could not update student email"));
        }
    }
}
