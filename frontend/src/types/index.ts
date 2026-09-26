export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'ROLE_STUDENT' | 'ROLE_ADMIN' | 'ROLE_INSTRUCTOR';
  studentIdNumber?: string | null;
  avatarUrl?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardData {
  metrics: {
    courseProgressPercentage: number;
    assignmentProgressPercentage: number;
    testAveragePercentage: number;
    attendancePercentage: number;
    totalPoints: number;
    solvedQuestions: number;
    completedVideos: number;
  };
  resumeLearning: {
    videoId: number;
    videoTitle: string;
    topicId: number;
    topicTitle: string;
    courseId: number;
    courseTitle: string;
    watchedPercentage: number;
    continueUrl?: string;
  } | null;
  streak?: {
    currentStreak: number;
    longestStreak: number;
    correctSubmissions: number;
    totalSubmissions: number;
  };
  heatmap: Array<{
    date: string;
    count: number;
  }>;
  leaderboard: {
    topStudents: Array<{
      rank: number;
      userId: number;
      name: string;
      avatarUrl: string;
      points: number;
      batchName: string;
    }>;
    currentUserRank: number;
    currentUserPoints: number;
  };
  recentActivity: Array<{
    eventType: string;
    title: string;
    timestamp: string;
    linkUrl: string;
  }>;
  upcomingAssignments: Array<{
    id: number;
    title: string;
    type: string;
    deadline: string;
    linkUrl: string;
  }>;
  upcomingTests: Array<{
    id: number;
    title: string;
    type: string;
    deadline: string;
    linkUrl: string;
  }>;
}

export interface CourseSummary {
  id: number;
  code: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subjectCount: number;
  topicCount: number;
  completedTopicCount: number;
  progressPercentage: number;
}

export interface CourseDetail {
  id: number;
  code: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subjects: SubjectDetail[];
}

export interface SubjectDetail {
  id: number;
  code: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  moduleCount: number;
  completedTopics: number;
  totalTopics: number;
  modules?: ModuleDetail[];
}

export interface ModuleDetail {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  topics: TopicItem[];
}

export interface TopicItem {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  durationMinutes: number;
  hasVideo: boolean;
  hasMaterial: boolean;
  completed: boolean;
  videoUrl?: string;
}

export interface TopicVideoItem {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  lastPositionSeconds?: number;
  watchedPercentage?: number;
  completed?: boolean;
}

export interface TopicDetail {
  id: number;
  moduleId?: number;
  moduleTitle?: string;
  subjectId?: number;
  subjectTitle?: string;
  courseId?: number;
  courseTitle?: string;
  title: string;
  description?: string;
  content?: string;
  orderIndex?: number;
  durationMinutes?: number;
  completed?: boolean;
  video?: TopicVideoItem | null;
  videos?: TopicVideoItem[];
  videoUrl?: string;
  materials?: MaterialItem[];
}

export interface MaterialItem {
  id: number;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
}

export interface AssignmentDetail {
  id: number;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  totalMarks: number;
  timeLimitMinutes: number;
  marksObtained: number;
  percentage: number;
  sections: AssignmentSection[];
}

export interface AssignmentSection {
  id: number;
  assignmentId: number;
  sectionNumber: number;
  title: string;
  description: string;
  questionCount: number;
  solvedCount: number;
  totalMarks: number;
  marksObtained: number;
  locked: boolean;
  status: 'LOCKED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  questions: SectionQuestion[];
}

export interface SectionQuestion {
  id: number;
  title: string;
  questionType: 'MCQ_SINGLE' | 'MCQ_MULTI' | 'CODING' | 'FILL_BLANKS';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
  marksObtained: number;
  status: 'NOT_ATTEMPTED' | 'SOLVED' | 'WRONG_ANSWER' | 'PARTIAL';
  bookmarked: boolean;
}

export interface QuestionDetail {
  id: number;
  title: string;
  description: string;
  questionType: 'MCQ_SINGLE' | 'MCQ_MULTI' | 'CODING' | 'FILL_BLANKS';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
  bookmarked: boolean;
  status: string;
  options?: QuestionOption[];
  codingProblem?: CodingProblemDetail;
}

export interface QuestionOption {
  id: number;
  optionLabel: string;
  optionText: string;
}

export interface CodingProblemDetail {
  id: number;
  title: string;
  slug?: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimitMs: number;
  memoryLimitMb: number;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  starterCodeJava: string;
  starterCodePython: string;
  starterCodeJs: string;
  sampleTestCases: TestCase[];
}

export interface TestCase {
  id: number;
  inputData: string;
  expectedOutput: string;
  explanation?: string;
  orderIndex?: number;
}

