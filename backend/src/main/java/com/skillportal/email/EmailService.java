package com.skillportal.email;

public interface EmailService {
    void sendAttendanceMarkedEmail(
            String recipientEmail,
            String studentName,
            String studentIdNumber,
            String batchName,
            String attendanceDate,
            String attendanceTime,
            String sessionTitle
    );

    EmailDto.EmailDiagnosticDto getEmailStatus();

    EmailDto.EmailTestResult sendTestEmail(String recipientEmail);

    boolean updateStudentEmail(Long studentId, String newEmail);
}
