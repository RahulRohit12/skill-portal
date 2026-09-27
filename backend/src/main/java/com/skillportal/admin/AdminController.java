package com.skillportal.admin;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Management", description = "Endpoints for platform administrators")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ==========================================
    // OVERVIEW
    // ==========================================
    @GetMapping("/overview")
    @Operation(summary = "Get platform metrics, recent students, and submissions for admin dashboard")
    public ResponseEntity<ApiResponse<AdminDto.AdminOverview>> getOverview() {
        AdminDto.AdminOverview overview = adminService.getOverview();
        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    // ==========================================
    // STUDENT MANAGEMENT
    // ==========================================
    @GetMapping("/students")
    @Operation(summary = "Paginated student list with search and batch filtering")
    public ResponseEntity<ApiResponse<List<AdminDto.StudentAdminItem>>> listStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long batchId,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String status) {
        List<AdminDto.StudentAdminItem> list = adminService.listStudents(page, size, search, batchId, courseId, status);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/students/{id}")
    @Operation(summary = "Get detailed student profile, attendance, tests, assignments, and coding history")
    public ResponseEntity<ApiResponse<AdminDto.StudentDetailResponse>> getStudentDetail(@PathVariable Long id) {
        AdminDto.StudentDetailResponse detail = adminService.getStudentDetail(id);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @PostMapping("/students")
    @Operation(summary = "Create a new student account and profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createStudent(@RequestBody AdminDto.StudentCreateRequest req) {
        Long userId = adminService.createStudent(req);
        return ResponseEntity.ok(ApiResponse.success("Student created successfully", Map.of("userId", userId)));
    }

    @PutMapping("/students/{id}")
    @Operation(summary = "Update student account and profile details")
    public ResponseEntity<ApiResponse<Void>> updateStudent(@PathVariable Long id, @RequestBody AdminDto.StudentUpdateRequest req) {
        adminService.updateStudent(id, req);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", null));
    }

    @PatchMapping("/students/{id}/status")
    @Operation(summary = "Activate or deactivate a student account")
    public ResponseEntity<ApiResponse<Void>> updateStudentStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "ACTIVE");
        adminService.updateStudentStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Student status updated", null));
    }

    @PostMapping("/students/{id}/reset-password")
    @Operation(summary = "Reset student password")
    public ResponseEntity<ApiResponse<Void>> resetStudentPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newPassword = body.get("newPassword");
        adminService.resetStudentPassword(id, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    @PatchMapping("/students/{id}/batch")
    @Operation(summary = "Assign or reassign student to batch")
    public ResponseEntity<ApiResponse<Void>> assignStudentBatch(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Long batchId = body.get("batchId");
        adminService.assignStudentBatch(id, batchId);
        return ResponseEntity.ok(ApiResponse.success("Student batch assigned", null));
    }

    // ==========================================
    // BATCH MANAGEMENT
    // ==========================================
    @GetMapping("/batches")
    @Operation(summary = "List all batches with student counts and performance metrics")
    public ResponseEntity<ApiResponse<List<AdminDto.BatchItem>>> listBatches() {
        List<AdminDto.BatchItem> list = adminService.listBatches();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/batches")
    @Operation(summary = "Create a new batch")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createBatch(@RequestBody AdminDto.BatchCreateRequest req) {
        Long id = adminService.createBatch(req);
        return ResponseEntity.ok(ApiResponse.success("Batch created successfully", Map.of("id", id)));
    }

    @PutMapping("/batches/{id}")
    @Operation(summary = "Update batch details")
    public ResponseEntity<ApiResponse<Void>> updateBatch(@PathVariable Long id, @RequestBody AdminDto.BatchCreateRequest req) {
        adminService.updateBatch(id, req);
        return ResponseEntity.ok(ApiResponse.success("Batch updated successfully", null));
    }

    @PatchMapping("/batches/{id}/status")
    @Operation(summary = "Toggle batch active status")
    public ResponseEntity<ApiResponse<Void>> updateBatchStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean isActive = body.getOrDefault("isActive", true);
        adminService.updateBatchStatus(id, isActive);
        return ResponseEntity.ok(ApiResponse.success("Batch status updated", null));
    }

    @DeleteMapping("/batches/{id}")
    @Operation(summary = "Delete batch")
    public ResponseEntity<ApiResponse<Void>> deleteBatch(@PathVariable Long id) {
        adminService.deleteBatch(id);
        return ResponseEntity.ok(ApiResponse.success("Batch deleted successfully", null));
    }

    @GetMapping("/batches/{id}/students")
    @Operation(summary = "Get list of students enrolled in a batch")
    public ResponseEntity<ApiResponse<List<AdminDto.StudentAdminItem>>> getBatchStudents(@PathVariable Long id) {
        List<AdminDto.StudentAdminItem> list = adminService.getBatchStudents(id);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ==========================================
    // COURSE MANAGEMENT
    // ==========================================
    @GetMapping("/courses")
    @Operation(summary = "List all courses for admin catalog")
    public ResponseEntity<ApiResponse<List<AdminDto.CourseItem>>> listCourses() {
        List<AdminDto.CourseItem> list = adminService.listCourses();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/courses")
    @Operation(summary = "Create a new course")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createCourse(@RequestBody AdminDto.CourseCreateRequest req) {
        Long id = adminService.createCourse(req);
        return ResponseEntity.ok(ApiResponse.success("Course created successfully", Map.of("id", id)));
    }

    @PutMapping("/courses/{id}")
    @Operation(summary = "Update course details")
    public ResponseEntity<ApiResponse<Void>> updateCourse(@PathVariable Long id, @RequestBody AdminDto.CourseCreateRequest req) {
        adminService.updateCourse(id, req);
        return ResponseEntity.ok(ApiResponse.success("Course updated successfully", null));
    }

    @DeleteMapping("/courses/{id}")
    @Operation(summary = "Delete course")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        adminService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted successfully", null));
    }

    @PostMapping("/subjects")
    @Operation(summary = "Create a subject under course")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createSubject(@RequestBody AdminDto.SubjectCreateRequest req) {
        Long id = adminService.createSubject(req);
        return ResponseEntity.ok(ApiResponse.success("Subject created successfully", Map.of("id", id)));
    }

    @PostMapping("/modules")
    @Operation(summary = "Create a module under subject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createModule(@RequestBody AdminDto.ModuleCreateRequest req) {
        Long id = adminService.createModule(req);
        return ResponseEntity.ok(ApiResponse.success("Module created successfully", Map.of("id", id)));
    }

    @PostMapping("/topics")
    @Operation(summary = "Create a topic under module")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTopic(@RequestBody AdminDto.TopicCreateRequest req) {
        Long id = adminService.createTopic(req);
        return ResponseEntity.ok(ApiResponse.success("Topic created successfully", Map.of("id", id)));
    }

    // ==========================================
    // ASSIGNMENT MANAGEMENT
    // ==========================================
    @GetMapping("/assignments")
    @Operation(summary = "List all assignments with completion stats")
    public ResponseEntity<ApiResponse<List<AdminDto.AssignmentAdminItem>>> listAssignments() {
        List<AdminDto.AssignmentAdminItem> list = adminService.listAssignments();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/assignments")
    @Operation(summary = "Create an assignment with sections and questions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createAssignment(@RequestBody AdminDto.AssignmentCreateRequest req) {
        Long id = adminService.createAssignment(req);
        return ResponseEntity.ok(ApiResponse.success("Assignment created successfully", Map.of("id", id)));
    }

    @DeleteMapping("/assignments/{id}")
    @Operation(summary = "Delete assignment")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable Long id) {
        adminService.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Assignment deleted successfully", null));
    }

    // ==========================================
    // QUESTION BANK MANAGEMENT
    // ==========================================
    @GetMapping("/questions")
    @Operation(summary = "Search and filter question bank")
    public ResponseEntity<ApiResponse<List<AdminDto.QuestionBankItem>>> listQuestions(
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String search) {
        List<AdminDto.QuestionBankItem> list = adminService.listQuestions(topicId, type, difficulty, search);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/questions")
    @Operation(summary = "Create question in question bank (MCQ, MSQ, Coding)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createQuestion(@RequestBody AdminDto.QuestionCreateRequest req) {
        Long id = adminService.createQuestion(req);
        return ResponseEntity.ok(ApiResponse.success("Question created successfully", Map.of("id", id)));
    }

    @DeleteMapping("/questions/{id}")
    @Operation(summary = "Delete question from question bank")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        adminService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }

    // ==========================================
    // TEST MANAGEMENT
    // ==========================================
    @GetMapping("/tests")
    @Operation(summary = "List all assessments and tests")
    public ResponseEntity<ApiResponse<List<AdminDto.TestAdminItem>>> listTests() {
        List<AdminDto.TestAdminItem> list = adminService.listTests();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/tests")
    @Operation(summary = "Create a test with sections and questions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTest(@RequestBody AdminDto.TestCreateRequest req) {
        Long id = adminService.createTest(req);
        return ResponseEntity.ok(ApiResponse.success("Test created successfully", Map.of("id", id)));
    }

    @DeleteMapping("/tests/{id}")
    @Operation(summary = "Delete test")
    public ResponseEntity<ApiResponse<Void>> deleteTest(@PathVariable Long id) {
        adminService.deleteTest(id);
        return ResponseEntity.ok(ApiResponse.success("Test deleted successfully", null));
    }

    @PatchMapping("/tests/{id}/publish")
    @Operation(summary = "Publish or unpublish test")
    public ResponseEntity<ApiResponse<Void>> publishTest(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean published = body.getOrDefault("isPublished", true);
        adminService.publishTest(id, published);
        return ResponseEntity.ok(ApiResponse.success("Test publish status updated", null));
    }

    // ==========================================
    // ATTENDANCE MANAGEMENT
    // ==========================================
    @GetMapping("/attendance/sessions")
    @Operation(summary = "List attendance sessions")
    public ResponseEntity<ApiResponse<List<AdminDto.AttendanceSessionItem>>> listAttendanceSessions(
            @RequestParam(required = false) Long batchId) {
        List<AdminDto.AttendanceSessionItem> list = adminService.listAttendanceSessions(batchId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/attendance/sessions")
    @Operation(summary = "Create an attendance session for a batch")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createAttendanceSession(
            @RequestBody AdminDto.AttendanceSessionCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long sessionId = adminService.createAttendanceSession(req, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Attendance session created", Map.of("sessionId", sessionId)));
    }

    @GetMapping("/attendance/sessions/{sessionId}/records")
    @Operation(summary = "Get student attendance records for a session")
    public ResponseEntity<ApiResponse<List<AdminDto.StudentAttendanceMarkItem>>> getSessionAttendanceRecords(
            @PathVariable Long sessionId) {
        List<AdminDto.StudentAttendanceMarkItem> records = adminService.getSessionAttendanceRecords(sessionId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @PostMapping("/attendance/records")
    @Operation(summary = "Mark or update attendance records")
    public ResponseEntity<ApiResponse<Void>> markAttendance(@RequestBody AdminDto.AttendanceMarkRequest req) {
        adminService.markAttendance(req);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", null));
    }

    // ==========================================
    // STUDY MATERIALS & VIDEOS
    // ==========================================
    @GetMapping("/materials")
    @Operation(summary = "List all study materials")
    public ResponseEntity<ApiResponse<List<AdminDto.MaterialAdminItem>>> listMaterials() {
        List<AdminDto.MaterialAdminItem> list = adminService.listMaterials();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/materials")
    @Operation(summary = "Upload or link new study material")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createMaterial(@RequestBody AdminDto.MaterialCreateRequest req) {
        Long id = adminService.createMaterial(req);
        return ResponseEntity.ok(ApiResponse.success("Material created successfully", Map.of("id", id)));
    }

    @DeleteMapping("/materials/{id}")
    @Operation(summary = "Delete study material")
    public ResponseEntity<ApiResponse<Void>> deleteMaterial(@PathVariable Long id) {
        adminService.deleteMaterial(id);
        return ResponseEntity.ok(ApiResponse.success("Material deleted successfully", null));
    }

    @GetMapping("/videos")
    @Operation(summary = "List all video lectures")
    public ResponseEntity<ApiResponse<List<AdminDto.VideoAdminItem>>> listVideos() {
        List<AdminDto.VideoAdminItem> list = adminService.listVideos();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/videos")
    @Operation(summary = "Add a new video lecture to a topic")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createVideo(@RequestBody AdminDto.VideoCreateRequest req) {
        Long id = adminService.createVideo(req);
        return ResponseEntity.ok(ApiResponse.success("Video lecture added", Map.of("id", id)));
    }

    @DeleteMapping("/videos/{id}")
    @Operation(summary = "Delete video lecture")
    public ResponseEntity<ApiResponse<Void>> deleteVideo(@PathVariable Long id) {
        adminService.deleteVideo(id);
        return ResponseEntity.ok(ApiResponse.success("Video deleted successfully", null));
    }

    // ==========================================
    // ANNOUNCEMENTS
    // ==========================================
    @PostMapping("/announcements")
    @Operation(summary = "Create system or batch broadcast announcement")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> createAnnouncement(@RequestBody AdminDto.AnnouncementCreateRequest req) {
        int count = adminService.createAnnouncement(req);
        return ResponseEntity.ok(ApiResponse.success("Announcement broadcasted successfully to " + count + " recipient(s)", java.util.Map.of("recipientCount", count)));
    }
}
