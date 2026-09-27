package com.skillportal.admin;

import java.util.List;

public class AdminDto {

    public static class AdminOverview {
        private int totalStudents;
        private int activeStudents;
        private int inactiveStudents;
        private int totalCourses;
        private int totalBatches;
        private int totalAssignments;
        private int totalTests;
        private int totalQuestions;
        private int totalSubmissions;
        private int totalAttendanceSessions;
        private double averageAttendance;
        private double averageTestScore;
        private double assignmentCompletionRate;
        private List<StudentAdminItem> recentStudents;
        private List<SubmissionAdminItem> recentSubmissions;
        private List<UpcomingAdminEvent> upcomingTests;
        private List<UpcomingAdminEvent> upcomingAssignments;

        public int getTotalStudents() { return totalStudents; }
        public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }

        public int getActiveStudents() { return activeStudents; }
        public void setActiveStudents(int activeStudents) { this.activeStudents = activeStudents; }

        public int getInactiveStudents() { return inactiveStudents; }
        public void setInactiveStudents(int inactiveStudents) { this.inactiveStudents = inactiveStudents; }

        public int getTotalCourses() { return totalCourses; }
        public void setTotalCourses(int totalCourses) { this.totalCourses = totalCourses; }

        public int getTotalBatches() { return totalBatches; }
        public void setTotalBatches(int totalBatches) { this.totalBatches = totalBatches; }

        public int getTotalAssignments() { return totalAssignments; }
        public void setTotalAssignments(int totalAssignments) { this.totalAssignments = totalAssignments; }

        public int getTotalTests() { return totalTests; }
        public void setTotalTests(int totalTests) { this.totalTests = totalTests; }

        public int getTotalQuestions() { return totalQuestions; }
        public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

        public int getTotalSubmissions() { return totalSubmissions; }
        public void setTotalSubmissions(int totalSubmissions) { this.totalSubmissions = totalSubmissions; }

        public int getTotalAttendanceSessions() { return totalAttendanceSessions; }
        public void setTotalAttendanceSessions(int totalAttendanceSessions) { this.totalAttendanceSessions = totalAttendanceSessions; }

        public double getAverageAttendance() { return averageAttendance; }
        public void setAverageAttendance(double averageAttendance) { this.averageAttendance = averageAttendance; }

        public double getAverageTestScore() { return averageTestScore; }
        public void setAverageTestScore(double averageTestScore) { this.averageTestScore = averageTestScore; }

        public double getAssignmentCompletionRate() { return assignmentCompletionRate; }
        public void setAssignmentCompletionRate(double assignmentCompletionRate) { this.assignmentCompletionRate = assignmentCompletionRate; }

        public List<StudentAdminItem> getRecentStudents() { return recentStudents; }
        public void setRecentStudents(List<StudentAdminItem> recentStudents) { this.recentStudents = recentStudents; }

        public List<SubmissionAdminItem> getRecentSubmissions() { return recentSubmissions; }
        public void setRecentSubmissions(List<SubmissionAdminItem> recentSubmissions) { this.recentSubmissions = recentSubmissions; }

        public List<UpcomingAdminEvent> getUpcomingTests() { return upcomingTests; }
        public void setUpcomingTests(List<UpcomingAdminEvent> upcomingTests) { this.upcomingTests = upcomingTests; }

