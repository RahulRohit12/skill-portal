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

    @Value("${spring.mail.port:587}")
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
                    else if ("smtp_password".equalsIgnoreCase(key)) mailPassword = val;
                }
            });
            // Reset cached sender to pick up refreshed DB properties
            this.mailSender = null;
        } catch (Exception e) {
            log.debug("Database settings load skipped: {}", e.getMessage());
        }
    }

    private synchronized JavaMailSender getEffectiveMailSender() {
        if (this.mailSender != null) {
            return this.mailSender;
        }

        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost(mailHost != null && !mailHost.trim().isEmpty() ? mailHost.trim() : "smtp.gmail.com");
        impl.setPort(mailPort > 0 ? mailPort : 587);
        if (mailUsername != null) impl.setUsername(mailUsername.trim());
        if (mailPassword != null) impl.setPassword(mailPassword.trim());

        Properties props = impl.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", "*");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
        props.put("mail.smtp.connectiontimeout", "15000");
        props.put("mail.smtp.timeout", "15000");
        props.put("mail.smtp.writetimeout", "15000");

        this.mailSender = impl;
        return impl;
    }

    private boolean isSmtpConfigured() {
        return mailUsername != null && !mailUsername.trim().isEmpty()
                && mailPassword != null && !mailPassword.trim().isEmpty();
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

        // Auto-route mock/empty email to live recipient
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

            boolean sentViaSmtp = false;
            String errorMessage = null;

            if (isSmtpConfigured()) {
                try {
                    JavaMailSender sender = getEffectiveMailSender();
                    MimeMessage mimeMessage = sender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setFrom(mailUsername.trim(), "SkillX Academy Attendance");
                    helper.setTo(targetEmail);
                    helper.setSubject(subject);
                    helper.setText(plainText, htmlContent);

                    sender.send(mimeMessage);
                    sentViaSmtp = true;
                    log.info("Real-time attendance email successfully dispatched via SMTP to {}", targetEmail);
                } catch (Exception ex) {
                    errorMessage = ex.getMessage();
                    if (ex.getCause() != null && ex.getCause().getMessage() != null) {
                        errorMessage += " (Cause: " + ex.getCause().getMessage() + ")";
                    }
                    log.error("SMTP email delivery failed for recipient {}: {}", targetEmail, errorMessage, ex);
                }
            } else {
                log.info("[SIMULATED EMAIL] Recipient: {} | Student: {} ({}) | Session: {} | Note: SMTP password not configured yet.",
                        targetEmail, effectiveStudentName, effectiveStudentId, effectiveSession);
            }

            // Persist to email_logs audit table
            try {
                String logSql = "INSERT INTO email_logs (recipient_email, student_name, email_type, subject, status, error_message) VALUES (?, ?, 'ATTENDANCE_MARKED', ?, ?, ?)";
                String status = sentViaSmtp ? "SENT" : (errorMessage != null ? "FAILED" : "SIMULATED");
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
        dto.setSmtpPort(mailPort > 0 ? mailPort : 587);
        dto.setSenderEmail(mailUsername != null && !mailUsername.trim().isEmpty() ? mailUsername.trim() : "diggaviprajwal55@gmail.com");
        dto.setDefaultStudentEmail(getDefaultStudentEmail());

        boolean hasPass = mailPassword != null && !mailPassword.trim().isEmpty();
        dto.setPasswordConfigured(hasPass);

        boolean ready = isSmtpConfigured();
        dto.setReadyToSend(ready);

        if (!ready) {
            if (mailUsername == null || mailUsername.trim().isEmpty()) {
                dto.setStatusMessage("SPRING_MAIL_USERNAME is not set. Enter your Gmail in settings.");
            } else if (!hasPass) {
                dto.setStatusMessage("Google App Password not configured yet. Paste your 16-character code below and click 'Save & Connect'.");
            }
        } else {
            dto.setStatusMessage("SMTP is connected and active with sender " + mailUsername.trim());
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

        if (mailUsername == null || mailUsername.trim().isEmpty()) {
            result.setSuccess(false);
            result.setMessage("Sender email is missing. Set your Gmail address in settings.");
            return result;
        }

        if (mailPassword == null || mailPassword.trim().isEmpty()) {
            result.setSuccess(false);
            result.setMessage("Google App Password is not configured. Please paste your 16-character App Password.");
            return result;
        }

        try {
            JavaMailSender sender = getEffectiveMailSender();
            MimeMessage mimeMessage = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(mailUsername.trim(), "SkillX Academy");
            helper.setTo(target);
            helper.setSubject("🧪 Test Verification: SkillX Attendance Real-Time Email System");

            String html = "<!DOCTYPE html><html><body style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;background:#0f172a;padding:24px;color:#f8fafc;'>" +
                    "<div style='max-width:520px;margin:auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid #334155;'>" +
                    "<h2 style='color:#38bdf8;margin-top:0;'>🧪 SMTP Connection Verified!</h2>" +
                    "<p style='color:#cbd5e1;font-size:14px;line-height:1.6;'>This test email confirms that your <strong>SkillX Real-Time Attendance System</strong> is successfully connected to Gmail SMTP and delivering emails.</p>" +
                    "<div style='background:#0f172a;border-radius:10px;padding:16px;margin:20px 0;font-size:13px;border:1px solid #334155;'>" +
                    "<div><strong style='color:#94a3b8;'>Sender Account:</strong> <span style='color:#38bdf8;font-family:monospace;'>" + mailUsername.trim() + "</span></div>" +
                    "<div style='margin-top:8px;'><strong style='color:#94a3b8;'>Delivered To:</strong> <span style='color:#34d399;font-family:monospace;'>" + target + "</span></div>" +
                    "<div style='margin-top:8px;'><strong style='color:#94a3b8;'>Host & Port:</strong> <span style='color:#cbd5e1;font-family:monospace;'>" + mailHost + ":" + mailPort + "</span></div>" +
                    "<div style='margin-top:8px;'><strong style='color:#94a3b8;'>Timestamp:</strong> <span style='color:#cbd5e1;font-family:monospace;'>" + Instant.now() + "</span></div>" +
                    "</div>" +
                    "<p style='color:#34d399;font-weight:700;font-size:14px;margin-bottom:0;'>✓ Live Attendance QR scans will now deliver real-time notices to registered students!</p>" +
                    "</div></body></html>";

            helper.setText(
                    "SMTP Test Verification Success!\n\nSender: " + mailUsername.trim() + "\nRecipient: " + target + "\nHost: " + mailHost + ":" + mailPort + "\nTime: " + Instant.now(),
                    html
            );

            sender.send(mimeMessage);
            result.setSuccess(true);
            result.setMessage("Test email successfully delivered to " + target + "! Check your inbox (or Spam/Promotions folder).");

            try {
                jdbcTemplate.update("INSERT INTO email_logs (recipient_email, student_name, email_type, subject, status, error_message) VALUES (?, 'System Admin', 'TEST_EMAIL', '🧪 Test Verification', 'SENT', NULL)",
                        target);
            } catch (Exception ignored) {}

            return result;
        } catch (Exception ex) {
            String errorMsg = ex.getMessage();
            if (ex.getCause() != null && ex.getCause().getMessage() != null) {
                errorMsg += " -> " + ex.getCause().getMessage();
            }
            log.error("Failed to dispatch test email to {}: {}", target, errorMsg, ex);

            result.setSuccess(false);
            result.setMessage("SMTP Delivery Failed: " + errorMsg);
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
        if (request == null) {
            EmailDto.EmailTestResult res = new EmailDto.EmailTestResult();
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
            }
            if (request.getSmtpUsername() != null && !request.getSmtpUsername().trim().isEmpty()) {
                this.mailUsername = request.getSmtpUsername().trim();
                jdbcTemplate.update("INSERT INTO app_settings (setting_key, setting_value) VALUES ('smtp_username', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", mailUsername);
            }
            if (request.getSmtpPassword() != null && !request.getSmtpPassword().trim().isEmpty()) {
                this.mailPassword = request.getSmtpPassword().trim();
                jdbcTemplate.update("INSERT INTO app_settings (setting_key, setting_value) VALUES ('smtp_password', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", mailPassword);
            }
            if (request.getDefaultStudentEmail() != null && !request.getDefaultStudentEmail().trim().isEmpty()) {
                String defEmail = request.getDefaultStudentEmail().trim();
                jdbcTemplate.update("INSERT INTO app_settings (setting_key, setting_value) VALUES ('default_student_email', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", defEmail);
                jdbcTemplate.update("UPDATE users SET email = ? WHERE email LIKE '%@skillportal.com'", defEmail);
            }

            // Invalidate cached sender to use new credentials
            this.mailSender = null;

            // Immediately test dispatch to verify credentials
            return sendTestEmail(request.getDefaultStudentEmail());
        } catch (Exception e) {
            log.error("Failed to save SMTP settings: {}", e.getMessage(), e);
            EmailDto.EmailTestResult res = new EmailDto.EmailTestResult();
            res.setSuccess(false);
            res.setMessage("Failed to save settings: " + e.getMessage());
            return res;
        }
    }

    @Override
    public boolean updateStudentEmail(Long studentId, String newEmail) {
        if (studentId == null || newEmail == null || newEmail.trim().isEmpty()) {
            return false;
        }
        String cleanEmail = newEmail.trim();
        try {
            // Update users table by students.id
            jdbcTemplate.update("UPDATE users u JOIN students s ON s.user_id = u.id SET u.email = ? WHERE s.id = ?", cleanEmail, studentId);
            // Update users table directly by users.id
            jdbcTemplate.update("UPDATE users SET email = ? WHERE id = ?", cleanEmail, studentId);
            // Also store as default fallback
            jdbcTemplate.update("INSERT INTO app_settings (setting_key, setting_value) VALUES ('default_student_email', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", cleanEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to update student email: {}", e.getMessage());
            return false;
        }
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
