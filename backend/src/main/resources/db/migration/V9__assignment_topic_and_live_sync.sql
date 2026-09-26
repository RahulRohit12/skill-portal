-- SKILL PORTAL Database Schema Migration V9
-- Add topic_name to assignment_sections for Topic -> SubTopic hierarchy and cross-device sync

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Add topic_name column to assignment_sections
ALTER TABLE assignment_sections
    ADD COLUMN topic_name VARCHAR(150) DEFAULT 'General';

-- 2. Update existing sections with categorized topic names
UPDATE assignment_sections
SET topic_name = 'Array'
WHERE title LIKE '%Array%';

UPDATE assignment_sections
SET topic_name = 'String Algorithms'
WHERE title LIKE '%String%' OR title LIKE '%Palindrome%';

UPDATE assignment_sections
SET topic_name = 'Object-Oriented Programming'
WHERE title LIKE '%Object%' OR title LIKE '%Interface%';

-- 3. Add default Sub-Topics for Array and Data Types to Assignment 1 if missing
INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 1, 4, 'Array', 'Sub-array', 'Contiguous subarrays, sliding window, and Kadane\'s algorithm.', 4
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 1 AND title = 'Sub-array');

INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 1, 5, 'Array', 'Multiple Array (2D Matrix)', 'Multi-dimensional arrays, matrix row/col traversals, diagonal algorithms.', 5
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 1 AND title = 'Multiple Array (2D Matrix)');

INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 1, 6, 'Data Types', 'Primitive Types & Scanner', 'Variables, scanner reading, arithmetic conversions in Java.', 6
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 1 AND title = 'Primitive Types & Scanner');

-- 4. Seed built-in coding questions for Data Types and Arrays
INSERT INTO questions (id, title, description, question_type, difficulty, marks, is_active, current_version) VALUES
(101, 'Add 2 Integers', 'Write a Java program to read two integers m and n from standard input and print their sum.', 'CODING', 'EASY', 10, TRUE, 1),
(102, 'Adding Three Integers', 'Write a program to read three integers a, b, and c and print their total sum.', 'CODING', 'EASY', 10, TRUE, 1),
(501, 'Maximum Subarray Sum', 'Given an integer array nums, find the contiguous subarray which has the largest sum and print its sum.', 'CODING', 'MEDIUM', 10, TRUE, 1),
(601, 'Matrix Diagonal Sum', 'Given a square matrix of size N x N, calculate the sum of primary and secondary diagonal elements.', 'CODING', 'EASY', 10, TRUE, 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO coding_problems (id, question_id, problem_statement, input_format, output_format, constraints, starter_code_java, time_limit_ms, memory_limit_mb) VALUES
(101, 101, 'Write a Java program to read two integers m and n from standard input and print their sum.', 'First line contains m. Second line contains n.', 'Print sum of m and n.', '-10^9 <= m, n <= 10^9',
'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int m = scanner.nextInt();\n        int n = scanner.nextInt();\n        System.out.println(m + n);\n    }\n}', 2000, 256),

(102, 102, 'Write a program to read three integers a, b, and c and print their total sum.', 'Three integers a, b, c.', 'Print sum of three integers.', '-10^6 <= a, b, c <= 10^6',
'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int a = scanner.nextInt();\n        int b = scanner.nextInt();\n        int c = scanner.nextInt();\n        System.out.println(a + b + c);\n    }\n}', 2000, 256),

(501, 501, 'Find contiguous subarray with largest sum.', 'First line: n. Second line: n integers.', 'Print max subarray sum.', '1 <= n <= 10^5',
'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int n = scanner.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = scanner.nextInt();\n        long maxSoFar = nums[0], currMax = nums[0];\n        for (int i = 1; i < n; i++) {\n            currMax = Math.max((long)nums[i], currMax + nums[i]);\n            maxSoFar = Math.max(maxSoFar, currMax);\n        }\n        System.out.println(maxSoFar);\n    }\n}', 2000, 256),

(601, 601, 'Calculate diagonal sum of square matrix.', 'Line 1: N. Next N lines: N integers each.', 'Print diagonal sum.', '1 <= N <= 100',
'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int n = scanner.nextInt();\n        int sum = 0;\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                int v = scanner.nextInt();\n                if (i == j || i + j == n - 1) sum += v;\n            }\n        }\n        System.out.println(sum);\n    }\n}', 2000, 256)
ON DUPLICATE KEY UPDATE problem_statement=VALUES(problem_statement);

INSERT INTO test_cases (id, coding_problem_id, input_data, expected_output, is_hidden, order_index) VALUES
(1001, 101, '5\n10\n', '15', FALSE, 1),
(1002, 101, '20\n30\n', '50', FALSE, 2),
(1003, 101, '-15\n35\n', '20', TRUE, 3),
(1004, 102, '1\n2\n3\n', '6', FALSE, 1),
(1005, 102, '10\n20\n30\n', '60', FALSE, 2),
(1006, 501, '5\n-2 1 -3 4 -1\n', '4', FALSE, 1),
(1007, 501, '4\n1 2 3 4\n', '10', FALSE, 2),
(1008, 601, '3\n1 2 3\n4 5 6\n7 8 9\n', '25', FALSE, 1)
ON DUPLICATE KEY UPDATE input_data=VALUES(input_data);

-- Link newly seeded questions to sections
INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index)
SELECT s.id, 101, 1 FROM assignment_sections s WHERE s.assignment_id = 1 AND s.title = 'Primitive Types & Scanner';

INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index)
SELECT s.id, 102, 2 FROM assignment_sections s WHERE s.assignment_id = 1 AND s.title = 'Primitive Types & Scanner';

INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index)
SELECT s.id, 501, 1 FROM assignment_sections s WHERE s.assignment_id = 1 AND s.title = 'Sub-array';

INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index)
SELECT s.id, 601, 1 FROM assignment_sections s WHERE s.assignment_id = 1 AND s.title = 'Multiple Array (2D Matrix)';

SET FOREIGN_KEY_CHECKS = 1;