        public List<UpcomingAdminEvent> getUpcomingAssignments() { return upcomingAssignments; }
        public void setUpcomingAssignments(List<UpcomingAdminEvent> upcomingAssignments) { this.upcomingAssignments = upcomingAssignments; }
    }

    public static class UpcomingAdminEvent {
        private Long id;
        private String title;
        private String deadline;
        private String targetBatch;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDeadline() { return deadline; }
        public void setDeadline(String deadline) { this.deadline = deadline; }

        public String getTargetBatch() { return targetBatch; }
        public void setTargetBatch(String targetBatch) { this.targetBatch = targetBatch; }
    }

    public static class StudentAdminItem {
        private Long userId;
        private Long studentId;
        private String name;
        private String email;
        private String studentIdNumber;
        private String phone;
        private String college;
        private Long batchId;
        private String batchName;
        private Long courseId;
        private String courseTitle;
        private String status;
        private int points;
        private double attendancePercentage;
        private double assignmentProgress;
        private double testPerformance;
        private int solvedProblems;
        private String createdAt;
        private String qrToken;
        private String qrStatus;

        public String getQrToken() { return qrToken; }
        public void setQrToken(String qrToken) { this.qrToken = qrToken; }

        public String getQrStatus() { return qrStatus; }
        public void setQrStatus(String qrStatus) { this.qrStatus = qrStatus; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

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

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getPoints() { return points; }
        public void setPoints(int points) { this.points = points; }

        public double getAttendancePercentage() { return attendancePercentage; }
        public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

        public double getAssignmentProgress() { return assignmentProgress; }
        public void setAssignmentProgress(double assignmentProgress) { this.assignmentProgress = assignmentProgress; }

        public double getTestPerformance() { return testPerformance; }
        public void setTestPerformance(double testPerformance) { this.testPerformance = testPerformance; }

        public int getSolvedProblems() { return solvedProblems; }
        public void setSolvedProblems(int solvedProblems) { this.solvedProblems = solvedProblems; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class StudentCreateRequest {
        private String fullName;
        private String studentCode;
        private String email;
        private String phone;
        private String college;
        private Long batchId;
        private Long courseId;
        private String semesterOrYear;
        private String password;
        private String confirmPassword;
        private String status;
        private String avatarUrl;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getStudentCode() { return studentCode; }
        public void setStudentCode(String studentCode) { this.studentCode = studentCode; }
        public String getStudentIdNumber() { return studentCode; }
        public void setStudentIdNumber(String studentIdNumber) { this.studentCode = studentIdNumber; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getCollege() { return college; }
        public void setCollege(String college) { this.college = college; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public String getSemesterOrYear() { return semesterOrYear; }
        public void setSemesterOrYear(String semesterOrYear) { this.semesterOrYear = semesterOrYear; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public static class StudentUpdateRequest {
        private String fullName;
        private String studentCode;
        private String email;
        private String phone;
        private String college;
        private Long batchId;
        private Long courseId;
        private String semesterOrYear;
        private String status;
        private String avatarUrl;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getStudentCode() { return studentCode; }
        public void setStudentCode(String studentCode) { this.studentCode = studentCode; }
        public String getStudentIdNumber() { return studentCode; }
        public void setStudentIdNumber(String studentIdNumber) { this.studentCode = studentIdNumber; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getCollege() { return college; }
        public void setCollege(String college) { this.college = college; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public String getSemesterOrYear() { return semesterOrYear; }
        public void setSemesterOrYear(String semesterOrYear) { this.semesterOrYear = semesterOrYear; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public static class StudentDetailResponse {
        private StudentAdminItem profile;
        private List<StudentAttendanceRecordItem> attendanceRecords;
        private List<StudentAssignmentAttemptItem> assignmentAttempts;
        private List<StudentTestAttemptItem> testAttempts;
        private List<SubmissionAdminItem> codingSubmissions;
        private List<StudentActivityItem> activityLog;

        public StudentAdminItem getProfile() { return profile; }
        public void setProfile(StudentAdminItem profile) { this.profile = profile; }

        public List<StudentAttendanceRecordItem> getAttendanceRecords() { return attendanceRecords; }
        public void setAttendanceRecords(List<StudentAttendanceRecordItem> attendanceRecords) { this.attendanceRecords = attendanceRecords; }

        public List<StudentAssignmentAttemptItem> getAssignmentAttempts() { return assignmentAttempts; }
        public void setAssignmentAttempts(List<StudentAssignmentAttemptItem> assignmentAttempts) { this.assignmentAttempts = assignmentAttempts; }

        public List<StudentTestAttemptItem> getTestAttempts() { return testAttempts; }
        public void setTestAttempts(List<StudentTestAttemptItem> testAttempts) { this.testAttempts = testAttempts; }

        public List<SubmissionAdminItem> getCodingSubmissions() { return codingSubmissions; }
        public void setCodingSubmissions(List<SubmissionAdminItem> codingSubmissions) { this.codingSubmissions = codingSubmissions; }

        public List<StudentActivityItem> getActivityLog() { return activityLog; }
        public void setActivityLog(List<StudentActivityItem> activityLog) { this.activityLog = activityLog; }
    }

    public static class StudentAttendanceRecordItem {
        private Long sessionId;
        private String sessionDate;
        private String topic;
        private String status;
        private String remarks;

        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

        public String getSessionDate() { return sessionDate; }
        public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }

        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public static class StudentAssignmentAttemptItem {
        private Long assignmentId;
        private String title;
        private String status;
        private int marksObtained;
        private int totalMarks;
        private String submittedAt;

        public Long getAssignmentId() { return assignmentId; }
        public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getMarksObtained() { return marksObtained; }
        public void setMarksObtained(int marksObtained) { this.marksObtained = marksObtained; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public String getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }
    }

    public static class StudentTestAttemptItem {
        private Long testId;
        private String title;
        private int score;
        private int totalMarks;
        private double percentage;
        private String status;
        private String submittedAt;

        public Long getTestId() { return testId; }
        public void setTestId(Long testId) { this.testId = testId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }
    }

    public static class StudentActivityItem {
        private String eventType;
        private String details;
        private String createdAt;

        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }

        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class SubmissionAdminItem {
        private Long submissionId;
        private String studentName;
        private String questionTitle;
        private String language;
        private String status;
        private int runtimeMs;
        private String submittedAt;

        public Long getSubmissionId() { return submissionId; }
        public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getQuestionTitle() { return questionTitle; }
        public void setQuestionTitle(String questionTitle) { this.questionTitle = questionTitle; }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getRuntimeMs() { return runtimeMs; }
        public void setRuntimeMs(int runtimeMs) { this.runtimeMs = runtimeMs; }

        public String getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }
    }

    public static class BatchItem {
        private Long id;
        private String name;
        private String code;
        private String description;
        private Long courseId;
        private String courseTitle;
        private String startDate;
        private String endDate;
        private boolean isActive;
        private int totalStudents;
        private int activeStudents;
        private double averageAttendance;
        private double assignmentCompletion;
        private double averageTestScore;
        private int solvedCodingProblems;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }

        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }

        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }

        public int getTotalStudents() { return totalStudents; }
        public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }

        public int getActiveStudents() { return activeStudents; }
        public void setActiveStudents(int activeStudents) { this.activeStudents = activeStudents; }

        public double getAverageAttendance() { return averageAttendance; }
        public void setAverageAttendance(double averageAttendance) { this.averageAttendance = averageAttendance; }

        public double getAssignmentCompletion() { return assignmentCompletion; }
        public void setAssignmentCompletion(double assignmentCompletion) { this.assignmentCompletion = assignmentCompletion; }

        public double getAverageTestScore() { return averageTestScore; }
        public void setAverageTestScore(double averageTestScore) { this.averageTestScore = averageTestScore; }

        public int getSolvedCodingProblems() { return solvedCodingProblems; }
        public void setSolvedCodingProblems(int solvedCodingProblems) { this.solvedCodingProblems = solvedCodingProblems; }
    }

    public static class BatchCreateRequest {
        private String name;
        private String code;
        private String description;
        private Long courseId;
        private String startDate;
        private String endDate;
        private boolean isActive = true;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }

        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }

        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }
    }

    public static class CourseItem {
        private Long id;
        private String title;
        private String slug;
        private String description;
        private String thumbnailUrl;
        private int orderIndex;
        private boolean isPublished;
        private int totalSubjects;
        private int totalStudents;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { isPublished = published; }

        public int getTotalSubjects() { return totalSubjects; }
        public void setTotalSubjects(int totalSubjects) { this.totalSubjects = totalSubjects; }

        public int getTotalStudents() { return totalStudents; }
        public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
    }

    public static class CourseCreateRequest {
        private String title;
        private String slug;
        private String description;
        private String thumbnailUrl;
        private int orderIndex = 0;
        private boolean isPublished = true;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { isPublished = published; }
    }

    public static class SubjectCreateRequest {
        private Long courseId;
        private String title;
        private String description;
        private int orderIndex = 0;
        private boolean isPublished = true;

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { isPublished = published; }
    }

    public static class ModuleCreateRequest {
        private Long subjectId;
        private String title;
        private String description;
        private int orderIndex = 0;
        private boolean isPublished = true;

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { isPublished = published; }
    }

    public static class TopicCreateRequest {
        private Long moduleId;
        private String title;
        private String description;
        private int orderIndex = 0;
        private boolean isPublished = true;

        public Long getModuleId() { return moduleId; }
        public void setModuleId(Long moduleId) { this.moduleId = moduleId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { isPublished = published; }

        private String videoUrl;
        private String videoTitle;
        private int durationMinutes = 30;
        private String thumbnailUrl;

        public String getVideoUrl() { return videoUrl; }
        public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

        public String getVideoTitle() { return videoTitle; }
        public void setVideoTitle(String videoTitle) { this.videoTitle = videoTitle; }

        public int getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    }

    public static class QuestionBankItem {
        private Long id;
        private String title;
        private String description;
        private String questionType;
        private String difficulty;
        private int marks;
        private int negativeMarks;
        private Long topicId;
        private String topicTitle;
        private String subjectTitle;
        private String courseTitle;
        private String tags;
        private boolean isActive;
        private List<QuestionOptionItem> options;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getQuestionType() { return questionType; }
        public void setQuestionType(String questionType) { this.questionType = questionType; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public int getMarks() { return marks; }
        public void setMarks(int marks) { this.marks = marks; }

        public int getNegativeMarks() { return negativeMarks; }
        public void setNegativeMarks(int negativeMarks) { this.negativeMarks = negativeMarks; }

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }

        public String getTopicTitle() { return topicTitle; }
        public void setTopicTitle(String topicTitle) { this.topicTitle = topicTitle; }

        public String getSubjectTitle() { return subjectTitle; }
        public void setSubjectTitle(String subjectTitle) { this.subjectTitle = subjectTitle; }

        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

        public String getTags() { return tags; }
        public void setTags(String tags) { this.tags = tags; }

        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }

        public List<QuestionOptionItem> getOptions() { return options; }
        public void setOptions(List<QuestionOptionItem> options) { this.options = options; }
    }

    public static class QuestionOptionItem {
        private Long id;
        private String optionLabel;
        private String optionText;
        private boolean isCorrect;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getOptionLabel() { return optionLabel; }
        public void setOptionLabel(String optionLabel) { this.optionLabel = optionLabel; }

        public String getOptionText() { return optionText; }
        public void setOptionText(String optionText) { this.optionText = optionText; }

        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }
    }

    public static class QuestionCreateRequest {
        private String title;
        private String description;
        private String explanation;
        private String questionType; // MCQ_SINGLE, MCQ_MULTI, CODING, SHORT_ANSWER
        private String difficulty; // EASY, MEDIUM, HARD
        private int marks = 10;
        private int negativeMarks = 0;
        private Long topicId;
        private String tags;
        private boolean isActive = true;
        private List<QuestionOptionItem> options;
        private CodingSpecsDto codingSpecs;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }

        public String getQuestionType() { return questionType; }
        public void setQuestionType(String questionType) { this.questionType = questionType; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public int getMarks() { return marks; }
        public void setMarks(int marks) { this.marks = marks; }

        public int getNegativeMarks() { return negativeMarks; }
        public void setNegativeMarks(int negativeMarks) { this.negativeMarks = negativeMarks; }

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }

        public String getTags() { return tags; }
        public void setTags(String tags) { this.tags = tags; }

        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }

        public List<QuestionOptionItem> getOptions() { return options; }
        public void setOptions(List<QuestionOptionItem> options) { this.options = options; }

        public CodingSpecsDto getCodingSpecs() { return codingSpecs; }
        public void setCodingSpecs(CodingSpecsDto codingSpecs) { this.codingSpecs = codingSpecs; }
    }

    public static class CodingSpecsDto {
        private String problemStatement;
        private String inputFormat;
        private String outputFormat;
        private String constraints;
        private String starterCodeJava;
        private String starterCodePython;
        private String starterCodeJs;
        private int timeLimitMs = 2000;
        private int memoryLimitMb = 256;
        private String sampleInput;
        private String sampleOutput;
        private List<TestCaseItem> testCases;

        public String getProblemStatement() { return problemStatement; }
        public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }

        public String getInputFormat() { return inputFormat; }
        public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }

        public String getOutputFormat() { return outputFormat; }
        public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }

        public String getConstraints() { return constraints; }
        public void setConstraints(String constraints) { this.constraints = constraints; }

        public String getStarterCodeJava() { return starterCodeJava; }
        public void setStarterCodeJava(String starterCodeJava) { this.starterCodeJava = starterCodeJava; }

        public String getStarterCodePython() { return starterCodePython; }
        public void setStarterCodePython(String starterCodePython) { this.starterCodePython = starterCodePython; }

        public String getStarterCodeJs() { return starterCodeJs; }
        public void setStarterCodeJs(String starterCodeJs) { this.starterCodeJs = starterCodeJs; }

        public int getTimeLimitMs() { return timeLimitMs; }
        public void setTimeLimitMs(int timeLimitMs) { this.timeLimitMs = timeLimitMs; }

        public int getMemoryLimitMb() { return memoryLimitMb; }
        public void setMemoryLimitMb(int memoryLimitMb) { this.memoryLimitMb = memoryLimitMb; }

        public String getSampleInput() { return sampleInput; }
        public void setSampleInput(String sampleInput) { this.sampleInput = sampleInput; }

        public String getSampleOutput() { return sampleOutput; }
        public void setSampleOutput(String sampleOutput) { this.sampleOutput = sampleOutput; }

        public List<TestCaseItem> getTestCases() { return testCases; }
        public void setTestCases(List<TestCaseItem> testCases) { this.testCases = testCases; }
    }

    public static class TestCaseItem {
        private String inputData;
        private String expectedOutput;
        private boolean isHidden;

        public String getInputData() { return inputData; }
        public void setInputData(String inputData) { this.inputData = inputData; }

        public String getExpectedOutput() { return expectedOutput; }
        public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

        public boolean isHidden() { return isHidden; }
        public void setHidden(boolean hidden) { isHidden = hidden; }
    }

    public static class AssignmentAdminItem {
        private Long id;
        private String title;
        private String description;
        private Long courseId;
        private String courseTitle;
        private Long batchId;
        private String batchName;
        private String difficulty;
        private int totalMarks;
        private int passingMarks;
        private int maxAttempts;
        private String startDate;
        private String dueDate;
        private boolean isPublished;
        private int totalSections;
        private int totalQuestions;
        private int studentCompletions;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public String getBatchName() { return batchName; }
        public void setBatchName(String batchName) { this.batchName = batchName; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public int getPassingMarks() { return passingMarks; }
        public void setPassingMarks(int passingMarks) { this.passingMarks = passingMarks; }

        public int getMaxAttempts() { return maxAttempts; }
        public void setMaxAttempts(int maxAttempts) { this.maxAttempts = maxAttempts; }

        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }

        public String getDueDate() { return dueDate; }
        public void setDueDate(String dueDate) { this.dueDate = dueDate; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { isPublished = published; }

        public int getTotalSections() { return totalSections; }
        public void setTotalSections(int totalSections) { this.totalSections = totalSections; }

        public int getTotalQuestions() { return totalQuestions; }
        public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

        public int getStudentCompletions() { return studentCompletions; }
        public void setStudentCompletions(int studentCompletions) { this.studentCompletions = studentCompletions; }
    }

    public static class AssignmentCreateRequest {
        private String title;
        private String description;
        private Long courseId;
        private Long subjectId;
        private Long topicId;
        private Long batchId;
        private String difficulty = "MEDIUM";
        private int totalMarks = 50;
        private int passingMarks = 20;
        private int maxAttempts = 3;
        private String startDate;
        private String dueDate;
        private boolean isPublished = true;
        private List<AssignmentSectionCreateDto> sections;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public int getPassingMarks() { return passingMarks; }
        public void setPassingMarks(int passingMarks) { this.passingMarks = passingMarks; }

        public int getMaxAttempts() { return maxAttempts; }
        public void setMaxAttempts(int maxAttempts) { this.maxAttempts = maxAttempts; }

        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }

        public String getDueDate() { return dueDate; }
        public void setDueDate(String dueDate) { this.dueDate = dueDate; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { isPublished = published; }

        public List<AssignmentSectionCreateDto> getSections() { return sections; }
        public void setSections(List<AssignmentSectionCreateDto> sections) { this.sections = sections; }
    }

    public static class AssignmentSectionCreateDto {
        private String title;
        private String description;
        private int sectionNumber;
        private List<Long> questionIds;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public int getSectionNumber() { return sectionNumber; }
        public void setSectionNumber(int sectionNumber) { this.sectionNumber = sectionNumber; }

        public List<Long> getQuestionIds() { return questionIds; }
        public void setQuestionIds(List<Long> questionIds) { this.questionIds = questionIds; }
    }

    public static class TestAdminItem {
        private Long id;
        private String title;
        private String description;
        private Long courseId;
        private String courseTitle;
        private Long batchId;
        private String batchName;
        private int durationMinutes;
        private int totalMarks;
        private int passingPercentage;
        private int negativeMarks;
        private String startTime;
        private String endTime;
        private int attemptLimit;
        private boolean isPublished;
        private int totalQuestions;
        private int studentAttempts;
        private double averageScore;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public String getBatchName() { return batchName; }
        public void setBatchName(String batchName) { this.batchName = batchName; }

        public int getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public int getPassingPercentage() { return passingPercentage; }
        public void setPassingPercentage(int passingPercentage) { this.passingPercentage = passingPercentage; }

        public int getNegativeMarks() { return negativeMarks; }
        public void setNegativeMarks(int negativeMarks) { this.negativeMarks = negativeMarks; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }

        public int getAttemptLimit() { return attemptLimit; }
        public void setAttemptLimit(int attemptLimit) { this.attemptLimit = attemptLimit; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { isPublished = published; }

        public int getTotalQuestions() { return totalQuestions; }
        public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

        public int getStudentAttempts() { return studentAttempts; }
        public void setStudentAttempts(int studentAttempts) { this.studentAttempts = studentAttempts; }

        public double getAverageScore() { return averageScore; }
        public void setAverageScore(double averageScore) { this.averageScore = averageScore; }
    }

    public static class TestCreateRequest {
        private String title;
        private String description;
        private Long courseId;
        private Long batchId;
        private int durationMinutes = 30;
        private int totalMarks = 100;
        private int passingPercentage = 40;
        private int negativeMarks = 0;
        private String startTime;
        private String endTime;
        private int attemptLimit = 1;
        private boolean isPublished = true;
        private List<TestSectionCreateDto> sections;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public int getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public int getPassingPercentage() { return passingPercentage; }
        public void setPassingPercentage(int passingPercentage) { this.passingPercentage = passingPercentage; }

        public int getNegativeMarks() { return negativeMarks; }
        public void setNegativeMarks(int negativeMarks) { this.negativeMarks = negativeMarks; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }

        public int getAttemptLimit() { return attemptLimit; }
        public void setAttemptLimit(int attemptLimit) { this.attemptLimit = attemptLimit; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { isPublished = published; }

        public List<TestSectionCreateDto> getSections() { return sections; }
        public void setSections(List<TestSectionCreateDto> sections) { this.sections = sections; }
    }

    public static class TestSectionCreateDto {
        private String title;
        private int orderIndex;
        private List<Long> questionIds;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public List<Long> getQuestionIds() { return questionIds; }
        public void setQuestionIds(List<Long> questionIds) { this.questionIds = questionIds; }
    }

    public static class AttendanceSessionItem {
        private Long id;
        private Long batchId;
        private String batchName;
        private String topic;
        private String sessionDate;
        private String startTime;
        private String endTime;
        private int presentCount;
        private int absentCount;
        private int lateCount;
        private int totalStudents;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public String getBatchName() { return batchName; }
        public void setBatchName(String batchName) { this.batchName = batchName; }

        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }

        public String getSessionDate() { return sessionDate; }
        public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }

        public int getPresentCount() { return presentCount; }
        public void setPresentCount(int presentCount) { this.presentCount = presentCount; }

        public int getAbsentCount() { return absentCount; }
        public void setAbsentCount(int absentCount) { this.absentCount = absentCount; }

        public int getLateCount() { return lateCount; }
        public void setLateCount(int lateCount) { this.lateCount = lateCount; }

        public int getTotalStudents() { return totalStudents; }
        public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
    }

    public static class AttendanceSessionCreateRequest {
        private Long batchId;
        private Long subjectId;
        private String title;
        private String sessionDate;
        private String startTime = "09:00:00";
        private String endTime = "11:00:00";

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getSessionDate() { return sessionDate; }
        public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
    }

    public static class AttendanceMarkRequest {
        private Long sessionId;
        private List<StudentAttendanceMarkItem> records;

        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

        public List<StudentAttendanceMarkItem> getRecords() { return records; }
        public void setRecords(List<StudentAttendanceMarkItem> records) { this.records = records; }
    }

    public static class StudentAttendanceMarkItem {
        private Long studentId;
        private String studentName;
        private String studentCode;
        private String status; // PRESENT, ABSENT, LATE, EXCUSED
        private String remarks;

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getStudentCode() { return studentCode; }
        public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public static class MaterialAdminItem {
        private Long id;
        private String title;
        private String description;
        private Long courseId;
        private String courseTitle;
        private Long subjectId;
        private String subjectTitle;
        private Long topicId;
        private String topicTitle;
        private String materialType;
        private String fileUrl;
        private long fileSizeBytes;
        private boolean isPublished;
        private String createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public String getSubjectTitle() { return subjectTitle; }
        public void setSubjectTitle(String subjectTitle) { this.subjectTitle = subjectTitle; }

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }

        public String getTopicTitle() { return topicTitle; }
        public void setTopicTitle(String topicTitle) { this.topicTitle = topicTitle; }

        public String getMaterialType() { return materialType; }
        public void setMaterialType(String materialType) { this.materialType = materialType; }

        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

        public long getFileSizeBytes() { return fileSizeBytes; }
        public void setFileSizeBytes(long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { isPublished = published; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class MaterialCreateRequest {
        private String title;
        private String description;
        private Long courseId;
        private Long subjectId;
        private Long moduleId;
        private Long topicId;
        private String materialType = "PDF";
        private String fileUrl;
        private long fileSizeBytes = 1048576;
        private boolean isPublished = true;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public Long getModuleId() { return moduleId; }
        public void setModuleId(Long moduleId) { this.moduleId = moduleId; }

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }

        public String getMaterialType() { return materialType; }
        public void setMaterialType(String materialType) { this.materialType = materialType; }

        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

        public long getFileSizeBytes() { return fileSizeBytes; }
        public void setFileSizeBytes(long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { isPublished = published; }
    }

    public static class VideoCreateRequest {
        private Long topicId;
        private String title;
        private String description;
        private String videoUrl;
        private String thumbnailUrl;
        private int durationSeconds = 3600;
        private int orderIndex = 0;
        private boolean isPublished = true;

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getVideoUrl() { return videoUrl; }
        public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public int getDurationSeconds() { return durationSeconds; }
        public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { this.isPublished = published; }
    }

    public static class VideoAdminItem {
        private Long id;
        private Long topicId;
        private String title;
        private String description;
        private String videoUrl;
        private String thumbnailUrl;
        private int durationSeconds;
        private int orderIndex;
        private boolean isPublished;
        private String topicTitle;
        private String moduleTitle;
        private String courseTitle;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getVideoUrl() { return videoUrl; }
        public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public int getDurationSeconds() { return durationSeconds; }
        public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

        public boolean isPublished() { return isPublished; }
        public void setPublished(boolean published) { this.isPublished = published; }

        public String getTopicTitle() { return topicTitle; }
        public void setTopicTitle(String topicTitle) { this.topicTitle = topicTitle; }

        public String getModuleTitle() { return moduleTitle; }
        public void setModuleTitle(String moduleTitle) { this.moduleTitle = moduleTitle; }

        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    }

    public static class AnnouncementCreateRequest {
        private String title;
        private String message;
        private String type = "ANNOUNCEMENT";
        private String target = "ALL"; // "ALL", "BATCH", "GENERAL"
        private Long targetBatchId;
        private String linkUrl;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }

        public Long getTargetBatchId() { return targetBatchId; }
        public void setTargetBatchId(Long targetBatchId) { this.targetBatchId = targetBatchId; }

        public String getLinkUrl() { return linkUrl; }
        public void setLinkUrl(String linkUrl) { this.linkUrl = linkUrl; }
    }
}
