package com.skillportal;

import com.skillportal.coding.CodeExecutionEngine;
import com.skillportal.coding.MockExecutor;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class SkillPortalApplicationTests {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MockExecutor mockExecutor;

    @Test
    void contextLoads() {
        assertNotNull(passwordEncoder);
        assertNotNull(mockExecutor);
    }

    @Test
    void testPasswordHashing() {
        String rawPassword = "Admin@123";
        String encoded = passwordEncoder.encode(rawPassword);
        assertTrue(passwordEncoder.matches(rawPassword, encoded));
        assertFalse(passwordEncoder.matches("WrongPassword", encoded));
    }

    @Test
    void testMockCodeExecutor() {
        String sampleJava = "import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello\");\n  }\n}";
        List<CodeExecutionEngine.TestCaseItem> testCases = List.of(
                new CodeExecutionEngine.TestCaseItem(1L, "", "Hello", false)
        );

        CodeExecutionEngine.ExecutionRequest req = new CodeExecutionEngine.ExecutionRequest(
                sampleJava, "java", testCases, 2000, 256
        );

        CodeExecutionEngine.ExecutionResult res = mockExecutor.execute(req);
        assertNotNull(res);
        assertEquals("ACCEPTED", res.getStatus());
        assertEquals(1, res.getPassedCount());
    }

    @Autowired
    private com.skillportal.attendance.AttendanceRepository attendanceRepository;

    @Autowired
    private com.skillportal.attendance.AttendanceService attendanceService;

    @Test
    void testGetMyQrCodeRealDb() {
        java.util.Optional<com.skillportal.attendance.AttendanceDto.MyQrCodeResponse> studentQr = attendanceRepository.getMyQrCode(2L);
        assertTrue(studentQr.isPresent(), "Student QR should be present for user 2");
        assertNotNull(studentQr.get().getQrToken(), "Student QR token should not be null");
        assertEquals("ACTIVE", studentQr.get().getQrStatus(), "Student QR status should be ACTIVE");

        java.util.Optional<com.skillportal.attendance.AttendanceDto.MyQrCodeResponse> adminQr = attendanceRepository.getMyQrCode(1L);
        assertTrue(adminQr.isPresent(), "Admin QR should be auto-provisioned without error");
        assertNotNull(adminQr.get().getQrToken(), "Admin QR token should not be null");
    }

    @Test
    void testGetAttendanceMatrixRealDb() {
        com.skillportal.attendance.AttendanceDto.AttendanceMatrixResponse matrix = 
                attendanceService.getAttendanceMatrix(2L, 1L, "2026-06-01", "2026-09-30");
        assertNotNull(matrix, "Attendance matrix should not be null");
        assertTrue(matrix.getTotalClasses() > 0, "Total classes should be greater than zero");
        assertTrue(matrix.getPresentClasses() > 0, "Present classes should be greater than zero");
        assertNotNull(matrix.getMonths(), "Months list should not be null");
        assertFalse(matrix.getMonths().isEmpty(), "Months should contain rows for Jun, July, Aug, Sep");
        assertNotNull(matrix.getSubjects(), "Subjects tabs should be populated");
    }
}
