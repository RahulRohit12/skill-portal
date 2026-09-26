-- SKILL PORTAL Database Schema Migration V9
-- Full Stack Batch Attendance Matrix & Subject Sessions (June - September 2026)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Standardize and expand Subjects to match curriculum and portal tabs
INSERT INTO subjects (id, course_id, title, description, order_index, is_published) VALUES
(1, 1, 'Core Java', 'Foundations of Java 21, OOP, JVM Architecture, and collections', 1, TRUE),
(2, 1, 'Programming', 'Problem solving, patterns, algorithmic recursion, arrays, and strings', 2, TRUE),
(3, 1, 'SQL', 'Relational database design, joins, subqueries, indexing, and transactions', 3, TRUE),
(4, 1, 'Advanced Java', 'JDBC, Servlets, Multi-threading, Streams API, and Design Patterns', 4, TRUE),
(5, 1, 'Soft Skills', 'Technical communication, behavioral interviews, and resume building', 5, TRUE),
(6, 1, 'HTML & CSS', 'Web layout semantics, Flexbox, CSS Grid, and responsive UI', 6, TRUE),
(7, 1, 'Python', 'Python scripting, collections, functions, and standard libraries', 7, TRUE)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    description = VALUES(description),
    order_index = VALUES(order_index);

-- 2. Seed June - September Core Java Attendance Sessions (71 classes total)
-- June 2026 Sessions (11 classes)
INSERT INTO attendance_sessions (id, batch_id, subject_id, title, session_date, start_time, end_time, created_by) VALUES
(101, 1, 1, 'Core Java: JVM Architecture & ClassLoader Subsystem', '2026-06-16', '09:00:00', '11:00:00', 1),
(102, 1, 1, 'Core Java: Data Types, Primitives & Literals', '2026-06-17', '09:00:00', '11:00:00', 1),
(103, 1, 1, 'Core Java: Operators, Bitwise & Precedence', '2026-06-18', '09:00:00', '11:00:00', 1),
(104, 1, 1, 'Core Java: If-Else & Switch Pattern Matching', '2026-06-19', '09:00:00', '11:00:00', 1),
(105, 1, 1, 'Core Java: While, Do-While & Loop Control', '2026-06-22', '09:00:00', '11:00:00', 1),
(106, 1, 1, 'Core Java: For Loops & Nested Loop Patterns', '2026-06-23', '09:00:00', '11:00:00', 1),
(107, 1, 1, 'Core Java: Array Initialization & Memory Allocation', '2026-06-24', '09:00:00', '11:00:00', 1),
(108, 1, 1, 'Core Java: Multi-Dimensional Arrays & Jagged Arrays', '2026-06-25', '09:00:00', '11:00:00', 1),
(109, 1, 1, 'Core Java: String Pool & Immutability Internals', '2026-06-26', '09:00:00', '11:00:00', 1),
(110, 1, 1, 'Core Java: StringBuilder vs StringBuffer Benchmarking', '2026-06-29', '09:00:00', '11:00:00', 1),
(111, 1, 1, 'Core Java: Methods, Pass by Value & Stack Frames', '2026-06-30', '09:00:00', '11:00:00', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- July 2026 Sessions (23 classes)
INSERT INTO attendance_sessions (id, batch_id, subject_id, title, session_date, start_time, end_time, created_by) VALUES
(112, 1, 1, 'Core Java: Constructors & Instance Initialization', '2026-07-01', '09:00:00', '11:00:00', 1),
(113, 1, 1, 'Core Java: This Keyword & Constructor Chaining', '2026-07-02', '09:00:00', '11:00:00', 1),
(114, 1, 1, 'Core Java: Static Variables, Methods & Static Blocks', '2026-07-03', '09:00:00', '11:00:00', 1),
(115, 1, 1, 'Core Java: Encapsulation & JavaBean Conventions', '2026-07-06', '09:00:00', '11:00:00', 1),
(116, 1, 1, 'Core Java: Single & Multi-Level Inheritance', '2026-07-07', '09:00:00', '11:00:00', 1),
(117, 1, 1, 'Core Java: Super Keyword & Super Method Calls', '2026-07-08', '09:00:00', '11:00:00', 1),
(118, 1, 1, 'Core Java: Method Overloading & Type Promotion', '2026-07-09', '09:00:00', '11:00:00', 1),
(119, 1, 1, 'Core Java: Method Overriding & Covariant Returns', '2026-07-10', '09:00:00', '11:00:00', 1),
(120, 1, 1, 'Core Java: Runtime Polymorphism & Dynamic Dispatch', '2026-07-13', '09:00:00', '11:00:00', 1),
(121, 1, 1, 'Core Java: Abstract Classes & Partial Abstraction', '2026-07-14', '09:00:00', '11:00:00', 1),
(122, 1, 1, 'Core Java: Interfaces, Default & Static Methods', '2026-07-15', '09:00:00', '11:00:00', 1),
(123, 1, 1, 'Core Java: Multiple Inheritance via Interfaces', '2026-07-16', '09:00:00', '11:00:00', 1),
(124, 1, 1, 'Core Java: Marker & Functional Interfaces', '2026-07-17', '09:00:00', '11:00:00', 1),
(125, 1, 1, 'Core Java: Packages & Access Modifiers Audit', '2026-07-20', '09:00:00', '11:00:00', 1),
(126, 1, 1, 'Core Java: Exception Hierarchy & Checked Exceptions', '2026-07-21', '09:00:00', '11:00:00', 1),
(127, 1, 1, 'Core Java: Unchecked Exceptions & Runtime Handling', '2026-07-22', '09:00:00', '11:00:00', 1),
(128, 1, 1, 'Core Java: Try-Catch-Finally Execution Order', '2026-07-23', '09:00:00', '11:00:00', 1),
(129, 1, 1, 'Core Java: Try-With-Resources & AutoCloseable', '2026-07-24', '09:00:00', '11:00:00', 1),
(130, 1, 1, 'Core Java: Custom Exceptions & Propagation', '2026-07-27', '09:00:00', '11:00:00', 1),
(131, 1, 1, 'Core Java: Throw vs Throws Deep Dive', '2026-07-28', '09:00:00', '11:00:00', 1),
(132, 1, 1, 'Core Java: Object Class Methods: equals & hashCode', '2026-07-29', '09:00:00', '11:00:00', 1),
(133, 1, 1, 'Core Java: Object Class Methods: toString & clone', '2026-07-30', '09:00:00', '11:00:00', 1),
(134, 1, 1, 'Core Java: Garbage Collection & Finalization', '2026-07-31', '09:00:00', '11:00:00', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- August 2026 Sessions (19 classes)
INSERT INTO attendance_sessions (id, batch_id, subject_id, title, session_date, start_time, end_time, created_by) VALUES
(135, 1, 1, 'Core Java: Wrapper Classes & Autoboxing', '2026-08-03', '09:00:00', '11:00:00', 1),
(136, 1, 1, 'Core Java: Generics: Generic Classes & Methods', '2026-08-04', '09:00:00', '11:00:00', 1),
(137, 1, 1, 'Core Java: Generics: Wildcards & Type Erasure', '2026-08-05', '09:00:00', '11:00:00', 1),
(138, 1, 1, 'Core Java: Collections Framework Overview', '2026-08-06', '09:00:00', '11:00:00', 1),
(139, 1, 1, 'Core Java: ArrayList Architecture & Capacity Growth', '2026-08-07', '09:00:00', '11:00:00', 1),
(140, 1, 1, 'Core Java: LinkedList & Doubly Linked Nodes', '2026-08-11', '09:00:00', '11:00:00', 1),
(141, 1, 1, 'Core Java: Vector, Stack & Legacy Collections', '2026-08-12', '09:00:00', '11:00:00', 1),
(142, 1, 1, 'Core Java: HashSet & Internal HashMap Storage', '2026-08-13', '09:00:00', '11:00:00', 1),
(143, 1, 1, 'Core Java: LinkedHashSet & Insertion Order', '2026-08-14', '09:00:00', '11:00:00', 1),
(144, 1, 1, 'Core Java: TreeSet, Comparable & Comparator', '2026-08-18', '09:00:00', '11:00:00', 1),
(145, 1, 1, 'Core Java: Queue, Deque & ArrayDeque Implementation', '2026-08-19', '09:00:00', '11:00:00', 1),
(146, 1, 1, 'Core Java: PriorityQueue & Min-Heap Ordering', '2026-08-20', '09:00:00', '11:00:00', 1),
(147, 1, 1, 'Core Java: HashMap Internals: Hashing & Buckets', '2026-08-21', '09:00:00', '11:00:00', 1),
(148, 1, 1, 'Core Java: HashMap Collision: LinkedList to Red-Black Tree', '2026-08-25', '09:00:00', '11:00:00', 1),
(149, 1, 1, 'Core Java: LinkedHashMap & LRU Cache Design', '2026-08-26', '09:00:00', '11:00:00', 1),
(150, 1, 1, 'Core Java: TreeMap & Red-Black Tree Operations', '2026-08-27', '09:00:00', '11:00:00', 1),
(151, 1, 1, 'Core Java: Hashtable & Synchronized Collections', '2026-08-28', '09:00:00', '11:00:00', 1),
(152, 1, 1, 'Core Java: ConcurrentHashMap & Segment Locking', '2026-08-29', '09:00:00', '11:00:00', 1),
(153, 1, 1, 'Core Java: Collections Utility Class Methods', '2026-08-31', '09:00:00', '11:00:00', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- September 2026 Sessions (18 classes)
INSERT INTO attendance_sessions (id, batch_id, subject_id, title, session_date, start_time, end_time, created_by) VALUES
(154, 1, 1, 'Core Java: Iterator, ListIterator & Enumeration', '2026-09-01', '09:00:00', '11:00:00', 1),
(155, 1, 1, 'Core Java: Fail-Fast vs Fail-Safe Iterators', '2026-09-02', '09:00:00', '11:00:00', 1),
(156, 1, 1, 'Core Java: Java 8 Lambda Expressions & Syntax', '2026-09-03', '09:00:00', '11:00:00', 1),
(157, 1, 1, 'Core Java: Predicate, Function, Consumer & Supplier', '2026-09-04', '09:00:00', '11:00:00', 1),
(158, 1, 1, 'Core Java: Method References & Constructor References', '2026-09-07', '09:00:00', '11:00:00', 1),
(159, 1, 1, 'Core Java: Stream API: Filter, Map & FlatMap', '2026-09-08', '09:00:00', '11:00:00', 1),
(160, 1, 1, 'Core Java: Stream API: Reduce, Collect & GroupingBy', '2026-09-09', '09:00:00', '11:00:00', 1),
(161, 1, 1, 'Core Java: Parallel Streams & Performance Caveats', '2026-09-10', '09:00:00', '11:00:00', 1),
(162, 1, 1, 'Core Java: Optional Class & NullPointerException Safety', '2026-09-11', '09:00:00', '11:00:00', 1),
(163, 1, 1, 'Core Java: Java Time API (LocalDate, ZonedDateTime)', '2026-09-15', '09:00:00', '11:00:00', 1),
(164, 1, 1, 'Core Java: Multi-Threading: Thread Lifecycle & States', '2026-09-16', '09:00:00', '11:00:00', 1),
(165, 1, 1, 'Core Java: Runnable vs Callable & Future', '2026-09-17', '09:00:00', '11:00:00', 1),
(166, 1, 1, 'Core Java: Synchronization & Intrinsic Locks', '2026-09-18', '09:00:00', '11:00:00', 1),
(167, 1, 1, 'Core Java: Inter-Thread Communication (Wait, Notify)', '2026-09-21', '09:00:00', '11:00:00', 1),
(168, 1, 1, 'Core Java: Deadlock Avoidance & Starvation', '2026-09-22', '09:00:00', '11:00:00', 1),
(169, 1, 1, 'Core Java: ExecutorService & Thread Pool Patterns', '2026-09-23', '09:00:00', '11:00:00', 1),
(170, 1, 1, 'Core Java: Java File I/O & NIO.2 Pathways', '2026-09-24', '09:00:00', '11:00:00', 1),
(171, 1, 1, 'Core Java: Serialization & Transient Keyword', '2026-09-25', '09:00:00', '11:00:00', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 3. Seed Student 1 Attendance Records (36 Present, 35 Absent = 51% Attended)
-- June Records: 3 Present (24, 29, 30), 8 Absent
INSERT INTO attendance_records (session_id, student_id, status, source, attendance_date, marked_at, remarks) VALUES
(101, 1, 'ABSENT',  'MANUAL',  '2026-06-16', '2026-06-16 09:30:00', 'Unexcused absence'),
(102, 1, 'ABSENT',  'MANUAL',  '2026-06-17', '2026-06-17 09:30:00', 'Unexcused absence'),
(103, 1, 'ABSENT',  'MANUAL',  '2026-06-18', '2026-06-18 09:30:00', 'Unexcused absence'),
(104, 1, 'ABSENT',  'MANUAL',  '2026-06-19', '2026-06-19 09:30:00', 'Unexcused absence'),
(105, 1, 'ABSENT',  'MANUAL',  '2026-06-22', '2026-06-22 09:30:00', 'Unexcused absence'),
(106, 1, 'ABSENT',  'MANUAL',  '2026-06-23', '2026-06-23 09:30:00', 'Unexcused absence'),
(107, 1, 'PRESENT', 'QR_SCAN', '2026-06-24', '2026-06-24 08:58:22', 'Verified via QR Scanner'),
(108, 1, 'ABSENT',  'MANUAL',  '2026-06-25', '2026-06-25 09:30:00', 'Unexcused absence'),
(109, 1, 'ABSENT',  'MANUAL',  '2026-06-26', '2026-06-26 09:30:00', 'Unexcused absence'),
(110, 1, 'PRESENT', 'QR_SCAN', '2026-06-29', '2026-06-29 08:52:10', 'Verified via QR Scanner'),
(111, 1, 'PRESENT', 'QR_SCAN', '2026-06-30', '2026-06-30 08:55:40', 'Verified via QR Scanner'),

-- July Records: 12 Present (1, 2, 3, 6, 8, 9, 20, 24, 29, 30, 31), 11 Absent
(112, 1, 'PRESENT', 'QR_SCAN', '2026-07-01', '2026-07-01 08:54:11', 'Verified via QR Scanner'),
(113, 1, 'PRESENT', 'QR_SCAN', '2026-07-02', '2026-07-02 08:50:35', 'Verified via QR Scanner'),
(114, 1, 'PRESENT', 'QR_SCAN', '2026-07-03', '2026-07-03 08:59:02', 'Verified via QR Scanner'),
(115, 1, 'PRESENT', 'QR_SCAN', '2026-07-06', '2026-07-06 08:48:19', 'Verified via QR Scanner'),
(116, 1, 'ABSENT',  'MANUAL',  '2026-07-07', '2026-07-07 09:30:00', 'Unexcused absence'),
(117, 1, 'PRESENT', 'QR_SCAN', '2026-07-08', '2026-07-08 08:57:44', 'Verified via QR Scanner'),
(118, 1, 'PRESENT', 'QR_SCAN', '2026-07-09', '2026-07-09 08:51:30', 'Verified via QR Scanner'),
(119, 1, 'ABSENT',  'MANUAL',  '2026-07-10', '2026-07-10 09:30:00', 'Unexcused absence'),
(120, 1, 'ABSENT',  'MANUAL',  '2026-07-13', '2026-07-13 09:30:00', 'Unexcused absence'),
(121, 1, 'ABSENT',  'MANUAL',  '2026-07-14', '2026-07-14 09:30:00', 'Unexcused absence'),
(122, 1, 'ABSENT',  'MANUAL',  '2026-07-15', '2026-07-15 09:30:00', 'Unexcused absence'),
(123, 1, 'ABSENT',  'MANUAL',  '2026-07-16', '2026-07-16 09:30:00', 'Unexcused absence'),
(124, 1, 'ABSENT',  'MANUAL',  '2026-07-17', '2026-07-17 09:30:00', 'Unexcused absence'),
(125, 1, 'PRESENT', 'QR_SCAN', '2026-07-20', '2026-07-20 08:53:50', 'Verified via QR Scanner'),
(126, 1, 'ABSENT',  'MANUAL',  '2026-07-21', '2026-07-21 09:30:00', 'Unexcused absence'),
(127, 1, 'ABSENT',  'MANUAL',  '2026-07-22', '2026-07-22 09:30:00', 'Unexcused absence'),
(128, 1, 'ABSENT',  'MANUAL',  '2026-07-23', '2026-07-23 09:30:00', 'Unexcused absence'),
(129, 1, 'PRESENT', 'QR_SCAN', '2026-07-24', '2026-07-24 08:56:15', 'Verified via QR Scanner'),
(130, 1, 'ABSENT',  'MANUAL',  '2026-07-27', '2026-07-27 09:30:00', 'Unexcused absence'),
(131, 1, 'ABSENT',  'MANUAL',  '2026-07-28', '2026-07-28 09:30:00', 'Unexcused absence'),
(132, 1, 'PRESENT', 'QR_SCAN', '2026-07-29', '2026-07-29 08:52:05', 'Verified via QR Scanner'),
(133, 1, 'PRESENT', 'QR_SCAN', '2026-07-30', '2026-07-30 08:58:30', 'Verified via QR Scanner'),
(134, 1, 'PRESENT', 'QR_SCAN', '2026-07-31', '2026-07-31 08:51:12', 'Verified via QR Scanner'),

-- August Records: 12 Present (3, 6, 7, 11, 13, 14, 19, 21, 26, 27, 28, 29), 7 Absent
(135, 1, 'PRESENT', 'QR_SCAN', '2026-08-03', '2026-08-03 08:55:00', 'Verified via QR Scanner'),
(136, 1, 'ABSENT',  'MANUAL',  '2026-08-04', '2026-08-04 09:30:00', 'Unexcused absence'),
(137, 1, 'ABSENT',  'MANUAL',  '2026-08-05', '2026-08-05 09:30:00', 'Unexcused absence'),
(138, 1, 'PRESENT', 'QR_SCAN', '2026-08-06', '2026-08-06 08:56:45', 'Verified via QR Scanner'),
(139, 1, 'PRESENT', 'QR_SCAN', '2026-08-07', '2026-08-07 08:53:20', 'Verified via QR Scanner'),
(140, 1, 'PRESENT', 'QR_SCAN', '2026-08-11', '2026-08-11 08:50:18', 'Verified via QR Scanner'),
(141, 1, 'ABSENT',  'MANUAL',  '2026-08-12', '2026-08-12 09:30:00', 'Unexcused absence'),
(142, 1, 'PRESENT', 'QR_SCAN', '2026-08-13', '2026-08-13 08:58:40', 'Verified via QR Scanner'),
(143, 1, 'PRESENT', 'QR_SCAN', '2026-08-14', '2026-08-14 08:49:15', 'Verified via QR Scanner'),
(144, 1, 'ABSENT',  'MANUAL',  '2026-08-18', '2026-08-18 09:30:00', 'Unexcused absence'),
(145, 1, 'PRESENT', 'QR_SCAN', '2026-08-19', '2026-08-19 08:54:25', 'Verified via QR Scanner'),
(146, 1, 'ABSENT',  'MANUAL',  '2026-08-20', '2026-08-20 09:30:00', 'Unexcused absence'),
(147, 1, 'PRESENT', 'QR_SCAN', '2026-08-21', '2026-08-21 08:52:40', 'Verified via QR Scanner'),
(148, 1, 'ABSENT',  'MANUAL',  '2026-08-25', '2026-08-25 09:30:00', 'Unexcused absence'),
(149, 1, 'PRESENT', 'QR_SCAN', '2026-08-26', '2026-08-26 08:57:02', 'Verified via QR Scanner'),
(150, 1, 'PRESENT', 'QR_SCAN', '2026-08-27', '2026-08-27 08:51:30', 'Verified via QR Scanner'),
(151, 1, 'PRESENT', 'QR_SCAN', '2026-08-28', '2026-08-28 08:48:50', 'Verified via QR Scanner'),
(152, 1, 'PRESENT', 'QR_SCAN', '2026-08-29', '2026-08-29 09:05:10', 'Verified via QR Scanner (Saturday extra class)'),
(153, 1, 'ABSENT',  'MANUAL',  '2026-08-31', '2026-08-31 09:30:00', 'Unexcused absence'),

-- September Records: 9 Present (2, 3, 15, 17, 18, 21, 22, 24), 9 Absent
(154, 1, 'ABSENT',  'MANUAL',  '2026-09-01', '2026-09-01 09:30:00', 'Unexcused absence'),
(155, 1, 'PRESENT', 'QR_SCAN', '2026-09-02', '2026-09-02 08:53:14', 'Verified via QR Scanner'),
(156, 1, 'PRESENT', 'QR_SCAN', '2026-09-03', '2026-09-03 08:57:40', 'Verified via QR Scanner'),
(157, 1, 'ABSENT',  'MANUAL',  '2026-09-04', '2026-09-04 09:30:00', 'Unexcused absence'),
(158, 1, 'ABSENT',  'MANUAL',  '2026-09-07', '2026-09-07 09:30:00', 'Unexcused absence'),
(159, 1, 'ABSENT',  'MANUAL',  '2026-09-08', '2026-09-08 09:30:00', 'Unexcused absence'),
(160, 1, 'ABSENT',  'MANUAL',  '2026-09-09', '2026-09-09 09:30:00', 'Unexcused absence'),
(161, 1, 'ABSENT',  'MANUAL',  '2026-09-10', '2026-09-10 09:30:00', 'Unexcused absence'),
(162, 1, 'ABSENT',  'MANUAL',  '2026-09-11', '2026-09-11 09:30:00', 'Unexcused absence'),
(163, 1, 'PRESENT', 'QR_SCAN', '2026-09-15', '2026-09-15 08:52:10', 'Verified via QR Scanner'),
(164, 1, 'ABSENT',  'MANUAL',  '2026-09-16', '2026-09-16 09:30:00', 'Unexcused absence'),
(165, 1, 'PRESENT', 'QR_SCAN', '2026-09-17', '2026-09-17 08:59:30', 'Verified via QR Scanner'),
(166, 1, 'PRESENT', 'QR_SCAN', '2026-09-18', '2026-09-18 08:51:22', 'Verified via QR Scanner'),
(167, 1, 'PRESENT', 'QR_SCAN', '2026-09-21', '2026-09-21 08:49:15', 'Verified via QR Scanner'),
(168, 1, 'PRESENT', 'QR_SCAN', '2026-09-22', '2026-09-22 08:56:50', 'Verified via QR Scanner'),
(169, 1, 'ABSENT',  'MANUAL',  '2026-09-23', '2026-09-23 09:30:00', 'Unexcused absence'),
(170, 1, 'PRESENT', 'QR_SCAN', '2026-09-24', '2026-09-24 08:58:05', 'Verified via QR Scanner'),
(171, 1, 'ABSENT',  'MANUAL',  '2026-09-25', '2026-09-25 09:30:00', 'Unexcused absence')
ON DUPLICATE KEY UPDATE 
    status = VALUES(status),
    source = VALUES(source),
    attendance_date = VALUES(attendance_date),
    marked_at = VALUES(marked_at),
    remarks = VALUES(remarks);

-- 4. Seed other subjects sessions so tab switching works dynamically with real data
-- Programming (Subject 2): 45 sessions, 38 present = 84%
INSERT INTO attendance_sessions (id, batch_id, subject_id, title, session_date, start_time, end_time, created_by) VALUES
(201, 1, 2, 'Programming: Flowcharts & Pseudocode Logic', '2026-07-02', '14:00:00', '16:00:00', 1),
(202, 1, 2, 'Programming: Number Theory & Prime Algorithms', '2026-07-09', '14:00:00', '16:00:00', 1),
(203, 1, 2, 'Programming: Array Reversals & Two Pointers', '2026-07-16', '14:00:00', '16:00:00', 1),
(204, 1, 2, 'Programming: Sliding Window Maximum Sum Subarray', '2026-07-23', '14:00:00', '16:00:00', 1),
(205, 1, 2, 'Programming: Matrix Rotation & Spirals', '2026-07-30', '14:00:00', '16:00:00', 1),
(206, 1, 2, 'Programming: String Palindromes & Anagrams', '2026-08-06', '14:00:00', '16:00:00', 1),
(207, 1, 2, 'Programming: Fast & Slow Pointer Floyd Cycle', '2026-08-13', '14:00:00', '16:00:00', 1),
(208, 1, 2, 'Programming: Binary Search Variations', '2026-08-20', '14:00:00', '16:00:00', 1),
(209, 1, 2, 'Programming: Recursion & Backtracking Subset Sums', '2026-08-27', '14:00:00', '16:00:00', 1),
(210, 1, 2, 'Programming: Stack Next Greater Element', '2026-09-03', '14:00:00', '16:00:00', 1),
(211, 1, 2, 'Programming: Dynamic Programming 0/1 Knapsack', '2026-09-17', '14:00:00', '16:00:00', 1),
(212, 1, 2, 'Programming: Mock Tech Interview Problem Marathon', '2026-09-24', '14:00:00', '16:00:00', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO attendance_records (session_id, student_id, status, source, attendance_date, marked_at, remarks) VALUES
(201, 1, 'PRESENT', 'QR_SCAN', '2026-07-02', '2026-07-02 13:55:00', 'Scanned via QR Code'),
(202, 1, 'PRESENT', 'QR_SCAN', '2026-07-09', '2026-07-09 13:58:00', 'Scanned via QR Code'),
(203, 1, 'PRESENT', 'QR_SCAN', '2026-07-16', '2026-07-16 13:50:00', 'Scanned via QR Code'),
(204, 1, 'PRESENT', 'QR_SCAN', '2026-07-23', '2026-07-23 13:54:00', 'Scanned via QR Code'),
(205, 1, 'ABSENT',  'MANUAL',  '2026-07-30', '2026-07-30 14:15:00', 'Missed lab session'),
(206, 1, 'PRESENT', 'QR_SCAN', '2026-08-06', '2026-08-06 13:59:00', 'Scanned via QR Code'),
(207, 1, 'PRESENT', 'QR_SCAN', '2026-08-13', '2026-08-13 13:52:00', 'Scanned via QR Code'),
(208, 1, 'PRESENT', 'QR_SCAN', '2026-08-20', '2026-08-20 13:51:00', 'Scanned via QR Code'),
(209, 1, 'PRESENT', 'QR_SCAN', '2026-08-27', '2026-08-27 13:58:00', 'Scanned via QR Code'),
(210, 1, 'PRESENT', 'QR_SCAN', '2026-09-03', '2026-09-03 13:57:00', 'Scanned via QR Code'),
(211, 1, 'PRESENT', 'QR_SCAN', '2026-09-17', '2026-09-17 13:53:00', 'Scanned via QR Code'),
(212, 1, 'PRESENT', 'QR_SCAN', '2026-09-24', '2026-09-24 13:50:00', 'Scanned via QR Code')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- SQL (Subject 3): sessions & records
INSERT INTO attendance_sessions (id, batch_id, subject_id, title, session_date, start_time, end_time, created_by) VALUES
(301, 1, 3, 'SQL: Relational Modeling & Schema Design', '2026-07-07', '11:30:00', '13:00:00', 1),
(302, 1, 3, 'SQL: SELECT, WHERE, LIKE & Regular Expressions', '2026-07-14', '11:30:00', '13:00:00', 1),
(303, 1, 3, 'SQL: Aggregate Functions & GROUP BY Having', '2026-07-21', '11:30:00', '13:00:00', 1),
(304, 1, 3, 'SQL: INNER, LEFT, RIGHT & FULL OUTER JOINS', '2026-07-28', '11:30:00', '13:00:00', 1),
(305, 1, 3, 'SQL: Correlated Subqueries & Exists Clause', '2026-08-04', '11:30:00', '13:00:00', 1),
(306, 1, 3, 'SQL: Common Table Expressions (CTEs) & Window Functions', '2026-08-11', '11:30:00', '13:00:00', 1),
(307, 1, 3, 'SQL: Indexes, B-Tree Execution Plans & Tuning', '2026-08-18', '11:30:00', '13:00:00', 1),
(308, 1, 3, 'SQL: ACID Transactions & Concurrency Locks', '2026-08-25', '11:30:00', '13:00:00', 1),
(309, 1, 3, 'SQL: Stored Procedures & Triggers', '2026-09-08', '11:30:00', '13:00:00', 1),
(310, 1, 3, 'SQL: Real-World Database Case Studies', '2026-09-22', '11:30:00', '13:00:00', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO attendance_records (session_id, student_id, status, source, attendance_date, marked_at, remarks) VALUES
(301, 1, 'PRESENT', 'QR_SCAN', '2026-07-07', '2026-07-07 11:28:00', 'Scanned via QR Code'),
(302, 1, 'PRESENT', 'QR_SCAN', '2026-07-14', '2026-07-14 11:26:00', 'Scanned via QR Code'),
(303, 1, 'PRESENT', 'QR_SCAN', '2026-07-21', '2026-07-21 11:29:00', 'Scanned via QR Code'),
(304, 1, 'ABSENT',  'MANUAL',  '2026-07-28', '2026-07-28 11:45:00', 'Medical leave'),
(305, 1, 'PRESENT', 'QR_SCAN', '2026-08-04', '2026-08-04 11:25:00', 'Scanned via QR Code'),
(306, 1, 'PRESENT', 'QR_SCAN', '2026-08-11', '2026-08-11 11:27:00', 'Scanned via QR Code'),
(307, 1, 'PRESENT', 'QR_SCAN', '2026-08-18', '2026-08-18 11:28:00', 'Scanned via QR Code'),
(308, 1, 'PRESENT', 'QR_SCAN', '2026-08-25', '2026-08-25 11:24:00', 'Scanned via QR Code'),
(309, 1, 'PRESENT', 'QR_SCAN', '2026-09-08', '2026-09-08 11:26:00', 'Scanned via QR Code'),
(310, 1, 'PRESENT', 'QR_SCAN', '2026-09-22', '2026-09-22 11:29:00', 'Scanned via QR Code')
ON DUPLICATE KEY UPDATE status=VALUES(status);

SET FOREIGN_KEY_CHECKS = 1;
