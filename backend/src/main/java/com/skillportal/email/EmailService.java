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

    void sendEnrollmentPaymentEmail(
            String recipientEmail,
            String studentName,
            String studentIdNumber,
            String courseTitle,
            String batchName,
            Double amountInRupees,
            String paymentUrl
    );

    EmailDto.EmailDiagnosticDto getEmailStatus();

    EmailDto.EmailTestResult sendTestEmail(String recipientEmail);

    boolean updateStudentEmail(Long studentId, String newEmail);

    EmailDto.EmailTestResult saveSmtpSettings(EmailDto.SaveSettingsRequest request);

    String getDefaultStudentEmail();
}
