package com.skillportal.enrollment;

import java.time.LocalDateTime;

public class EnrollmentDto {

    public static class AdminEnrollmentGenerateRequest {
        private String fullName;
        private String email;
        private String studentIdNumber;
        private String phone;
        private String college;
        private String semesterOrYear;
        private Long batchId;
        private Long courseId;
        private Double amountInRupees; // e.g. 4999.00
        private String password;       // Optional pre-set password

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getStudentIdNumber() { return studentIdNumber; }
        public void setStudentIdNumber(String studentIdNumber) { this.studentIdNumber = studentIdNumber; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getCollege() { return college; }
        public void setCollege(String college) { this.college = college; }

        public String getSemesterOrYear() { return semesterOrYear; }
        public void setSemesterOrYear(String semesterOrYear) { this.semesterOrYear = semesterOrYear; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public Double getAmountInRupees() { return amountInRupees; }
        public void setAmountInRupees(Double amountInRupees) { this.amountInRupees = amountInRupees; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class EnrollmentGenerateResponse {
        private String enrollmentToken;
        private String paymentLink;
        private Double amountInRupees;
        private String studentName;
        private String email;
        private String batchName;
        private String courseTitle;

        public String getEnrollmentToken() { return enrollmentToken; }
        public void setEnrollmentToken(String enrollmentToken) { this.enrollmentToken = enrollmentToken; }

        public String getPaymentLink() { return paymentLink; }
        public void setPaymentLink(String paymentLink) { this.paymentLink = paymentLink; }

        public Double getAmountInRupees() { return amountInRupees; }
        public void setAmountInRupees(Double amountInRupees) { this.amountInRupees = amountInRupees; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getBatchName() { return batchName; }
        public void setBatchName(String batchName) { this.batchName = batchName; }

        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    }

    public static class StudentEnrollmentDetailResponse {
        private String enrollmentToken;
        private String fullName;
        private String email;
        private String studentIdNumber;
        private String phone;
        private String college;
        private Long batchId;
        private String batchName;
        private Long courseId;
        private String courseTitle;
        private Double amountInRupees;
        private Long amountInPaise;
        private String currency;
        private String paymentStatus;
        private String enrollmentStatus;
        private String razorpayKeyId;
        private boolean isPaid;

        public String getEnrollmentToken() { return enrollmentToken; }
        public void setEnrollmentToken(String enrollmentToken) { this.enrollmentToken = enrollmentToken; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getStudentIdNumber() { return studentIdNumber; }
        public void setStudentIdNumber(String studentIdNumber) { this.studentIdNumber = studentIdNumber; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getCollege() { return college; }
        public void setCollege(String college) { this.college = college; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public String getBatchName() { return batchName; }
        public void setBatchName(String batchName) { this.batchName = batchName; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

        public Double getAmountInRupees() { return amountInRupees; }
        public void setAmountInRupees(Double amountInRupees) { this.amountInRupees = amountInRupees; }

        public Long getAmountInPaise() { return amountInPaise; }
        public void setAmountInPaise(Long amountInPaise) { this.amountInPaise = amountInPaise; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

        public String getEnrollmentStatus() { return enrollmentStatus; }
        public void setEnrollmentStatus(String enrollmentStatus) { this.enrollmentStatus = enrollmentStatus; }

        public String getRazorpayKeyId() { return razorpayKeyId; }
        public void setRazorpayKeyId(String razorpayKeyId) { this.razorpayKeyId = razorpayKeyId; }

        public boolean isPaid() { return isPaid; }
        public void setPaid(boolean paid) { isPaid = paid; }
    }

    public static class RazorpayOrderCreateResponse {
        private String orderId;
        private Long amount;
        private String currency;
        private String keyId;
        private String studentName;
        private String studentEmail;
        private String studentPhone;
        private String courseTitle;

        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }

        public Long getAmount() { return amount; }
        public void setAmount(Long amount) { this.amount = amount; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getKeyId() { return keyId; }
        public void setKeyId(String keyId) { this.keyId = keyId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getStudentEmail() { return studentEmail; }
        public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

        public String getStudentPhone() { return studentPhone; }
        public void setStudentPhone(String studentPhone) { this.studentPhone = studentPhone; }

        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    }

    public static class PaymentVerificationRequest {
        private String razorpayPaymentId;
        private String razorpayOrderId;
        private String razorpaySignature;
        private String password;

        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class EnrollmentAdminItem {
        private Long id;
        private String enrollmentToken;
        private String fullName;
        private String email;
        private String studentIdNumber;
        private String phone;
        private String college;
        private Long batchId;
        private String batchName;
        private Long courseId;
        private String courseTitle;
        private Double amountInRupees;
        private String paymentStatus;
        private String enrollmentStatus;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private Long studentUserId;
        private String createdAt;
        private String paidAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEnrollmentToken() { return enrollmentToken; }
        public void setEnrollmentToken(String enrollmentToken) { this.enrollmentToken = enrollmentToken; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getStudentIdNumber() { return studentIdNumber; }
        public void setStudentIdNumber(String studentIdNumber) { this.studentIdNumber = studentIdNumber; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getCollege() { return college; }
        public void setCollege(String college) { this.college = college; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public String getBatchName() { return batchName; }
        public void setBatchName(String batchName) { this.batchName = batchName; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

        public Double getAmountInRupees() { return amountInRupees; }
        public void setAmountInRupees(Double amountInRupees) { this.amountInRupees = amountInRupees; }

        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

        public String getEnrollmentStatus() { return enrollmentStatus; }
        public void setEnrollmentStatus(String enrollmentStatus) { this.enrollmentStatus = enrollmentStatus; }

        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

        public Long getStudentUserId() { return studentUserId; }
        public void setStudentUserId(Long studentUserId) { this.studentUserId = studentUserId; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

        public String getPaidAt() { return paidAt; }
        public void setPaidAt(String paidAt) { this.paidAt = paidAt; }
    }
}
