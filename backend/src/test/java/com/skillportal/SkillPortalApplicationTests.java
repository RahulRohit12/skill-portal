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
}