export interface RunCodeResult {
  status: string;
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  memoryKb: number;
  compileOutput?: string | null;
  testCaseResults?: Array<{
    testCaseId: number;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    runtimeMs: number;
    hidden: boolean;
  }>;
}

export interface SubmitCodeResult {
  submissionId: number;
  status: string;
  passedTestCases: number;
  totalTestCases: number;
  runtimeMs: number;
  memoryKb: number;
  marksAwarded: number;
  compileOutput?: string | null;
  testCaseResults?: Array<{
    testCaseId: number;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    runtimeMs: number;
    hidden: boolean;
  }>;
}

export interface TestSummary {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  attemptStatus: string | null;
  score: number | null;
  percentage: number | null;
  attemptId: number | null;
}

export interface TestSession {
  attemptId: number;
  testId: number;
  testTitle: string;
  startedAt: string;
  deadline: string;
  remainingSeconds: number;
  sections: Array<{
    id: number;
    title: string;
    questions: Array<{
      questionId: number;
      title: string;
      description: string;
      questionType: string;
      marks: number;
      options?: Array<{ label: string; text: string }>;
      savedAnswer?: string | null;
    }>;
  }>;
}

export interface TestResult {
  attemptId: number;
  testId: number;
  testTitle: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  status: string;
  completedAt: string;
  reviewItems: Array<{
    questionId: number;
    questionTitle: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    marksAwarded: number;
    maxMarks: number;
    explanation: string;
  }>;
}

export interface AttendanceData {
  overallPercentage: number;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  subjectWise: Array<{
    subjectId: number;
    subjectTitle: string;
    totalClasses: number;
    presentClasses: number;
    percentage: number;
  }>;
  history: Array<{
    sessionId: number;
    sessionTitle: string;
    subjectTitle: string;
    sessionDate: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks: string;
  }>;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface BookmarkItem {
  id: number;
  itemType: 'QUESTION' | 'TOPIC' | 'MATERIAL';
  itemId: number;
  title: string;
  subtitle: string;
  linkUrl: string;
  createdAt: string;
}

export interface PersonalizedStudentDashboard {
  student: {
    name: string;
    studentCode: string;
    batch: string;
    course: string;
    college?: string;
    semesterOrYear?: string;
    phone?: string;
    email?: string;
    avatarUrl?: string;
  };
  statistics: {
    practiceDays: number;
    currentStreak: number;
    longestStreak: number;
    practiceTime: string;
    problemsSolved: number;
    problemsAttempted: number;
    acceptanceRate: number;
    assignmentsCompleted: number;
    assignmentsTotal: number;
    testsCompleted: number;
    averageTestPercentage: number;
    totalMarks: number;
    totalPossibleMarks: number;
    overallPercentage: number;
    courseProgress: number;
    attendancePercentage: number;
    points: number;
  };
  attendanceSummary?: {
    overallPercentage: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    totalSessions: number;
  };
  recentActivity: Array<{
    eventType: string;
    title: string;
    timestamp: string;
    linkUrl: string;
  }>;
  assignments: Array<{
    id: number;
    title: string;
    subjectTitle: string;
    dueDate: string;
    status: string;
    score: number;
    totalMarks: number;
    percentage: number;
  }>;
  testResults: Array<{
    id: number;
    title: string;
    date: string;
    score: number;
    totalMarks: number;
    percentage: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    status: string;
  }>;
  codingHistory: Array<{
    submissionId: number;
    problemTitle: string;
    language: string;
    status: string;
    runtimeMs: number;
    submittedAt: string;
  }>;
  subjectPerformance: Array<{
    subjectName: string;
    assignmentsPercentage: number;
    testsPercentage: number;
    codingPercentage: number;
  }>;
  courseProgress: Array<{
    moduleName: string;
    completionPercentage: number;
  }>;
  activityHeatmap: Array<{
    date: string;
    count: number;
  }>;
  notifications: Array<{
    id: number;
    title: string;
    type: string;
    deadline: string;
    linkUrl: string;
  }>;
}

export interface AdminOverview {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalCourses: number;
  totalBatches: number;
  totalAssignments: number;
  totalTests: number;
  totalQuestions: number;
  totalSubmissions: number;
  totalAttendanceSessions: number;
  averageAttendance: number;
  averageTestScore: number;
  assignmentCompletionRate: number;
  recentStudents: Array<StudentAdminItem>;
  recentSubmissions: Array<{
    submissionId: number;
    studentName: string;
    questionTitle: string;
    language: string;
    status: string;
    runtimeMs: number;
    submittedAt: string;
  }>;
  upcomingTests?: Array<{
    id: number;
    title: string;
    deadline: string;
    targetBatch: string;
  }>;
  upcomingAssignments?: Array<{
    id: number;
    title: string;
    deadline: string;
    targetBatch: string;
  }>;
}

export interface StudentAdminItem {
  userId: number;
  studentId?: number;
  name: string;
  email: string;
  studentIdNumber: string;
  phone?: string;
  college?: string;
  batchId?: number;
  batchName: string;
  courseId?: number;
  courseTitle?: string;
  status: string;
  points: number;
  attendancePercentage?: number;
  assignmentProgress?: number;
  testPerformance?: number;
  solvedProblems?: number;
  qrToken?: string;
  qrStatus?: string;
  createdAt: string;
}

export interface StudentDetailResponse {
  profile: StudentAdminItem;
  attendanceRecords: Array<{
    sessionId: number;
    sessionDate: string;
    topic: string;
    status: string;
    remarks: string;
  }>;
  assignmentAttempts: Array<{
    assignmentId: number;
    title: string;
    status: string;
    marksObtained: number;
    totalMarks: number;
    submittedAt: string;
  }>;
  testAttempts: Array<{
    testId: number;
    title: string;
    score: number;
    totalMarks: number;
    percentage: number;
    status: string;
    submittedAt: string;
  }>;
  codingSubmissions: Array<{
    submissionId: number;
    questionTitle: string;
    language: string;
    status: string;
    runtimeMs: number;
    submittedAt: string;
  }>;
  activityLog: Array<{
    eventType: string;
    details: string;
    createdAt: string;
  }>;
}

export interface BatchItem {
  id: number;
  name: string;
  code: string;
  description: string;
  courseId?: number;
  courseTitle?: string;
  startDate: string;
  endDate: string;
  active: boolean;
  totalStudents: number;
  activeStudents: number;
  averageAttendance: number;
  assignmentCompletion: number;
  averageTestScore: number;
  solvedCodingProblems: number;
}

export interface AdminCourseItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  orderIndex: number;
  published: boolean;
  totalSubjects: number;
  totalStudents: number;
}

