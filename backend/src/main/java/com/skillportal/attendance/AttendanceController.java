package com.skillportal.attendance;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@Tag(name = "Attendance Tracking", description = "Endpoints for student attendance overview and admin session marking")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    @Operation(summary = "Get overall, subject-wise, and chronological attendance for logged-in student")
    public ResponseEntity<ApiResponse<AttendanceDto.StudentAttendanceSummary>> getAttendance(
            @AuthenticationPrincipal UserPrincipal principal) {
        AttendanceDto.StudentAttendanceSummary summary = attendanceService.getStudentAttendance(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/my-qr")
    @Operation(summary = "Student: Get personalized unique attendance QR code identity")
    public ResponseEntity<ApiResponse<AttendanceDto.MyQrCodeResponse>> getMyQrCode(
            @AuthenticationPrincipal UserPrincipal principal) {
        AttendanceDto.MyQrCodeResponse response = attendanceService.getMyQrCode(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/qr/scan")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Process and verify student QR scan for live attendance")
    public ResponseEntity<ApiResponse<AttendanceDto.QrScanResponse>> scanStudentQr(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AttendanceDto.QrScanRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = httpRequest.getRemoteAddr();
        }
        AttendanceDto.QrScanResponse response = attendanceService.processQrScan(principal.getId(), request, clientIp);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @GetMapping("/calendar")
    @Operation(summary = "Student: Get monthly date-by-date attendance calendar visualization")
    public ResponseEntity<ApiResponse<AttendanceDto.CalendarAttendanceResponse>> getCalendar(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        AttendanceDto.CalendarAttendanceResponse response = attendanceService.getCalendarAttendance(principal.getId(), year, month);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/scans/today")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: List all verified QR attendance scans conducted today")
    public ResponseEntity<ApiResponse<List<AttendanceDto.TodayScanItem>>> getTodayScans() {
        List<AttendanceDto.TodayScanItem> list = attendanceService.getTodayScans();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/students/{studentId}/regenerate-qr")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Revoke and regenerate a student's QR identity token")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> regenerateQr(
            @PathVariable Long studentId) {
        String newToken = attendanceService.regenerateStudentQr(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student QR code regenerated successfully", java.util.Map.of("qrToken", newToken)));
    }

    @PostMapping("/sessions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Create a new attendance session")
    public ResponseEntity<ApiResponse<Long>> createSession(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AttendanceDto.CreateSessionRequest request) {
        Long sessionId = attendanceService.createSession(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Attendance session created", sessionId));
    }

    @PostMapping("/sessions/{sessionId}/records")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Mark attendance records for a batch")
    public ResponseEntity<ApiResponse<Void>> markRecords(
            @PathVariable Long sessionId,
            @Valid @RequestBody List<AttendanceDto.MarkRecordItem> records) {
        attendanceService.markBatchAttendance(sessionId, records);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", null));
    }
}
