package com.skillportal.email;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.frontend.url:https://skill-portal-1-mn1n.onrender.com}")
    private String frontendUrl;

    @Override
    public void sendAttendanceMarkedEmail(
            String recipientEmail,
            String studentName,
            String studentIdNumber,
            String batchName,
            String attendanceDate,
            String attendanceTime,
            String sessionTitle) {

        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            log.warn("Cannot dispatch attendance email: recipient email is missing for student {}", studentName);
            return;
        }

        final String targetEmail = recipientEmail.trim();
        final String effectiveStudentName = studentName != null ? studentName : "Student";
        final String effectiveStudentId = studentIdNumber != null ? studentIdNumber : "N/A";
        final String effectiveBatch = batchName != null ? batchName : "Classroom Batch";
        final String effectiveDate = attendanceDate != null ? attendanceDate : "";
        final String effectiveTime = attendanceTime != null ? attendanceTime : "";
        final String effectiveSession = sessionTitle != null ? sessionTitle : "Classroom Session";

        // Asynchronous non-blocking dispatch
        CompletableFuture.runAsync(() -> {
            String subject = "✅ Attendance Confirmed: Present for " + effectiveSession + " (" + effectiveDate + ")";
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

            if (mailSender != null && mailUsername != null && !mailUsername.trim().isEmpty()) {
                try {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setFrom(mailUsername, "SkillX Academy Attendance");
                    helper.setTo(targetEmail);
                    helper.setSubject(subject);
                    helper.setText(plainText, htmlContent);

                    mailSender.send(mimeMessage);
                    sentViaSmtp = true;
                    log.info("Real-time attendance email successfully dispatched via SMTP to {}", targetEmail);
                } catch (Exception ex) {
                    errorMessage = ex.getMessage();
                    log.warn("SMTP email delivery notice for {}: {}. Logged in audit registry.", targetEmail, ex.getMessage());
                }
            } else {
                log.info("[REAL-TIME ATTENDANCE EMAIL] Dispatched to: {} | Student: {} ({}) | Session: {} | Status: PRESENT | Time: {} {}",
                        targetEmail, effectiveStudentName, effectiveStudentId, effectiveSession, effectiveDate, effectiveTime);
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
                "<div class=\"container\">\n" +
                "  <div class=\"header\">\n" +
                "    <h1>SkillX Academy</h1>\n" +
                "    <p>Automated Attendance Verification</p>\n" +
                "  </div>\n" +
                "  <div class=\"body\">\n" +
                "    <div class=\"badge\">✔ ATTENDANCE RECORDED: PRESENT</div>\n" +
                "    <p style=\"font-size: 15px; margin: 0 0 14px 0;\">Hello <strong>" + studentName + "</strong>,</p>\n" +
                "    <p style=\"font-size: 13px; color: #475569; line-height: 1.6; margin: 0;\">\n" +
                "      Your attendance for <strong>" + sessionTitle + "</strong> has been successfully scanned and marked <strong>PRESENT</strong>.\n" +
                "    </p>\n" +
                "\n" +
                "    <div class=\"details\">\n" +
                "      <div class=\"row\"><span class=\"label\">Student Name:</span><span class=\"val\">" + studentName + "</span></div>\n" +
                "      <div class=\"row\"><span class=\"label\">Student ID:</span><span class=\"val\">" + studentId + "</span></div>\n" +
                "      <div class=\"row\"><span class=\"label\">Batch:</span><span class=\"val\">" + batchName + "</span></div>\n" +
                "      <div class=\"row\"><span class=\"label\">Date:</span><span class=\"val\">" + date + "</span></div>\n" +
                "      <div class=\"row\"><span class=\"label\">Scan Time:</span><span class=\"val\">" + time + "</span></div>\n" +
                "      <div class=\"row\"><span class=\"label\">Status:</span><span class=\"val\" style=\"color: #16a34a;\">PRESENT</span></div>\n" +
                "      <div class=\"row\"><span class=\"label\">Method:</span><span class=\"val\">Instructor QR Scanner</span></div>\n" +
                "    </div>\n" +
                "\n" +
                "    <div class=\"btn-container\">\n" +
                "      <a href=\"" + frontendUrl + "/attendance\" class=\"btn\">View Monthly Attendance</a>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "  <div class=\"footer\">\n" +
                "    <p>SkillX Academy · Automated Attendance Notification System</p>\n" +
                "    <p>This is a real-time verification confirmation. No reply is required.</p>\n" +
                "  </div>\n" +
                "</div>\n" +
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

        return "SkillX Academy - Attendance Verification\n\n" +
                "Hello " + studentName + ",\n\n" +
                "Your attendance has been successfully recorded as PRESENT for " + sessionTitle + ".\n\n" +
                "Details:\n" +
                "- Student Name: " + studentName + "\n" +
                "- Student ID: " + studentId + "\n" +
                "- Batch: " + batchName + "\n" +
                "- Date: " + date + "\n" +
                "- Time: " + time + "\n" +
                "- Status: PRESENT\n" +
                "- Verified Via: Instructor QR Scanner\n\n" +
                "You can view your full attendance log on the student portal: " + frontendUrl + "/attendance\n\n" +
                "--\nSkillX Academy Attendance Team";
    }
}
