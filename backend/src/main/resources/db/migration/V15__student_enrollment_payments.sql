-- SKILL PORTAL Database Schema Migration V15
-- Add student_enrollments table for secure payment-based student enrollment flow

CREATE TABLE IF NOT EXISTS student_enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enrollment_token VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    student_id_number VARCHAR(50) NOT NULL,
    phone VARCHAR(30) NULL,
    college VARCHAR(200) NULL,
    semester_or_year VARCHAR(50) NULL,
    batch_id BIGINT NOT NULL,
    course_id BIGINT NULL,
    amount_in_paise BIGINT NOT NULL DEFAULT 499900,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',    -- PENDING, PAID, FAILED, REFUNDED
    enrollment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',  -- PENDING, COMPLETED, EXPIRED
    razorpay_order_id VARCHAR(100) NULL,
    razorpay_payment_id VARCHAR(100) NULL,
    razorpay_signature VARCHAR(255) NULL,
    student_user_id BIGINT NULL,                              -- Populated ONLY upon verified payment
    created_by_admin_id BIGINT NULL,
    password_hash VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE RESTRICT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_enrollment_token (enrollment_token),
    INDEX idx_enrollment_status (enrollment_status, payment_status),
    INDEX idx_enrollment_email (email),
    INDEX idx_enrollment_order_id (razorpay_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
