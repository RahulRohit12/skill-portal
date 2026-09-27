-- SKILL PORTAL Database Schema Migration V14
-- Add live_classes table for real-time batch lecture sessions

CREATE TABLE IF NOT EXISTS live_classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NULL,
    batch_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_name VARCHAR(100) NOT NULL,
    meeting_link VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_live_classes_batch_status (batch_id, status),
    INDEX idx_live_classes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
