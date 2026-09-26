package com.skillportal.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class AttendanceDto {

    public static class StudentAttendanceSummary {
        private double overallPercentage;
        private int totalClasses;
        private int presentClasses;
        private int absentClasses;
        private List<SubjectAttendanceStat> subjectWise;
        private List<AttendanceHistoryItem> history;

        public double getOverallPercentage() { return overallPercentage; }
        public void setOverallPercentage(double overallPercentage) { this.overallPercentage = overallPercentage; }

        public int getTotalClasses() { return totalClasses; }
        public void setTotalClasses(int totalClasses) { this.totalClasses = totalClasses; }

        public int getPresentClasses() { return presentClasses; }
        public void setPresentClasses(int presentClasses) { this.presentClasses = presentClasses; }

        public int getAbsentClasses() { return absentClasses; }
        public void setAbsentClasses(int absentClasses) { this.absentClasses = absentClasses; }

        public List<SubjectAttendanceStat> getSubjectWise() { return subjectWise; }
        public void setSubjectWise(List<SubjectAttendanceStat> subjectWise) { this.subjectWise = subjectWise; }

        public List<AttendanceHistoryItem> getHistory() { return history; }
        public void setHistory(List<AttendanceHistoryItem> history) { this.history = history; }
    }

    public static class SubjectAttendanceStat {
        private Long subjectId;
        private String subjectTitle;
        private int totalClasses;
        private int presentClasses;
        private double percentage;

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public String getSubjectTitle() { return subjectTitle; }
        public void setSubjectTitle(String subjectTitle) { this.subjectTitle = subjectTitle; }

        public int getTotalClasses() { return totalClasses; }
        public void setTotalClasses(int totalClasses) { this.totalClasses = totalClasses; }

        public int getPresentClasses() { return presentClasses; }
        public void setPresentClasses(int presentClasses) { this.presentClasses = presentClasses; }

        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
    }

    public static class AttendanceHistoryItem {
        private Long sessionId;
        private String sessionTitle;
        private String subjectTitle;
        private String sessionDate;
        private String status; // PRESENT, ABSENT, LATE, EXCUSED
        private String remarks;

        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

        public String getSessionTitle() { return sessionTitle; }
        public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }

        public String getSubjectTitle() { return subjectTitle; }
        public void setSubjectTitle(String subjectTitle) { this.subjectTitle = subjectTitle; }

        public String getSessionDate() { return sessionDate; }
        public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public static class CreateSessionRequest {
        @NotNull(message = "Batch ID is required")
        private Long batchId;

        private Long subjectId;

        @NotBlank(message = "Session title is required")
        private String title;

        @NotBlank(message = "Session date (YYYY-MM-DD) is required")
        private String sessionDate;

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getSessionDate() { return sessionDate; }
        public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }
    }

    public static class MarkRecordItem {
        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotBlank(message = "Status is required (PRESENT, ABSENT, LATE, EXCUSED)")
        private String status;

        private String remarks;

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public static class MyQrCodeResponse {
        private Long studentId;
        private String studentIdNumber;
        private String fullName;
        private String email;
        private String phone;
        private String college;
        private Long batchId;
        private String batchName;
        private String courseTitle;
        private String qrToken;
        private String qrStatus;
        private String qrGeneratedAt;

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getStudentIdNumber() { return studentIdNumber; }
        public void setStudentIdNumber(String studentIdNumber) { this.studentIdNumber = studentIdNumber; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getCollege() { return college; }
        public void setCollege(String college) { this.college = college; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public String getBatchName() { return batchName; }
        public void setBatchName(String batchName) { this.batchName = batchName; }

        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

        public String getQrToken() { return qrToken; }
        public void setQrToken(String qrToken) { this.qrToken = qrToken; }

        public String getQrStatus() { return qrStatus; }
        public void setQrStatus(String qrStatus) { this.qrStatus = qrStatus; }

        public String getQrGeneratedAt() { return qrGeneratedAt; }
        public void setQrGeneratedAt(String qrGeneratedAt) { this.qrGeneratedAt = qrGeneratedAt; }
    }

    public static class QrScanRequest {
        @NotBlank(message = "QR Token is required")
        private String qrToken;

        private Long sessionId;
        private String deviceInfo;

        public String getQrToken() { return qrToken; }
        public void setQrToken(String qrToken) { this.qrToken = qrToken; }

        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

        public String getDeviceInfo() { return deviceInfo; }
        public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
    }

    public static class StudentBasicInfo {
        private Long id;
        private String studentIdNumber;
        private String fullName;
        private String email;
        private String batchName;
        private String avatarUrl;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getStudentIdNumber() { return studentIdNumber; }
        public void setStudentIdNumber(String studentIdNumber) { this.studentIdNumber = studentIdNumber; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getBatchName() { return batchName; }
        public void setBatchName(String batchName) { this.batchName = batchName; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public static class QrScanResponse {
        private String attendanceStatus; // PRESENT, ALREADY_MARKED, INVALID_QR, INACTIVE_STUDENT, REVOKED
        private String message;
        private StudentBasicInfo student;
        private String attendanceDate;
        private String attendanceTime;
        private Long sessionId;
        private String sessionTitle;
        private String source;
        private String markedAt;
        private String existingMarkedAt;

        public String getAttendanceStatus() { return attendanceStatus; }
        public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public StudentBasicInfo getStudent() { return student; }
        public void setStudent(StudentBasicInfo student) { this.student = student; }

        public String getAttendanceDate() { return attendanceDate; }
        public void setAttendanceDate(String attendanceDate) { this.attendanceDate = attendanceDate; }

        public String getAttendanceTime() { return attendanceTime; }
        public void setAttendanceTime(String attendanceTime) { this.attendanceTime = attendanceTime; }

        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

        public String getSessionTitle() { return sessionTitle; }
        public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public String getMarkedAt() { return markedAt; }
        public void setMarkedAt(String markedAt) { this.markedAt = markedAt; }

        public String getExistingMarkedAt() { return existingMarkedAt; }
        public void setExistingMarkedAt(String existingMarkedAt) { this.existingMarkedAt = existingMarkedAt; }
    }

    public static class CalendarDayStat {
        private String date; // YYYY-MM-DD
        private String dayOfWeek;
        private String status; // PRESENT, ABSENT, NO_SESSION
        private String sessionTitle;
        private String markedAt;
        private String source; // QR_SCAN, MANUAL

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getSessionTitle() { return sessionTitle; }
        public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }

        public String getMarkedAt() { return markedAt; }
        public void setMarkedAt(String markedAt) { this.markedAt = markedAt; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }
    }

    public static class CalendarAttendanceResponse {
        private int year;
        private int month;
        private int totalSessions;
        private int presentCount;
        private int absentCount;
        private double attendancePercentage;
        private List<CalendarDayStat> days;

        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }

        public int getMonth() { return month; }
        public void setMonth(int month) { this.month = month; }

        public int getTotalSessions() { return totalSessions; }
        public void setTotalSessions(int totalSessions) { this.totalSessions = totalSessions; }

        public int getPresentCount() { return presentCount; }
        public void setPresentCount(int presentCount) { this.presentCount = presentCount; }

        public int getAbsentCount() { return absentCount; }
        public void setAbsentCount(int absentCount) { this.absentCount = absentCount; }

        public double getAttendancePercentage() { return attendancePercentage; }
        public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

        public List<CalendarDayStat> getDays() { return days; }
        public void setDays(List<CalendarDayStat> days) { this.days = days; }
    }

    public static class TodayScanItem {
        private Long recordId;
        private Long studentId;
        private String studentIdNumber;
        private String studentName;
        private String batchName;
        private String status;
        private String scanTime;
        private String markedByAdminName;
        private String source;
        private String remarks;

        public Long getRecordId() { return recordId; }
        public void setRecordId(Long recordId) { this.recordId = recordId; }

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getStudentIdNumber() { return studentIdNumber; }
        public void setStudentIdNumber(String studentIdNumber) { this.studentIdNumber = studentIdNumber; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getBatchName() { return batchName; }
        public void setBatchName(String batchName) { this.batchName = batchName; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getScanTime() { return scanTime; }
        public void setScanTime(String scanTime) { this.scanTime = scanTime; }

        public String getMarkedByAdminName() { return markedByAdminName; }
        public void setMarkedByAdminName(String markedByAdminName) { this.markedByAdminName = markedByAdminName; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
}
