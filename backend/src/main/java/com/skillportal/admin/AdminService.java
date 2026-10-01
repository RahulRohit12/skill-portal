package com.skillportal.admin;

import com.skillportal.exception.BadRequestException;
import com.skillportal.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AdminDto.AdminOverview getOverview() {
        return adminRepository.getOverview();
    }

    // ==========================================
    // STUDENT MANAGEMENT
    // ==========================================
    public List<AdminDto.StudentAdminItem> listStudents(int page, int size, String search, Long batchId, Long courseId, String status) {
        int offset = Math.max(0, page) * size;
        return adminRepository.listStudents(offset, size, search, batchId, courseId, status);
    }

    public AdminDto.StudentDetailResponse getStudentDetail(Long userId) {
        AdminDto.StudentDetailResponse detail = adminRepository.getStudentDetail(userId);
        if (detail == null) {
            throw new ResourceNotFoundException("Student not found with user ID: " + userId);
        }
        return detail;
    }

    @Transactional
    public Long createStudent(AdminDto.StudentCreateRequest req) {
        if (req.getFullName() == null || req.getFullName().isBlank()) {
            throw new BadRequestException("Full name is required");
        }
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (req.getStudentCode() == null || req.getStudentCode().isBlank()) {
            throw new BadRequestException("Student Code / ID is required");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }
        if (req.getConfirmPassword() == null && req.getPassword() != null) {
            req.setConfirmPassword(req.getPassword());
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (adminRepository.existsByEmail(req.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("A student with this email address already exists");
        }
        if (adminRepository.existsByStudentCode(req.getStudentCode().trim())) {
            throw new BadRequestException("A student with this Student Code already exists");
        }

        String passwordHash = passwordEncoder.encode(req.getPassword());
        return adminRepository.createStudent(req, passwordHash);
    }

    @Transactional
    public void updateStudent(Long userId, AdminDto.StudentUpdateRequest req) {
        if (req.getFullName() == null || req.getFullName().isBlank()) {
            throw new BadRequestException("Full name is required");
        }
        adminRepository.updateStudent(userId, req);
    }

    @Transactional
    public void updateStudentStatus(Long userId, String status) {
        adminRepository.updateStudentStatus(userId, status);
    }

    @Transactional
    public void resetStudentPassword(Long userId, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }
        String passwordHash = passwordEncoder.encode(newPassword);
        adminRepository.resetStudentPassword(userId, passwordHash);
    }

    @Transactional
    public void assignStudentBatch(Long userId, Long batchId) {
        adminRepository.assignStudentBatch(userId, batchId);
    }

    @Transactional
    public void deleteStudent(Long userId) {
        adminRepository.deleteStudent(userId);
    }

    @Transactional
    public int deleteAllStudents() {
        return adminRepository.deleteAllStudents();
    }

    // ==========================================
    // BATCH MANAGEMENT
    // ==========================================
    public List<AdminDto.BatchItem> listBatches() {
        return adminRepository.listBatches();
    }

    @Transactional
    public Long createBatch(AdminDto.BatchCreateRequest req) {
        if (req.getName() == null || req.getName().isBlank()) {
            throw new BadRequestException("Batch name is required");
        }
        if (req.getCode() == null || req.getCode().isBlank()) {
            throw new BadRequestException("Batch code is required");
        }
        return adminRepository.createBatch(req);
    }

    @Transactional
    public void updateBatch(Long id, AdminDto.BatchCreateRequest req) {
        adminRepository.updateBatch(id, req);
    }

    @Transactional
    public void updateBatchStatus(Long id, boolean isActive) {
        adminRepository.updateBatchStatus(id, isActive);
    }

    @Transactional
    public void deleteBatch(Long id) {
        adminRepository.deleteBatch(id);
    }

    public List<AdminDto.StudentAdminItem> getBatchStudents(Long batchId) {
        return adminRepository.getBatchStudents(batchId);
    }

    // ==========================================
    // COURSE MANAGEMENT
    // ==========================================
    public List<AdminDto.CourseItem> listCourses() {
        return adminRepository.listCourses();
    }

    @Transactional
    public Long createCourse(AdminDto.CourseCreateRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException("Course title is required");
        }
        if (req.getSlug() == null || req.getSlug().isBlank()) {
            req.setSlug(req.getTitle().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        }
        return adminRepository.createCourse(req);
    }

    @Transactional
    public void updateCourse(Long id, AdminDto.CourseCreateRequest req) {
        adminRepository.updateCourse(id, req);
    }

    @Transactional
    public void deleteCourse(Long id) {
        adminRepository.deleteCourse(id);
    }

    @Transactional
    public Long createSubject(AdminDto.SubjectCreateRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException("Subject title is required");
        }
        return adminRepository.createSubject(req);
    }

    @Transactional
    public Long createModule(AdminDto.ModuleCreateRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException("Module title is required");
        }
        return adminRepository.createModule(req);
    }

    @Transactional
    public Long createTopic(AdminDto.TopicCreateRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException("Topic title is required");
        }
        return adminRepository.createTopic(req);
    }

    // ==========================================
    // ASSIGNMENT MANAGEMENT
    // ==========================================
    public List<AdminDto.AssignmentAdminItem> listAssignments() {
        return adminRepository.listAssignments();
    }

    @Transactional
    public Long createAssignment(AdminDto.AssignmentCreateRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException("Assignment title is required");
        }
        return adminRepository.createAssignment(req);
    }

    @Transactional
    public void deleteAssignment(Long id) {
        adminRepository.deleteAssignment(id);
    }

    // ==========================================
    // QUESTION BANK MANAGEMENT
    // ==========================================
    public List<AdminDto.QuestionBankItem> listQuestions(Long topicId, String questionType, String difficulty, String search) {
        return adminRepository.listQuestions(topicId, questionType, difficulty, search);
    }

    @Transactional
    public Long createQuestion(AdminDto.QuestionCreateRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException("Question title is required");
        }
        return adminRepository.createQuestion(req);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        adminRepository.deleteQuestion(id);
    }

    // ==========================================
    // TEST MANAGEMENT
    // ==========================================
    public List<AdminDto.TestAdminItem> listTests() {
        return adminRepository.listTests();
    }

    @Transactional
    public Long createTest(AdminDto.TestCreateRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException("Test title is required");
        }
        return adminRepository.createTest(req);
    }

    @Transactional
    public void deleteTest(Long id) {
        adminRepository.deleteTest(id);
    }

    @Transactional
    public void publishTest(Long id, boolean published) {
        adminRepository.publishTest(id, published);
    }

    // ==========================================
    // ATTENDANCE REGISTER MANAGEMENT
    // ==========================================
    public List<AdminDto.AttendanceSessionItem> listAttendanceSessions(Long batchId) {
        return adminRepository.listAttendanceSessions(batchId);
    }

    @Transactional
    public Long createAttendanceSession(AdminDto.AttendanceSessionCreateRequest req, Long instructorUserId) {
        if (req.getBatchId() == null) {
            throw new BadRequestException("Batch is required for attendance session");
        }
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException("Session title / topic is required");
        }
        if (req.getSessionDate() == null || req.getSessionDate().isBlank()) {
            throw new BadRequestException("Session date is required");
        }
        return adminRepository.createAttendanceSession(req, instructorUserId);
    }

    public List<AdminDto.StudentAttendanceMarkItem> getSessionAttendanceRecords(Long sessionId) {
        return adminRepository.getSessionAttendanceRecords(sessionId);
    }

    @Transactional
    public void markAttendance(AdminDto.AttendanceMarkRequest req) {
        if (req.getSessionId() == null) {
            throw new BadRequestException("Session ID is required");
        }
        adminRepository.markAttendance(req);
    }

    // ==========================================
    // STUDY MATERIALS & VIDEOS
    // ==========================================
    public List<AdminDto.MaterialAdminItem> listMaterials() {
        return adminRepository.listMaterials();
    }

    @Transactional
    public Long createMaterial(AdminDto.MaterialCreateRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException("Material title is required");
        }
        if (req.getFileUrl() == null || req.getFileUrl().isBlank()) {
            throw new BadRequestException("File URL is required");
        }
        return adminRepository.createMaterial(req);
    }

    @Transactional
    public void deleteMaterial(Long id) {
        adminRepository.deleteMaterial(id);
    }

    @Transactional
    public Long createVideo(AdminDto.VideoCreateRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException("Video title is required");
        }
        if (req.getVideoUrl() == null || req.getVideoUrl().isBlank()) {
            throw new BadRequestException("Video URL is required");
        }
        return adminRepository.createVideo(req);
    }

    public List<AdminDto.VideoAdminItem> listVideos() {
        return adminRepository.listVideos();
    }

    @Transactional
    public void deleteVideo(Long id) {
        adminRepository.deleteVideo(id);
    }

    // ==========================================
    // ANNOUNCEMENTS
    // ==========================================
    @Transactional
    public int createAnnouncement(AdminDto.AnnouncementCreateRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException("Announcement title is required");
        }
        if (req.getMessage() == null || req.getMessage().isBlank()) {
            throw new BadRequestException("Announcement message is required");
        }
        return adminRepository.createAnnouncement(req);
    }
}
