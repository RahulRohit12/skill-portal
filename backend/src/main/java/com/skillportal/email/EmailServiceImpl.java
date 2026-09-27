package com.skillportal.email;

import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("${spring.mail.username:diggaviprajwal55@gmail.com}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:465}")
    private int mailPort;

    @Value("${app.frontend.url:https://skill-portal-1-mn1n.onrender.com}")
    private String frontendUrl;

    @PostConstruct
    public void init() {
        loadSettingsFromDatabase();
    }

    private synchronized void loadSettingsFromDatabase() {
        try {
            List<String> tables = jdbcTemplate.queryForList(
                    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'app_settings'",
                    String.class
            );
            if (tables.isEmpty()) {
                return;
            }

            jdbcTemplate.query("SELECT setting_key, setting_value FROM app_settings", (rs) -> {
                String key = rs.getString("setting_key");
                String val = rs.getString("setting_value");
                if (val != null && !val.trim().isEmpty()) {
                    val = val.trim();
                    if ("smtp_host".equalsIgnoreCase(key)) mailHost = val;
                    else if ("smtp_port".equalsIgnoreCase(key)) {
                        try { mailPort = Integer.parseInt(val); } catch (Exception ignored) {}
                    }
                    else if ("smtp_username".equalsIgnoreCase(key)) mailUsername = val;
                    else if ("smtp_password".equalsIgnoreCase(key)) mailPassword = val.replaceAll("\\s+", "");
                }
            });
            this.mailSender = null;
        } catch (Exception e) {
            log.debug("Database settings load skipped: {}", e.getMessage());
        }
    }

    private JavaMailSender buildSenderForPort(String host, int port, String user, String pass) {
        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost(host != null && !host.trim().isEmpty() ? host.trim() : "smtp.gmail.com");
        impl.setPort(port > 0 ? port : 465);
        if (user != null) impl.setUsername(user.trim());
        if (pass != null) {
            impl.setPassword(pass.replaceAll("\\s+", "").trim());
        }

        Properties props = impl.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.ssl.trust", "*");
        props.put("mail.smtp.connectiontimeout", "8000");
        props.put("mail.smtp.timeout", "8000");
        props.put("mail.smtp.writetimeout", "8000");

        if (port == 465) {
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.socketFactory.port", "465");
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
            props.put("mail.smtp.socketFactory.fallback", "false");
        } else {
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
        }

        return impl;
    }

    private boolean sendViaSmtpWithFallback(String targetEmail, String subject, String plainText, String htmlContent) throws Exception {
        int primaryPort = (mailPort > 0) ? mailPort : 465;
        int secondaryPort = (primaryPort == 465) ? 587 : 465;

        Exception firstEx = null;
        try {
            JavaMailSender primarySender = buildSenderForPort(mailHost, primaryPort, mailUsername, mailPassword);
            MimeMessage msg = primarySender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(mailUsername.trim(), "SkillX Academy");
            helper.setTo(targetEmail);
            helper.setSubject(subject);
            helper.setText(plainText, htmlContent);

            primarySender.send(msg);
            this.mailPort = primaryPort;
            return true;
        } catch (Exception ex) {
            firstEx = ex;
            log.warn("SMTP attempt to {} on port {} failed: {}. Retrying on fallback port {}...",
                    targetEmail, primaryPort, ex.getMessage(), secondaryPort);
        }

        // Fallback retry
        try {
            JavaMailSender fallbackSender = buildSenderForPort(mailHost, secondaryPort, mailUsername, mailPassword);
            MimeMessage msg = fallbackSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(mailUsername.trim(), "SkillX Academy");
            helper.setTo(targetEmail);
            helper.setSubject(subject);
            helper.setText(plainText, htmlContent);

            fallbackSender.send(msg);
            this.mailPort = secondaryPort; // Adapt active port to working one
            log.info("SMTP delivery to {} succeeded via fallback port {}", targetEmail, secondaryPort);
            return true;
        } catch (Exception ex2) {
            log.error("Both SMTP ports ({} and {}) failed for {}: {}", primaryPort, secondaryPort, targetEmail, ex2.getMessage());
            String errDetail = "Port " + primaryPort + ": " + (firstEx != null ? firstEx.getMessage() : "failed") + " | Port " + secondaryPort + ": " + ex2.getMessage();
            throw new Exception(errDetail);
        }
    }

    private boolean isHttpApiConfigured() {
        if (mailPassword == null) return false;
        String trimmed = mailPassword.trim();
        return trimmed.startsWith("re_") || trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("xkeysib-");
    }

    private boolean isSmtpConfigured() {
        return mailUsername != null && !mailUsername.trim().isEmpty()
                && mailPassword != null && !mailPassword.trim().isEmpty();
    }

    private String getProviderName() {
        if (mailPassword == null || mailPassword.trim().isEmpty()) return "None";
        String trimmed = mailPassword.trim();
        if (trimmed.startsWith("re_")) return "Resend HTTPS API (Port 443)";
        if (trimmed.startsWith("http")) return "Webhook HTTPS API (Port 443)";
        if (trimmed.startsWith("xkeysib-")) return "Brevo HTTPS API (Port 443)";
        return "Gmail SMTP (Port " + mailPort + ")";
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        StringBuilder sb = new StringBuilder();
        for (char c : raw.toCharArray()) {
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 32 || c > 126) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    private boolean sendViaResend(String apiKey, String targetEmail, String subject, String htmlContent) throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        String escapedSubject = escapeJson(subject);
        String escapedHtml = escapeJson(htmlContent);
        String escapedTarget = escapeJson(targetEmail);

        String jsonPayload = String.format(
                "{\"from\":\"SkillX Academy <onboarding@resend.dev>\",\"to\":[\"%s\"],\"subject\":\"%s\",\"html\":\"%s\"}",
                escapedTarget, escapedSubject, escapedHtml
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + apiKey.trim())
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(12))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            log.info("Email delivered via Resend HTTP API to {}: {}", targetEmail, response.body());
            return true;
        } else {
            log.error("Resend API failed (HTTP {}): {}", response.statusCode(), response.body());
            throw new Exception("Resend API (HTTP " + response.statusCode() + "): " + response.body());
        }
    }

    private boolean sendViaWebhook(String webhookUrl, String targetEmail, String subject, String htmlContent) throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .build();

        String escapedSubject = escapeJson(subject);
        String escapedHtml = escapeJson(htmlContent);
        String escapedTarget = escapeJson(targetEmail);

        String jsonPayload = String.format(
                "{\"to\":\"%s\",\"subject\":\"%s\",\"html\":\"%s\"}",
                escapedTarget, escapedSubject, escapedHtml
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(webhookUrl.trim()))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(12))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            log.info("Email delivered via Webhook to {}: {}", targetEmail, response.body());
            return true;
        } else {
            throw new Exception("Webhook delivery failed (HTTP " + response.statusCode() + "): " + response.body());
        }
    }

    private boolean sendViaBrevo(String apiKey, String senderEmail, String targetEmail, String subject, String htmlContent) throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        String fromEmail = (senderEmail != null && !senderEmail.trim().isEmpty()) ? senderEmail.trim() : "diggaviprajwal55@gmail.com";
        String escapedSubject = escapeJson(subject);
        String escapedHtml = escapeJson(htmlContent);
        String escapedTarget = escapeJson(targetEmail);
        String escapedFrom = escapeJson(fromEmail);

        String jsonPayload = String.format(
                "{\"sender\":{\"name\":\"SkillX Academy\",\"email\":\"%s\"},\"to\":[{\"email\":\"%s\"}],\"subject\":\"%s\",\"htmlContent\":\"%s\"}",
                escapedFrom, escapedTarget, escapedSubject, escapedHtml
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("api-key", apiKey.trim())
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(12))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            log.info("Email delivered via Brevo HTTP API to {}: {}", targetEmail, response.body());
            return true;
        } else {
            throw new Exception("Brevo API (HTTP " + response.statusCode() + "): " + response.body());
        }
    }

    private boolean sendEmailUnified(String targetEmail, String subject, String plainText, String htmlContent) throws Exception {
        // Priority 1: Check HTTP API (Resend, Webhook, Brevo)
        if (isHttpApiConfigured()) {
            String trimmed = mailPassword.trim();
            if (trimmed.startsWith("re_")) {
                return sendViaResend(trimmed, targetEmail, subject, htmlContent);
            }
            if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
                return sendViaWebhook(trimmed, targetEmail, subject, htmlContent);
            }
            if (trimmed.startsWith("xkeysib-")) {
                return sendViaBrevo(trimmed, mailUsername, targetEmail, subject, htmlContent);
            }
        }

        // Priority 2: Fall back to SMTP ports 465 and 587
        if (isSmtpConfigured()) {
            try {
                return sendViaSmtpWithFallback(targetEmail, subject, plainText, htmlContent);
            } catch (Exception ex) {
                if (ex.getMessage() != null && ex.getMessage().contains("SocketTimeoutException")) {
                    throw new Exception("Render Free Tier blocks raw SMTP ports 465 & 587. Please use a free Resend API Key (starts with re_) from https://resend.com (takes 10s with Google Login) which connects instantly over HTTPS Port 443.");
                }
                throw ex;
            }
        }

        throw new Exception("No email service configured. Please provide a Resend API Key (re_...) or Google App Password.");
    }

    @Override
    public String getDefaultStudentEmail() {
        try {
            List<String> list = jdbcTemplate.queryForList(
                    "SELECT setting_value FROM app_settings WHERE setting_key = 'default_student_email'",
                    String.class
            );
            if (!list.isEmpty() && list.get(0) != null && !list.get(0).trim().isEmpty()) {
                return list.get(0).trim();
            }
        } catch (Exception ignored) {}
        return "diggaviprajwal55@gmail.com";
    }

    @Override
    public void sendAttendanceMarkedEmail(
            String recipientEmail,
            String studentName,
            String studentIdNumber,
            String batchName,
            String attendanceDate,
            String attendanceTime,
            String sessionTitle) {

        String resolvedEmail = recipientEmail;
        if (resolvedEmail == null || resolvedEmail.trim().isEmpty() || resolvedEmail.contains("@skillportal.com")) {
            resolvedEmail = getDefaultStudentEmail();
        }

        final String targetEmail = resolvedEmail.trim();
        final String effectiveStudentName = studentName != null ? studentName : "Student";
        final String effectiveStudentId = studentIdNumber != null ? studentIdNumber : "N/A";
        final String effectiveBatch = batchName != null ? batchName : "Classroom Batch";
        final String effectiveDate = attendanceDate != null ? attendanceDate : "";
        final String effectiveTime = attendanceTime != null ? attendanceTime : "";
        final String effectiveSession = sessionTitle != null ? sessionTitle : "Classroom Session";

        // Asynchronous non-blocking dispatch
        CompletableFuture.runAsync(() -> {
            String subject = "✅ Present for Today: Attendance Confirmed (" + effectiveDate + ")";
            String htmlContent = buildHtmlTemplate(
                    effectiveStudentName,
                    effectiveStudentId,
                    effectiveBatch,
                    effectiveDate,
                    effectiveTime,
                    effectiveSession
            );
            String plainText = buildPlainTextTemplate(
                    effectiveStudentName,
                    effectiveStudentId,
                    effectiveBatch,
                    effectiveDate,
                    effectiveTime,
                    effectiveSession
            );

            boolean sentSuccessfully = false;
            String errorMessage = null;

            if (isHttpApiConfigured() || isSmtpConfigured()) {
                try {
                    sentSuccessfully = sendEmailUnified(targetEmail, subject, plainText, htmlContent);
                    log.info("Real-time attendance email successfully dispatched to {}", targetEmail);
                } catch (Exception ex) {
                    errorMessage = ex.getMessage();
                    log.error("Email delivery failed for recipient {}: {}", targetEmail, errorMessage);
                }
            } else {
                log.info("[SIMULATED EMAIL] Recipient: {} | Student: {} ({}) | Session: {} | Note: Email credentials not configured yet.",
                        targetEmail, effectiveStudentName, effectiveStudentId, effectiveSession);
            }

            // Persist to email_logs audit table
            try {
                String logSql = "INSERT INTO email_logs (recipient_email, student_name, email_type, subject, status, error_message) VALUES (?, ?, 'ATTENDANCE_MARKED', ?, ?, ?)";
                String status = sentSuccessfully ? "SENT" : (errorMessage != null ? "FAILED" : "SIMULATED");
                jdbcTemplate.update(logSql, targetEmail, effectiveStudentName, subject, status, errorMessage);
            } catch (Exception dbEx) {
                log.debug("Notice recording email audit log: {}", dbEx.getMessage());
            }
        });
    }

    @Override
    public EmailDto.EmailDiagnosticDto getEmailStatus() {
        loadSettingsFromDatabase();

        EmailDto.EmailDiagnosticDto dto = new EmailDto.EmailDiagnosticDto();
        dto.setSmtpHost(mailHost != null && !mailHost.trim().isEmpty() ? mailHost : "smtp.gmail.com");
        dto.setSmtpPort(mailPort > 0 ? mailPort : 465);
        dto.setSenderEmail(mailUsername != null && !mailUsername.trim().isEmpty() ? mailUsername.trim() : "diggaviprajwal55@gmail.com");
        dto.setDefaultStudentEmail(getDefaultStudentEmail());

        boolean hasPass = mailPassword != null && !mailPassword.trim().isEmpty();
        dto.setPasswordConfigured(hasPass);

        boolean ready = isHttpApiConfigured() || isSmtpConfigured();
        dto.setReadyToSend(ready);

        if (!ready) {
            dto.setStatusMessage("No email delivery configured yet. Paste your free Resend API key (re_...) or Google App Password.");
        } else {
            dto.setStatusMessage("Email delivery active via " + getProviderName());
        }

        try {
            String sql = "SELECT id, recipient_email, student_name, email_type, subject, status, error_message, created_at " +
                         "FROM email_logs ORDER BY created_at DESC LIMIT 15";
            List<EmailDto.EmailLogItem> logs = jdbcTemplate.query(sql, (rs, rowNum) -> {
                EmailDto.EmailLogItem item = new EmailDto.EmailLogItem();
                item.setId(rs.getLong("id"));
                item.setRecipientEmail(rs.getString("recipient_email"));
                item.setStudentName(rs.getString("student_name"));
                item.setEmailType(rs.getString("email_type"));
                item.setSubject(rs.getString("subject"));
                item.setStatus(rs.getString("status"));
                item.setErrorMessage(rs.getString("error_message"));
                item.setCreatedAt(rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toInstant().toString() : null);
                return item;
            });
            dto.setRecentLogs(logs);
        } catch (Exception e) {
            dto.setRecentLogs(List.of());
        }

        return dto;
    }

    @Override
    public EmailDto.EmailTestResult sendTestEmail(String recipientEmail) {
        loadSettingsFromDatabase();

        EmailDto.EmailTestResult result = new EmailDto.EmailTestResult();
        String target = (recipientEmail != null && !recipientEmail.trim().isEmpty())
                ? recipientEmail.trim()
                : getDefaultStudentEmail();
        result.setRecipient(target);

        if (!isHttpApiConfigured() && (mailUsername == null || mailUsername.trim().isEmpty())) {
            result.setSuccess(false);
            result.setMessage("Sender email is missing. Set your Gmail address in settings.");
            return result;
        }

        if (mailPassword == null || mailPassword.trim().isEmpty()) {
            result.setSuccess(false);
            result.setMessage("Credentials not configured. Please paste your Resend API Key (re_...) or Google App Password.");
            return result;
        }

        String subject = "🧪 Test Verification: SkillX Attendance Real-Time Email System";
        String html = "<!DOCTYPE html><html><body style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;background:#0f172a;padding:24px;color:#f8fafc;'>" +
                "<div style='max-width:520px;margin:auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid #334155;'>" +
                "<h2 style='color:#38bdf8;margin-top:0;'>🧪 Email Delivery Verified!</h2>" +
                "<p style='color:#cbd5e1;font-size:14px;line-height:1.6;'>This test email confirms that your <strong>SkillX Real-Time Attendance System</strong> is successfully connected via <strong>" + getProviderName() + "</strong> and delivering emails.</p>" +
                "<div style='background:#0f172a;border-radius:10px;padding:16px;margin:20px 0;font-size:13px;border:1px solid #334155;'>" +
                "<div><strong style='color:#94a3b8;'>Provider:</strong> <span style='color:#38bdf8;font-family:monospace;'>" + getProviderName() + "</span></div>" +
                "<div style='margin-top:8px;'><strong style='color:#94a3b8;'>Delivered To:</strong> <span style='color:#34d399;font-family:monospace;'>" + target + "</span></div>" +
                "<div style='margin-top:8px;'><strong style='color:#94a3b8;'>Timestamp:</strong> <span style='color:#cbd5e1;font-family:monospace;'>" + Instant.now() + "</span></div>" +
                "</div>" +
                "<p style='color:#34d399;font-weight:700;font-size:14px;margin-bottom:0;'>✓ Live Attendance QR scans will now deliver real-time notices to registered students!</p>" +
                "</div></body></html>";

        String plainText = "Test Verification Success!\n\nProvider: " + getProviderName() + "\nRecipient: " + target + "\nTime: " + Instant.now();

        try {
            sendEmailUnified(target, subject, plainText, html);
            result.setSuccess(true);
            result.setMessage("Test email successfully delivered to " + target + "! Check your inbox (or Spam/Promotions folder).");

            try {
                jdbcTemplate.update("INSERT INTO email_logs (recipient_email, student_name, email_type, subject, status, error_message) VALUES (?, 'System Admin', 'TEST_EMAIL', '🧪 Test Verification', 'SENT', NULL)",
                        target);
            } catch (Exception ignored) {}

            return result;
        } catch (Exception ex) {
            String errorMsg = ex.getMessage();
            log.error("Failed to dispatch test email to {}: {}", target, errorMsg);

            result.setSuccess(false);
            result.setMessage("Delivery Failed: " + errorMsg);
            result.setErrorDetails(errorMsg);

            try {
                jdbcTemplate.update("INSERT INTO email_logs (recipient_email, student_name, email_type, subject, status, error_message) VALUES (?, 'System Admin', 'TEST_EMAIL', '🧪 Test Verification', 'FAILED', ?)",
                        target, errorMsg);
            } catch (Exception ignored) {}

            return result;
        }
    }

    @Override
    public EmailDto.EmailTestResult saveSmtpSettings(EmailDto.SaveSettingsRequest request) {
        EmailDto.EmailTestResult res = new EmailDto.EmailTestResult();
        if (request == null) {
            res.setSuccess(false);
            res.setMessage("Request data is missing");
            return res;
        }

        try {
            if (request.getSmtpHost() != null && !request.getSmtpHost().trim().isEmpty()) {
                this.mailHost = request.getSmtpHost().trim();
                jdbcTemplate.update("INSERT INTO app_settings (setting_key, setting_value) VALUES ('smtp_host', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", mailHost);
            }
            if (request.getSmtpPort() != null && request.getSmtpPort() > 0) {
                this.mailPort = request.getSmtpPort();
                jdbcTemplate.update("INSERT INTO app_settings (setting_key, setting_value) VALUES ('smtp_port', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", String.valueOf(mailPort));
            } else {
                this.mailPort = 465;
            }
            if (request.getSmtpUsername() != null && !request.getSmtpUsername().trim().isEmpty()) {
                this.mailUsername = request.getSmtpUsername().trim();
                jdbcTemplate.update("INSERT INTO app_settings (setting_key, setting_value) VALUES ('smtp_username', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", mailUsername);
            }
            if (request.getSmtpPassword() != null && !request.getSmtpPassword().trim().isEmpty()) {
                String pass = request.getSmtpPassword().trim();
                if (!pass.startsWith("http://") && !pass.startsWith("https://")) {
                    pass = pass.replaceAll("\\s+", "");
                }
                this.mailPassword = pass;
                jdbcTemplate.update("INSERT INTO app_settings (setting_key, setting_value) VALUES ('smtp_password', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", mailPassword);
            }
            if (request.getDefaultStudentEmail() != null && !request.getDefaultStudentEmail().trim().isEmpty()) {
                String defEmail = request.getDefaultStudentEmail().trim();
                jdbcTemplate.update("INSERT INTO app_settings (setting_key, setting_value) VALUES ('default_student_email', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", defEmail);
            }

            this.mailSender = null;

            String target = (request.getDefaultStudentEmail() != null && !request.getDefaultStudentEmail().trim().isEmpty())
                    ? request.getDefaultStudentEmail().trim()
                    : (mailUsername != null ? mailUsername.trim() : "diggaviprajwal55@gmail.com");

            return sendTestEmail(target);
        } catch (Exception e) {
            log.error("Failed to save SMTP settings: {}", e.getMessage(), e);
            res.setSuccess(false);
            res.setMessage("Settings saved, but test delivery failed: " + e.getMessage());
            return res;
        }
    }

    @Override
    public boolean updateStudentEmail(Long studentId, String newEmail) {
        if (newEmail == null || newEmail.trim().isEmpty()) {
            return false;
        }
        String cleanEmail = newEmail.trim();
        try {
            jdbcTemplate.update("INSERT INTO app_settings (setting_key, setting_value) VALUES ('default_student_email', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", cleanEmail);
        } catch (Exception e) {
            log.warn("Notice updating default student email in app_settings: {}", e.getMessage());
        }

        if (studentId != null) {
            try {
                jdbcTemplate.update("UPDATE users u JOIN students s ON s.user_id = u.id SET u.email = ? WHERE s.id = ?", cleanEmail, studentId);
            } catch (Exception e) {
                log.info("Could not update users table directly (expected if unique constraint exists): {}", e.getMessage());
            }
        }
        return true;
    }

    private String buildHtmlTemplate(
            String studentName,
            String studentId,
            String batchName,
            String date,
            String time,
            String sessionTitle) {

        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "<meta charset=\"utf-8\">\n" +
                "<style>\n" +
                "  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; }\n" +
                "  .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }\n" +
                "  .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center; color: #ffffff; }\n" +
                "  .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }\n" +
                "  .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }\n" +
                "  .body { padding: 32px 28px; color: #1e293b; }\n" +
                "  .badge { display: inline-block; background-color: #dcfce7; color: #166534; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #bbf7d0; margin-bottom: 20px; }\n" +
                "  .details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }\n" +
                "  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; }\n" +
                "  .row:last-child { border-bottom: none; }\n" +
                "  .label { color: #64748b; font-weight: 600; }\n" +
                "  .val { color: #0f172a; font-weight: 700; text-align: right; }\n" +
                "  .btn-container { text-align: center; margin-top: 28px; }\n" +
                "  .btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; }\n" +
                "  .footer { padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #fafafa; }\n" +
                "</style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class=\"container\">\n" +
                "    <div class=\"header\">\n" +
                "      <h1>SkillX Academy Attendance</h1>\n" +
                "      <p>Official Verification Notice</p>\n" +
                "    </div>\n" +
                "    <div class=\"body\">\n" +
                "      <div class=\"badge\">✓ STATUS: PRESENT FOR THE DAY</div>\n" +
                "      <p>Dear <strong>" + studentName + "</strong>,</p>\n" +
                "      <p>You have been marked <strong>PRESENT</strong> for today's session via QR biometric check-in.</p>\n" +
                "      <div class=\"details\">\n" +
                "        <div class=\"row\"><span class=\"label\">Student ID</span><span class=\"val\">" + studentId + "</span></div>\n" +
                "        <div class=\"row\"><span class=\"label\">Status</span><span class=\"val\" style=\"color:#16a34a;\">PRESENT</span></div>\n" +
                "        <div class=\"row\"><span class=\"label\">Session Topic</span><span class=\"val\">" + sessionTitle + "</span></div>\n" +
                "        <div class=\"row\"><span class=\"label\">Batch</span><span class=\"val\">" + batchName + "</span></div>\n" +
                "        <div class=\"row\"><span class=\"label\">Date</span><span class=\"val\">" + date + "</span></div>\n" +
                "        <div class=\"row\"><span class=\"label\">Scan Time</span><span class=\"val\">" + time + "</span></div>\n" +
                "        <div class=\"row\"><span class=\"label\">Verification Mode</span><span class=\"val\" style=\"color:#0284c7;\">QR Biometric Token</span></div>\n" +
                "      </div>\n" +
                "      <p style=\"font-size: 13px; color: #64748b;\">Consistent daily attendance keeps your placement readiness index high and batch rank active.</p>\n" +
                "      <div class=\"btn-container\">\n" +
                "        <a href=\"" + frontendUrl + "/attendance\" class=\"btn\">View My Attendance Ledger</a>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "    <div class=\"footer\">\n" +
                "      &copy; 2026 SkillX Academy. Automated real-time attendance verification.\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }

    private String buildPlainTextTemplate(
            String studentName,
            String studentId,
            String batchName,
            String date,
            String time,
            String sessionTitle) {

        return "SKILLX ACADEMY - ATTENDANCE CONFIRMATION\n" +
                "=========================================\n\n" +
                "Status: PRESENT FOR THE DAY\n" +
                "Dear " + studentName + ",\n\n" +
                "Your attendance was recorded and marked PRESENT for today via QR code scan.\n\n" +
                "Details:\n" +
                "- Student ID: " + studentId + "\n" +
                "- Status: PRESENT\n" +
                "- Session: " + sessionTitle + "\n" +
                "- Batch: " + batchName + "\n" +
                "- Date: " + date + "\n" +
                "- Scan Time: " + time + "\n" +
                "- Verification Method: QR Scanner\n\n" +
                "View your complete attendance ledger: " + frontendUrl + "/attendance\n\n" +
                "Best regards,\n" +
                "SkillX Academy Administration";
    }
}
