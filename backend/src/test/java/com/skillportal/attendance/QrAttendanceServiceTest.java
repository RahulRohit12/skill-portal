package com.skillportal.attendance;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class QrAttendanceServiceTest {

    private AttendanceRepository attendanceRepository;
    private com.skillportal.email.EmailService emailService;
    private com.skillportal.notification.NotificationRepository notificationRepository;
    private AttendanceService attendanceService;

    @BeforeEach
    void setUp() {
        attendanceRepository = mock(AttendanceRepository.class);
        emailService = mock(com.skillportal.email.EmailService.class);
        notificationRepository = mock(com.skillportal.notification.NotificationRepository.class);
        attendanceService = new AttendanceService(attendanceRepository, emailService, notificationRepository);
    }

    @Test
    void testProcessQrScan_Success() {
        AttendanceRepository.StudentQrLookup student = new AttendanceRepository.StudentQrLookup();
        student.studentId = 1L;
        student.userId = 2L;
        student.studentIdNumber = "STU-2026-001";
        student.fullName = "Shiva Kumar";
        student.email = "student.real@example.com";
        student.userStatus = "ACTIVE";
        student.batchId = 1L;
        student.batchName = "Java Full Stack 2026";
        student.qrStatus = "ACTIVE";

        when(attendanceRepository.findStudentByQrToken("QR-VALID-12345")).thenReturn(Optional.of(student));
        when(attendanceRepository.findOrCreateTodaySessionForBatch(1L, 100L)).thenReturn(10L);
        when(attendanceRepository.checkExistingAttendance(10L, 1L)).thenReturn(Optional.empty());

        AttendanceDto.QrScanRequest req = new AttendanceDto.QrScanRequest();
        req.setQrToken("QR-VALID-12345");
        req.setDeviceInfo("Mobile Admin Scanner");

        AttendanceDto.QrScanResponse response = attendanceService.processQrScan(100L, req, "127.0.0.1");

        assertNotNull(response);
        assertEquals("PRESENT", response.getAttendanceStatus());
        assertEquals("Attendance marked successfully.", response.getMessage());
        assertEquals("STU-2026-001", response.getStudent().getStudentIdNumber());
        assertEquals("Shiva Kumar", response.getStudent().getFullName());
        verify(attendanceRepository, times(1)).recordQrAttendance(10L, 1L, 100L, "QR_SCAN", "Mobile Admin Scanner");
        verify(attendanceRepository, times(1)).logAudit(eq(1L), eq(100L), eq(10L), eq("QR-VALID-12345"), eq("SUCCESS"), any(), any(), any());
        verify(emailService, times(1)).sendAttendanceMarkedEmail(eq("student.real@example.com"), eq("Shiva Kumar"), eq("STU-2026-001"), eq("Java Full Stack 2026"), any(), any(), any());
    }

    @Test
    void testProcessQrScan_DuplicatePrevention() {
        AttendanceRepository.StudentQrLookup student = new AttendanceRepository.StudentQrLookup();
        student.studentId = 1L;
        student.studentIdNumber = "STU-2026-001";
        student.fullName = "Shiva Kumar";
        student.userStatus = "ACTIVE";
        student.batchId = 1L;
        student.qrStatus = "ACTIVE";

        AttendanceRepository.ExistingAttendanceInfo existing = new AttendanceRepository.ExistingAttendanceInfo();
        existing.recordId = 55L;
        existing.status = "PRESENT";
        existing.markedAt = Timestamp.from(Instant.now());
        existing.source = "QR_SCAN";

        when(attendanceRepository.findStudentByQrToken("QR-VALID-12345")).thenReturn(Optional.of(student));
        when(attendanceRepository.findOrCreateTodaySessionForBatch(1L, 100L)).thenReturn(10L);
        when(attendanceRepository.checkExistingAttendance(10L, 1L)).thenReturn(Optional.of(existing));

        AttendanceDto.QrScanRequest req = new AttendanceDto.QrScanRequest();
        req.setQrToken("QR-VALID-12345");

        AttendanceDto.QrScanResponse response = attendanceService.processQrScan(100L, req, "127.0.0.1");

        assertNotNull(response);
        assertEquals("ALREADY_MARKED", response.getAttendanceStatus());
        assertEquals("Attendance already marked for today.", response.getMessage());
        verify(attendanceRepository, never()).recordQrAttendance(anyLong(), anyLong(), anyLong(), anyString(), any());
        verify(attendanceRepository, times(1)).logAudit(eq(1L), eq(100L), eq(10L), eq("QR-VALID-12345"), eq("DUPLICATE"), any(), any(), any());
    }

    @Test
    void testProcessQrScan_InvalidToken() {
        when(attendanceRepository.findStudentByQrToken("INVALID-QR")).thenReturn(Optional.empty());

        AttendanceDto.QrScanRequest req = new AttendanceDto.QrScanRequest();
        req.setQrToken("INVALID-QR");

        AttendanceDto.QrScanResponse response = attendanceService.processQrScan(100L, req, "127.0.0.1");

        assertNotNull(response);
        assertEquals("INVALID_QR", response.getAttendanceStatus());
        assertEquals("Invalid or unrecognized QR code.", response.getMessage());
        verify(attendanceRepository, times(1)).logAudit(isNull(), eq(100L), any(), eq("INVALID-QR"), eq("INVALID_QR"), any(), any(), any());
    }

    @Test
    void testProcessQrScan_RevokedToken() {
        AttendanceRepository.StudentQrLookup student = new AttendanceRepository.StudentQrLookup();
        student.studentId = 2L;
        student.studentIdNumber = "STU-2026-002";
        student.fullName = "Rahul Sharma";
        student.userStatus = "ACTIVE";
        student.qrStatus = "REVOKED";

        when(attendanceRepository.findStudentByQrToken("OLD-REVOKED-QR")).thenReturn(Optional.of(student));

        AttendanceDto.QrScanRequest req = new AttendanceDto.QrScanRequest();
        req.setQrToken("OLD-REVOKED-QR");

        AttendanceDto.QrScanResponse response = attendanceService.processQrScan(100L, req, "127.0.0.1");

        assertNotNull(response);
        assertEquals("REVOKED", response.getAttendanceStatus());
        assertTrue(response.getMessage().contains("revoked or regenerated"));
        verify(attendanceRepository, never()).recordQrAttendance(anyLong(), anyLong(), anyLong(), anyString(), any());
    }
}
