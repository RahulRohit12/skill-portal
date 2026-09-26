-- SKILL PORTAL Database Schema Migration V10
-- Ensure all 9 assignments exist in MySQL and sync sections/questions for Assignment 3 (Programming) & Assignment 1

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Ensure all 9 standard assignments exist so foreign key checks succeed
INSERT INTO assignments (id, title, description, difficulty, total_marks, time_limit_minutes, is_published, is_deleted) VALUES
(1, 'Java Quiz', 'Foundational Java language syntax, data types, and core fundamentals.', 'EASY', 455, 60, TRUE, FALSE),
(2, 'Java Coding Scenarios', 'Real-world coding scenarios, algorithms, and modular design in Java.', 'INTERMEDIATE', 1250, 120, TRUE, FALSE),
(3, 'Programming', 'Complete programming assessment covering Data Types, Conditionals, Loops, and Arrays.', 'INTERMEDIATE', 2550, 180, TRUE, FALSE),
(4, 'SQL', 'Relational database queries, joins, aggregations, and normalization.', 'INTERMEDIATE', 203, 90, TRUE, FALSE),
(5, 'HTML', 'Semantic HTML5 structure, forms, inputs, and accessibility standards.', 'EASY', 146, 45, TRUE, FALSE),
(6, 'CSS', 'Modern CSS layout, flexbox, grid, animations, and responsive styling.', 'EASY', 160, 45, TRUE, FALSE),
(7, 'Spring Framework', 'Spring Boot, dependency injection, REST APIs, and microservices.', 'INTERMEDIATE', 360, 120, TRUE, FALSE),
(8, 'Data Structures & Algorithms', 'Linked lists, trees, graphs, sorting, and algorithmic complexity.', 'ADVANCED', 480, 150, TRUE, FALSE),
(9, 'JavaScript & Web APIs', 'Modern ES6+ JavaScript, asynchronous programming, DOM, and Fetch APIs.', 'INTERMEDIATE', 290, 90, TRUE, FALSE)
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), difficulty=VALUES(difficulty), is_published=TRUE, is_deleted=FALSE;

-- 2. Ensure assignment sections exist for Assignment 3 (Programming)
INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 3, 1, 'Data Types', 'Primitive Types & Scanner', 'Variables, scanner reading, arithmetic conversions in Java.', 1
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 3 AND title = 'Primitive Types & Scanner');

INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 3, 2, 'If Else & Conditionals', 'Conditionals & Branching', 'If-else statements, relational operators, ternary logic.', 2
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 3 AND title = 'Conditionals & Branching');

INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 3, 3, 'Loops & Iterations', 'Loops & Iterations', 'For loops, while loops, accumulator patterns.', 3
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 3 AND title = 'Loops & Iterations');

INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 3, 4, 'Array', 'Array Traversal', '1D array manipulation, element searching, extrema finding.', 4
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 3 AND title = 'Array Traversal');

INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 3, 5, 'Array', 'Sub-array', 'Contiguous subarrays, sliding window, and Kadane\'s algorithm.', 5
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 3 AND title = 'Sub-array');

INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 3, 6, 'Array', 'Multiple Array (2D Matrix)', 'Multi-dimensional arrays, matrix row/col traversals, diagonal algorithms.', 6
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 3 AND title = 'Multiple Array (2D Matrix)');

-- 3. Ensure assignment sections exist for Assignment 1 (Java Quiz / Foundational Programming)
INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 1, 1, 'Data Types', 'Primitive Types & Scanner', 'Variables, scanner reading, arithmetic conversions in Java.', 1
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 1 AND title = 'Primitive Types & Scanner');

INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 1, 2, 'If Else & Conditionals', 'Conditionals & Branching', 'If-else statements, relational operators, ternary logic.', 2
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 1 AND title = 'Conditionals & Branching');

INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 1, 3, 'Loops & Iterations', 'Loops & Iterations', 'For loops, while loops, accumulator patterns.', 3
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 1 AND title = 'Loops & Iterations');

INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 1, 4, 'Array', 'Array Traversal', '1D array manipulation, element searching, extrema finding.', 4
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 1 AND title = 'Array Traversal');

INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 1, 5, 'Array', 'Sub-array', 'Contiguous subarrays, sliding window, and Kadane\'s algorithm.', 5
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 1 AND title = 'Sub-array');

INSERT INTO assignment_sections (assignment_id, section_number, topic_name, title, description, order_index)
SELECT 1, 6, 'Array', 'Multiple Array (2D Matrix)', 'Multi-dimensional arrays, matrix row/col traversals, diagonal algorithms.', 6
WHERE NOT EXISTS (SELECT 1 FROM assignment_sections WHERE assignment_id = 1 AND title = 'Multiple Array (2D Matrix)');

-- 4. Seed built-in coding questions (101, 102, 501, 601) if missing
INSERT INTO questions (id, title, description, question_type, difficulty, marks, is_active, current_version) VALUES
(101, 'Add 2 Integers', 'Write a Java program to read two integers m and n from standard input and print their sum.', 'CODING', 'EASY', 10, TRUE, 1),
(102, 'Adding Three Integers', 'Write a program to read three integers a, b, and c and print their total sum.', 'CODING', 'EASY', 10, TRUE, 1),
(501, 'Maximum Subarray Sum', 'Given an integer array nums, find the contiguous subarray which has the largest sum and print its sum (Kadane\'s algorithm).', 'CODING', 'MEDIUM', 10, TRUE, 1),
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

-- 5. Link questions to Assignment 3 sections
INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index)
SELECT s.id, 101, 1 FROM assignment_sections s WHERE s.assignment_id = 3 AND s.title = 'Primitive Types & Scanner';

INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index)
SELECT s.id, 102, 2 FROM assignment_sections s WHERE s.assignment_id = 3 AND s.title = 'Primitive Types & Scanner';

INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index)
SELECT s.id, 501, 1 FROM assignment_sections s WHERE s.assignment_id = 3 AND s.title = 'Sub-array';

INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index)
SELECT s.id, 601, 1 FROM assignment_sections s WHERE s.assignment_id = 3 AND s.title = 'Multiple Array (2D Matrix)';

-- 6. Link questions to Assignment 1 sections
INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index)
SELECT s.id, 101, 1 FROM assignment_sections s WHERE s.assignment_id = 1 AND s.title = 'Primitive Types & Scanner';

INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index)
SELECT s.id, 102, 2 FROM assignment_sections s WHERE s.assignment_id = 1 AND s.title = 'Primitive Types & Scanner';

INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index)
SELECT s.id, 501, 1 FROM assignment_sections s WHERE s.assignment_id = 1 AND s.title = 'Sub-array';

INSERT IGNORE INTO assignment_questions (section_id, question_id, order_index)
SELECT s.id, 601, 1 FROM assignment_sections s WHERE s.assignment_id = 1 AND s.title = 'Multiple Array (2D Matrix)';

SET FOREIGN_KEY_CHECKS = 1;