export type CourseItem = AdminCourseItem;

export interface AssignmentAdminItem {
  id: number;
  title: string;
  description: string;
  courseId?: number;
  courseTitle?: string;
  batchId?: number;
  batchName?: string;
  difficulty: string;
  totalMarks: number;
  passingMarks: number;
  maxAttempts: number;
  startDate: string;
  dueDate: string;
  published: boolean;
  totalSections: number;
  totalQuestions: number;
  studentCompletions: number;
}

export interface QuestionBankItem {
  id: number;
  title: string;
  description: string;
  questionType: string;
  difficulty: string;
  marks: number;
  negativeMarks: number;
  topicId?: number;
  topicTitle?: string;
  subjectTitle?: string;
  courseTitle?: string;
  tags?: string;
  active: boolean;
  options?: Array<{
    id: number;
    optionLabel: string;
    optionText: string;
    correct: boolean;
  }>;
}

export interface TestAdminItem {
  id: number;
  title: string;
  description: string;
  courseId?: number;
  courseTitle?: string;
  batchId?: number;
  batchName?: string;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  negativeMarks: number;
  startTime: string;
  endTime: string;
  attemptLimit: number;
  published: boolean;
  totalQuestions: number;
  studentAttempts: number;
  averageScore: number;
}

export interface AttendanceSessionItem {
  id: number;
  batchId: number;
  batchName: string;
  topic: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalStudents: number;
}

export interface MaterialAdminItem {
  id: number;
  title: string;
  description: string;
  courseId?: number;
  courseTitle?: string;
  subjectId?: number;
  subjectTitle?: string;
  topicId?: number;
  topicTitle?: string;
  materialType: string;
  fileUrl: string;
  fileSizeBytes: number;
  published: boolean;
  createdAt: string;
}

export interface VideoAdminItem {
  id: number;
  topicId: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  orderIndex: number;
  published: boolean;
  topicTitle?: string;
  moduleTitle?: string;
  courseTitle?: string;
}

