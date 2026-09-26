-- SKILL PORTAL Database Migration V13
-- Add app_settings table for dynamic runtime configurations like SMTP credentials

CREATE TABLE IF NOT EXISTS app_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO app_settings (setting_key, setting_value) VALUES
('smtp_host', 'smtp.gmail.com'),
('smtp_port', '587'),
('smtp_username', 'diggaviprajwal55@gmail.com'),
('default_student_email', 'diggaviprajwal55@gmail.com')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Also ensure student 11 and all demo students have active email
UPDATE users SET email = 'diggaviprajwal55@gmail.com' WHERE email LIKE '%@skillportal.com';
