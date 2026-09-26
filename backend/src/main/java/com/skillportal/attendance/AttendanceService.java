package com.skillportal.attendance;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    public AttendanceDto.StudentAttendanceSummary getStudentAttendance(Long userId) {
        return attendanceRepository.getStudentAttendanceSummary(userId);
    }

    public AttendanceDto.MyQrCodeResponse getMyQrCode(Long userId) {
        return attendanceRepository.getMyQrCode(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found for authenticated user."));
    }

    @Transactional
    public AttendanceDto.QrScanResponse processQrScan(Long adminUserId, AttendanceDto.QrScanRequest request, String ipAddress) {
        String token = request.getQrToken() != null ? request.getQrToken().trim() : "";
        if (token.isEmpty()) {
            AttendanceDto.QrScanResponse resp = new AttendanceDto.QrScanResponse();
            resp.setAttendanceStatus("INVALID_QR");
            resp.setMessage("QR Token must not be empty.");
            return resp;
        }

        // 1. Find student by unique QR token
        Optional<AttendanceRepository.StudentQrLookup> lookupOpt = attendanceRepository.findStudentByQrToken(token);
        if (lookupOpt.isEmpty()) {
            attendanceRepository.logAudit(null, adminUserId, request.getSessionId(), token, "INVALID_QR", request.getDeviceInfo(), ipAddress, "Unrecognized QR token scanned");
            AttendanceDto.QrScanResponse resp = new AttendanceDto.QrScanResponse();
            resp.setAttendanceStatus("INVALID_QR");
            resp.setMessage("Invalid or unrecognized QR code.");
            return resp;
        }

        AttendanceRepository.StudentQrLookup student = lookupOpt.get();

        // 2. Validate QR status
        if (!"ACTIVE".equalsIgnoreCase(student.qrStatus)) {
            attendanceRepository.logAudit(student.studentId, adminUserId, request.getSessionId(), token, "REVOKED", request.getDeviceInfo(), ipAddress, "QR code has been revoked or regenerated");
            AttendanceDto.QrScanResponse resp = new AttendanceDto.QrScanResponse();
            resp.setAttendanceStatus("REVOKED");
            resp.setMessage("This QR code is no longer valid. It has been revoked or regenerated.");
            return resp;
        }

        // 3. Validate student account status
        if (!"ACTIVE".equalsIgnoreCase(student.userStatus)) {
            attendanceRepository.logAudit(student.studentId, adminUserId, request.getSessionId(), token, "INACTIVE_STUDENT", request.getDeviceInfo(), ipAddress, "Student account inactive");
            AttendanceDto.QrScanResponse resp = new AttendanceDto.QrScanResponse();
            resp.setAttendanceStatus("INACTIVE_STUDENT");
            resp.setMessage("Student account is inactive.");
            return resp;
        }

        // 4. Resolve session for today
        Long sessionId = request.getSessionId();
        if (sessionId == null) {
            sessionId = attendanceRepository.findOrCreateTodaySessionForBatch(student.batchId, adminUserId);
        }

        // Prepare student basic info
        AttendanceDto.StudentBasicInfo studentInfo = new AttendanceDto.StudentBasicInfo();
        studentInfo.setId(student.studentId);
        studentInfo.setStudentIdNumber(student.studentIdNumber);
        studentInfo.setFullName(student.fullName);
        studentInfo.setEmail(student.email);
        studentInfo.setBatchName(student.batchName);
        studentInfo.setAvatarUrl(student.avatarUrl);

        // 5. Check for duplicate scan on this session / today
        Optional<AttendanceRepository.ExistingAttendanceInfo> existingOpt = attendanceRepository.checkExistingAttendance(sessionId, student.studentId);
        if (existingOpt.isPresent()) {
            AttendanceRepository.ExistingAttendanceInfo existing = existingOpt.get();
            attendanceRepository.logAudit(student.studentId, adminUserId, sessionId, token, "DUPLICATE", request.getDeviceInfo(), ipAddress, "Duplicate scan prevented");

            AttendanceDto.QrScanResponse resp = new AttendanceDto.QrScanResponse();
            resp.setAttendanceStatus("ALREADY_MARKED");
            resp.setMessage("Attendance already marked for today.");
            resp.setStudent(studentInfo);
            resp.setAttendanceDate(LocalDate.now().toString());
            resp.setAttendanceTime(existing.markedAt != null ? TIME_FORMATTER.format(existing.markedAt.toLocalDateTime().toLocalTime()) : TIME_FORMATTER.format(LocalTime.now()));
            resp.setSessionId(sessionId);
            resp.setSessionTitle("Classroom Session - " + LocalDate.now());
            resp.setSource(existing.source != null ? existing.source : "QR_SCAN");
            resp.setMarkedAt(existing.markedAt != null ? existing.markedAt.toInstant().toString() : Instant.now().toString());
            resp.setExistingMarkedAt(existing.markedAt != null ? existing.markedAt.toInstant().toString() : Instant.now().toString());
            return resp;
        }

        // 6. Record attendance
        attendanceRepository.recordQrAttendance(sessionId, student.studentId, adminUserId, "QR_SCAN", request.getDeviceInfo());
        attendanceRepository.logAudit(student.studentId, adminUserId, sessionId, token, "SUCCESS", request.getDeviceInfo(), ipAddress, "Marked present via QR scanner");

        AttendanceDto.QrScanResponse resp = new AttendanceDto.QrScanResponse();
        resp.setAttendanceStatus("PRESENT");
        resp.setMessage("Attendance marked successfully.");
        resp.setStudent(studentInfo);
        resp.setAttendanceDate(LocalDate.now().toString());
        resp.setAttendanceTime(TIME_FORMATTER.format(LocalTime.now()));
        resp.setSessionId(sessionId);
        resp.setSessionTitle("Classroom Session - " + LocalDate.now());
        resp.setSource("QR_SCAN");
        resp.setMarkedAt(Instant.now().toString());
        return resp;
    }

    public AttendanceDto.CalendarAttendanceResponse getCalendarAttendance(Long userId, Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        int targetYear = (year != null && year > 2000) ? year : now.getYear();
        int targetMonth = (month != null && month >= 1 && month <= 12) ? month : now.getMonthValue();
        return attendanceRepository.getCalendarAttendance(userId, targetYear, targetMonth);
    }

    public List<AttendanceDto.TodayScanItem> getTodayScans() {
        return attendanceRepository.getTodayScans();
    }

    @Transactional
    public String regenerateStudentQr(Long studentId) {
        String newToken = "QR-" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
        attendanceRepository.regenerateStudentQrToken(studentId, newToken);
        return newToken;
    }

    @Transactional
    public Long createSession(Long adminUserId, AttendanceDto.CreateSessionRequest req) {
        return attendanceRepository.createSession(adminUserId, req);
    }

    @Transactional
    public void markBatchAttendance(Long sessionId, List<AttendanceDto.MarkRecordItem> records) {
        for (AttendanceDto.MarkRecordItem r : records) {
            attendanceRepository.markAttendance(sessionId, r.getStudentId(), r.getStatus(), r.getRemarks());
        }
    }
}