export interface StudentAttendanceMarkItem {
  studentId: number;
  studentName?: string;
  studentCode?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export interface StudentCreateRequest {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  studentIdNumber: string;
  studentCode?: string;
  phone?: string;
  college?: string;
  semesterOrYear?: string;
  batchId?: number;
}

export interface StudentUpdateRequest {
  fullName: string;
  email: string;
  studentIdNumber: string;
  studentCode?: string;
  phone?: string;
  college?: string;
  semesterOrYear?: string;
  batchId?: number;
}

export interface BatchCreateRequest {
  name: string;
  code: string;
  description?: string;
  courseId?: number;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export interface CourseCreateRequest {
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  orderIndex?: number;
  published?: boolean;
}

export interface SubjectCreateRequest {
  courseId: number;
  title: string;
  description?: string;
  orderIndex?: number;
  published?: boolean;
}

export interface ModuleCreateRequest {
  subjectId: number;
  title: string;
  description?: string;
  orderIndex?: number;
  published?: boolean;
}

export interface TopicCreateRequest {
  moduleId: number;
  title: string;
  description?: string;
  orderIndex?: number;
  published?: boolean;
  videoUrl?: string;
  videoTitle?: string;
  durationMinutes?: number;
  thumbnailUrl?: string;
}

export interface AssignmentCreateRequest {
  title: string;
  description?: string;
  courseId?: number;
  subjectId?: number;
  topicId?: number;
  batchId?: number;
  difficulty?: string;
  totalMarks?: number;
  passingMarks?: number;
  maxAttempts?: number;
  startDate?: string;
  dueDate?: string;
  published?: boolean;
  sections?: Array<{
    title: string;
    description?: string;
    sectionNumber: number;
    questionIds: number[];
  }>;
}

export interface QuestionOptionItem {
  id?: number;
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
}

export interface TestCaseItem {
  inputData: string;
  expectedOutput: string;
  hidden: boolean;
}

export interface CodingSpecsDto {
  problemStatement?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  starterCodeJava?: string;
  starterCodePython?: string;
  starterCodeJs?: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  sampleInput?: string;
  sampleOutput?: string;
  testCases?: TestCaseItem[];
}

export interface QuestionCreateRequest {
  title: string;
  description?: string;
  explanation?: string;
  questionType: string;
  difficulty: string;
  marks?: number;
  negativeMarks?: number;
  topicId?: number;
  tags?: string;
  active?: boolean;
  options?: QuestionOptionItem[];
  codingSpecs?: CodingSpecsDto;
}

export interface TestCreateRequest {
  title: string;
  description?: string;
  courseId?: number;
  batchId?: number;
  durationMinutes?: number;
  totalMarks?: number;
  passingPercentage?: number;
  negativeMarks?: number;
  startTime?: string;
  endTime?: string;
  attemptLimit?: number;
  published?: boolean;
  sections?: Array<{
    title: string;
    orderIndex: number;
    questionIds: number[];
  }>;
}

export interface AttendanceSessionCreateRequest {
  batchId: number;
  subjectId?: number;
  title: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
}

export interface AttendanceMarkRequest {
  sessionId: number;
  records: StudentAttendanceMarkItem[];
}

export interface MaterialCreateRequest {
  title: string;
  description?: string;
  courseId?: number;
  subjectId?: number;
  moduleId?: number;
  topicId?: number;
  materialType?: string;
  fileUrl: string;
  fileSizeBytes?: number;
  published?: boolean;
}

export interface VideoCreateRequest {
  topicId: number;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  orderIndex?: number;
  published?: boolean;
}

export interface AnnouncementCreateRequest {
  title: string;
  message: string;
  type?: string;
  targetBatchId?: number;
  linkUrl?: string;
}

export interface MyQrCodeResponse {
  studentId: number;
  studentIdNumber: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  batchId: number;
  batchName: string;
  courseTitle: string;
  qrToken: string;
  qrStatus: string;
  qrGeneratedAt: string;
}

export interface QrScanRequest {
  qrToken: string;
  sessionId?: number;
  deviceInfo?: string;
}

export interface QrScanResponse {
  attendanceStatus: 'PRESENT' | 'ALREADY_MARKED' | 'INVALID_QR' | 'INACTIVE_STUDENT' | 'REVOKED';
  message: string;
  student?: {
    id: number;
    studentIdNumber: string;
    fullName: string;
    email: string;
    batchName: string;
    avatarUrl?: string;
  };
  attendanceDate?: string;
  attendanceTime?: string;
  sessionId?: number;
  sessionTitle?: string;
  source?: string;
  markedAt?: string;
  existingMarkedAt?: string;
}

export interface CalendarDayStat {
  date: string;
  dayOfWeek: string;
  status: 'PRESENT' | 'ABSENT' | 'NO_SESSION';
  sessionTitle?: string;
  markedAt?: string;
  source?: 'QR_SCAN' | 'MANUAL';
}

export interface CalendarAttendanceResponse {
  year: number;
  month: number;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
  days: CalendarDayStat[];
}

export interface TodayScanItem {
  recordId: number;
  studentId: number;
  studentIdNumber: string;
  studentName: string;
  batchName: string;
  status: string;
  scanTime: string;
  markedByAdminName: string;
  source: string;
  remarks?: string;
}

