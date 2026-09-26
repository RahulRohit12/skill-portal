package com.skillportal.email;

import java.util.List;

public class EmailDto {

    public static class EmailDiagnosticDto {
        private String smtpHost;
        private int smtpPort;
        private String senderEmail;
        private String defaultStudentEmail;
        private boolean passwordConfigured;
        private boolean readyToSend;
        private String statusMessage;
        private List<EmailLogItem> recentLogs;

        public String getSmtpHost() { return smtpHost; }
        public void setSmtpHost(String smtpHost) { this.smtpHost = smtpHost; }

        public int getSmtpPort() { return smtpPort; }
        public void setSmtpPort(int smtpPort) { this.smtpPort = smtpPort; }

        public String getSenderEmail() { return senderEmail; }
        public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

        public String getDefaultStudentEmail() { return defaultStudentEmail; }
        public void setDefaultStudentEmail(String defaultStudentEmail) { this.defaultStudentEmail = defaultStudentEmail; }

        public boolean isPasswordConfigured() { return passwordConfigured; }
        public void setPasswordConfigured(boolean passwordConfigured) { this.passwordConfigured = passwordConfigured; }

        public boolean isReadyToSend() { return readyToSend; }
        public void setReadyToSend(boolean readyToSend) { this.readyToSend = readyToSend; }

        public String getStatusMessage() { return statusMessage; }
        public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

        public List<EmailLogItem> getRecentLogs() { return recentLogs; }
        public void setRecentLogs(List<EmailLogItem> recentLogs) { this.recentLogs = recentLogs; }
    }

    public static class EmailLogItem {
        private Long id;
        private String recipientEmail;
        private String studentName;
        private String emailType;
        private String subject;
        private String status;
        private String errorMessage;
        private String createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getRecipientEmail() { return recipientEmail; }
        public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getEmailType() { return emailType; }
        public void setEmailType(String emailType) { this.emailType = emailType; }

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class EmailTestRequest {
        private String to;

        public String getTo() { return to; }
        public void setTo(String to) { this.to = to; }
    }

    public static class UpdateStudentEmailRequest {
        private Long studentId;
        private String email;

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class SaveSettingsRequest {
        private String smtpHost;
        private Integer smtpPort;
        private String smtpUsername;
        private String smtpPassword;
        private String defaultStudentEmail;

        public String getSmtpHost() { return smtpHost; }
        public void setSmtpHost(String smtpHost) { this.smtpHost = smtpHost; }

        public Integer getSmtpPort() { return smtpPort; }
        public void setSmtpPort(Integer smtpPort) { this.smtpPort = smtpPort; }

        public String getSmtpUsername() { return smtpUsername; }
        public void setSmtpUsername(String smtpUsername) { this.smtpUsername = smtpUsername; }

        public String getSmtpPassword() { return smtpPassword; }
        public void setSmtpPassword(String smtpPassword) { this.smtpPassword = smtpPassword; }

        public String getDefaultStudentEmail() { return defaultStudentEmail; }
        public void setDefaultStudentEmail(String defaultStudentEmail) { this.defaultStudentEmail = defaultStudentEmail; }
    }

    public static class EmailTestResult {
        private boolean success;
        private String message;
        private String recipient;
        private String errorDetails;

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getRecipient() { return recipient; }
        public void setRecipient(String recipient) { this.recipient = recipient; }

        public String getErrorDetails() { return errorDetails; }
        public void setErrorDetails(String errorDetails) { this.errorDetails = errorDetails; }
    }
}
