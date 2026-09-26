// Assignment & Question Store with Persistent Hierarchy (Topics, Sub-topics, Coding Questions, Test Cases)

export interface TestCase {
  id: number;
  inputData: string;
  expectedOutput: string;
  isHidden?: boolean;
  explanation?: string;
}

export interface AssignmentQuestion {
  id: number;
  subTopicId: number;
  title: string;
  questionType: 'CODING' | 'SINGLE_CHOICE' | 'MULTI_CHOICE';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  starterCodeJava: string;
  testCases: TestCase[];
  solved: boolean;
  bookmarked: boolean;
}

export interface Topic {
  id: number;
  assignmentId: number;
  title: string;
  description: string;
  orderIndex: number;
}

export interface SubTopic {
  id: number;
  topicId: number;
  assignmentId: number;
  sectionNumber: number;
  title: string;
  description: string;
  questionCount: number;
  solvedCount: number;
  totalMarks: number;
  marksObtained: number;
  locked: boolean;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

const STORAGE_KEY = 'sp_assignment_hierarchy_v3';
const SOLVED_KEY = 'sp_solved_questions_v3';

// Default Topics for "Programming"
export const DEFAULT_TOPICS: Topic[] = [
  {
    id: 1,
    assignmentId: 1,
    title: 'Data Types',
    description: 'Primitive types, Scanner input, type casting, arithmetic operators',
    orderIndex: 1,
  },
  {
    id: 2,
    assignmentId: 1,
    title: 'If Else & Conditionals',
    description: 'Branching decisions, logical conditions, comparison operators',
    orderIndex: 2,
  },
  {
    id: 3,
    assignmentId: 1,
    title: 'Loops & Iterations',
    description: 'For loops, while loops, accumulator logic, nested iteration patterns',
    orderIndex: 3,
  },
  {
    id: 4,
    assignmentId: 1,
    title: 'Array',
    description: 'Linear arrays, subarrays, multidimensional arrays, two pointers',
    orderIndex: 4,
  },
];

// Default Sub-topics grouped under Topics
export const DEFAULT_SUBTOPICS: SubTopic[] = [
  // Under Topic 1: Data Types
  {
    id: 1,
    topicId: 1,
    assignmentId: 1,
    sectionNumber: 1,
    title: 'Primitive Types & Scanner',
    description: 'Variables, inputs, scanner reading, arithmetic expressions',
    questionCount: 6,
    solvedCount: 6,
    totalMarks: 60,
    marksObtained: 60,
    locked: false,
    status: 'COMPLETED',
  },
  // Under Topic 2: If Else
  {
    id: 2,
    topicId: 2,
    assignmentId: 1,
    sectionNumber: 2,
    title: 'Conditionals & Branching',
    description: 'If-else statements, relational operators, ternary logic',
    questionCount: 3,
    solvedCount: 1,
    totalMarks: 30,
    marksObtained: 10,
    locked: false,
    status: 'IN_PROGRESS',
  },
  // Under Topic 3: Loops
  {
    id: 3,
    topicId: 3,
    assignmentId: 1,
    sectionNumber: 3,
    title: 'Loops & Iterations',
    description: 'For loops, while loops, accumulator patterns',
    questionCount: 3,
    solvedCount: 0,
    totalMarks: 30,
    marksObtained: 0,
    locked: false,
    status: 'NOT_STARTED',
  },
  // Under Topic 4: Array
  {
    id: 4,
    topicId: 4,
    assignmentId: 1,
    sectionNumber: 4,
    title: 'Array Traversal',
    description: '1D array manipulation, element searching, extrema finding',
    questionCount: 3,
    solvedCount: 0,
    totalMarks: 30,
    marksObtained: 0,
    locked: false,
    status: 'NOT_STARTED',
  },
  {
    id: 5,
    topicId: 4,
    assignmentId: 1,
    sectionNumber: 5,
    title: 'Sub-array',
    description: 'Sub-array slices, sliding windows, subarray sums',
    questionCount: 1,
    solvedCount: 0,
    totalMarks: 10,
    marksObtained: 0,
    locked: false,
    status: 'NOT_STARTED',
  },
  {
    id: 6,
    topicId: 4,
    assignmentId: 1,
    sectionNumber: 6,
    title: 'Multiple Array (2D Matrix)',
    description: 'Multi-dimensional arrays, rows, columns, and matrix traversal',
    questionCount: 1,
    solvedCount: 0,
    totalMarks: 10,
    marksObtained: 0,
    locked: false,
    status: 'NOT_STARTED',
  },
];

// Built-in Questions with Realistic Problem Statements & Real Test Cases
export const DEFAULT_QUESTIONS: AssignmentQuestion[] = [
  // --- SUB-TOPIC 1: DATA TYPES ---
  {
    id: 101,
    subTopicId: 1,
    title: 'Add 2 Integers',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Write a Java program to read two integers m and n from standard input and print their sum.',
    inputFormat: 'First line contains integer m. Second line contains integer n.',
    outputFormat: 'Print the sum of m and n.',
    constraints: '-10^9 <= m, n <= 10^9',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int m = scanner.nextInt();
        int n = scanner.nextInt();
        
        // Write your solution below
        System.out.println(m + n);
    }
}`,
    testCases: [
      { id: 1, inputData: '5\n10\n', expectedOutput: '15', explanation: '5 + 10 = 15' },
      { id: 2, inputData: '20\n30\n', expectedOutput: '50', explanation: '20 + 30 = 50' },
      { id: 3, inputData: '-15\n35\n', expectedOutput: '20', isHidden: true },
      { id: 4, inputData: '0\n0\n', expectedOutput: '0', isHidden: true },
    ],
    solved: true,
    bookmarked: false,
  },
  {
    id: 102,
    subTopicId: 1,
    title: 'Adding Three Integers',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Write a program to read three integers a, b, and c and print their total sum.',
    inputFormat: 'Three space-separated or newline-separated integers a, b, c.',
    outputFormat: 'Print the sum of the three integers.',
    constraints: '-10^6 <= a, b, c <= 10^6',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        int c = scanner.nextInt();
        
        // Print the sum of a, b, and c
        System.out.println(a + b + c);
    }
}`,
    testCases: [
      { id: 1, inputData: '1\n2\n3\n', expectedOutput: '6' },
      { id: 2, inputData: '10\n20\n30\n', expectedOutput: '60' },
      { id: 3, inputData: '100\n-50\n25\n', expectedOutput: '75', isHidden: true },
    ],
    solved: true,
    bookmarked: false,
  },
  {
    id: 103,
    subTopicId: 1,
    title: 'Product of Three',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Given three integers x, y, and z, compute and print their product.',
    inputFormat: 'Three integers x, y, and z.',
    outputFormat: 'Print (x * y * z).',
    constraints: '-1000 <= x, y, z <= 1000',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int x = scanner.nextInt();
        int y = scanner.nextInt();
        int z = scanner.nextInt();
        
        System.out.println(x * y * z);
    }
}`,
    testCases: [
      { id: 1, inputData: '2\n3\n4\n', expectedOutput: '24' },
      { id: 2, inputData: '5\n10\n2\n', expectedOutput: '100' },
      { id: 3, inputData: '-2\n3\n-4\n', expectedOutput: '24', isHidden: true },
    ],
    solved: true,
    bookmarked: false,
  },
  {
    id: 104,
    subTopicId: 1,
    title: 'Sum Combinations',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Read two numbers a and b. Print (a + b) on the first line and (a * b) on the second line.',
    inputFormat: 'Two integers a and b.',
    outputFormat: 'Line 1: Sum. Line 2: Product.',
    constraints: '-10^4 <= a, b <= 10^4',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        
        System.out.println(a + b);
        System.out.println(a * b);
    }
}`,
    testCases: [
      { id: 1, inputData: '3\n4\n', expectedOutput: '7\n12' },
      { id: 2, inputData: '10\n5\n', expectedOutput: '15\n50' },
    ],
    solved: true,
    bookmarked: false,
  },
  {
    id: 105,
    subTopicId: 1,
    title: 'Dollar to Rupee',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Given an amount in USD (whole dollars), convert it to Indian Rupees (INR) using an exchange rate of 1 USD = 84 INR.',
    inputFormat: 'A single integer representing dollars.',
    outputFormat: 'Print the equivalent amount in INR.',
    constraints: '1 <= dollars <= 10^6',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int dollars = scanner.nextInt();
        
        // 1 USD = 84 INR
        System.out.println(dollars * 84);
    }
}`,
    testCases: [
      { id: 1, inputData: '10\n', expectedOutput: '840' },
      { id: 2, inputData: '100\n', expectedOutput: '8400' },
      { id: 3, inputData: '5\n', expectedOutput: '420', isHidden: true },
    ],
    solved: true,
    bookmarked: false,
  },
  {
    id: 106,
    subTopicId: 1,
    title: 'Rectangle Perimeter',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Given length l and breadth b of a rectangle, compute its perimeter (2 * (l + b)).',
    inputFormat: 'Two integers l and b.',
    outputFormat: 'Print perimeter value.',
    constraints: '1 <= l, b <= 10^5',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int l = scanner.nextInt();
        int b = scanner.nextInt();
        
        System.out.println(2 * (l + b));
    }
}`,
    testCases: [
      { id: 1, inputData: '5\n10\n', expectedOutput: '30' },
      { id: 2, inputData: '7\n3\n', expectedOutput: '20' },
    ],
    solved: true,
    bookmarked: false,
  },

  // --- SUB-TOPIC 2: IF ELSE & CONDITIONALS ---
  {
    id: 201,
    subTopicId: 2,
    title: 'Check Even or Odd',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Given an integer n, print "Even" if it is even, or "Odd" if it is odd.',
    inputFormat: 'Single integer n.',
    outputFormat: 'Print "Even" or "Odd".',
    constraints: '-10^9 <= n <= 10^9',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        
        if (n % 2 == 0) {
            System.out.println("Even");
        } else {
            System.out.println("Odd");
        }
    }
}`,
    testCases: [
      { id: 1, inputData: '4\n', expectedOutput: 'Even' },
      { id: 2, inputData: '7\n', expectedOutput: 'Odd' },
      { id: 3, inputData: '0\n', expectedOutput: 'Even', isHidden: true },
    ],
    solved: true,
    bookmarked: false,
  },
  {
    id: 202,
    subTopicId: 2,
    title: 'Max of Two Numbers',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Given two distinct integers a and b, print the maximum of the two.',
    inputFormat: 'Two integers a and b.',
    outputFormat: 'Print the larger number.',
    constraints: '-10^6 <= a, b <= 10^6',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        
        System.out.println(a > b ? a : b);
    }
}`,
    testCases: [
      { id: 1, inputData: '15\n42\n', expectedOutput: '42' },
      { id: 2, inputData: '99\n-10\n', expectedOutput: '99' },
    ],
    solved: false,
    bookmarked: false,
  },
  {
    id: 203,
    subTopicId: 2,
    title: 'Voting Eligibility',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Given a person\'s age, print "Eligible" if age >= 18, otherwise print "Not Eligible".',
    inputFormat: 'An integer age.',
    outputFormat: '"Eligible" or "Not Eligible".',
    constraints: '1 <= age <= 120',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int age = scanner.nextInt();
        
        if (age >= 18) {
            System.out.println("Eligible");
        } else {
            System.out.println("Not Eligible");
        }
    }
}`,
    testCases: [
      { id: 1, inputData: '18\n', expectedOutput: 'Eligible' },
      { id: 2, inputData: '16\n', expectedOutput: 'Not Eligible' },
      { id: 3, inputData: '65\n', expectedOutput: 'Eligible', isHidden: true },
    ],
    solved: false,
    bookmarked: false,
  },

  // --- SUB-TOPIC 3: LOOPS ---
  {
    id: 301,
    subTopicId: 3,
    title: 'Print 1 to N',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Given a positive integer N, print all numbers from 1 to N on separate lines.',
    inputFormat: 'A single integer N.',
    outputFormat: 'Print 1 to N, each on a new line.',
    constraints: '1 <= N <= 100',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        
        for (int i = 1; i <= n; i++) {
            System.out.println(i);
        }
    }
}`,
    testCases: [
      { id: 1, inputData: '3\n', expectedOutput: '1\n2\n3' },
      { id: 2, inputData: '5\n', expectedOutput: '1\n2\n3\n4\n5' },
    ],
    solved: false,
    bookmarked: false,
  },
  {
    id: 302,
    subTopicId: 3,
    title: 'Factorial of a Number',
    questionType: 'CODING',
    difficulty: 'MEDIUM',
    marks: 10,
    description: 'Given an integer n (0 <= n <= 12), calculate and print n! (factorial of n).',
    inputFormat: 'Integer n.',
    outputFormat: 'Factorial value.',
    constraints: '0 <= n <= 12',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        long fact = 1;
        for (int i = 1; i <= n; i++) {
            fact *= i;
        }
        System.out.println(fact);
    }
}`,
    testCases: [
      { id: 1, inputData: '5\n', expectedOutput: '120' },
      { id: 2, inputData: '0\n', expectedOutput: '1' },
      { id: 3, inputData: '4\n', expectedOutput: '24', isHidden: true },
    ],
    solved: false,
    bookmarked: false,
  },
  {
    id: 303,
    subTopicId: 3,
    title: 'Sum of First N Natural Numbers',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Calculate the sum of first N natural numbers (1 + 2 + ... + N).',
    inputFormat: 'Single integer N.',
    outputFormat: 'Sum of numbers.',
    constraints: '1 <= N <= 10^4',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        long n = scanner.nextLong();
        System.out.println((n * (n + 1)) / 2);
    }
}`,
    testCases: [
      { id: 1, inputData: '10\n', expectedOutput: '55' },
      { id: 2, inputData: '100\n', expectedOutput: '5050' },
    ],
    solved: false,
    bookmarked: false,
  },

  // --- SUB-TOPIC 4: ARRAY TRAVERSAL ---
  {
    id: 401,
    subTopicId: 4,
    title: 'Array Sum',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Given an array of size n, compute the sum of all elements in the array.',
    inputFormat: 'First line contains n. Second line contains n space-separated integers.',
    outputFormat: 'Print total sum.',
    constraints: '1 <= n <= 1000',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int sum = 0;
        for (int i = 0; i < n; i++) {
            sum += scanner.nextInt();
        }
        System.out.println(sum);
    }
}`,
    testCases: [
      { id: 1, inputData: '4\n1 2 3 4\n', expectedOutput: '10' },
      { id: 2, inputData: '3\n10 20 30\n', expectedOutput: '60' },
      { id: 3, inputData: '5\n-5 5 -10 10 0\n', expectedOutput: '0', isHidden: true },
    ],
    solved: false,
    bookmarked: false,
  },
  {
    id: 402,
    subTopicId: 4,
    title: 'Find Maximum in Array',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Find and print the maximum integer in an array of size n.',
    inputFormat: 'First line: n. Second line: n integers.',
    outputFormat: 'Max integer.',
    constraints: '1 <= n <= 10^5',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int max = Integer.MIN_VALUE;
        for (int i = 0; i < n; i++) {
            int val = scanner.nextInt();
            if (val > max) max = val;
        }
        System.out.println(max);
    }
}`,
    testCases: [
      { id: 1, inputData: '5\n3 1 9 4 7\n', expectedOutput: '9' },
      { id: 2, inputData: '3\n-10 -50 -5\n', expectedOutput: '-5' },
    ],
    solved: false,
    bookmarked: false,
  },
  {
    id: 403,
    subTopicId: 4,
    title: 'Search Element in Array',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Given an array of size n and a key k, print the 0-based index of k if found, else print -1.',
    inputFormat: 'Line 1: n. Line 2: n integers. Line 3: target k.',
    outputFormat: 'Index of k or -1.',
    constraints: '1 <= n <= 1000',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = scanner.nextInt();
        int k = scanner.nextInt();
        
        int found = -1;
        for (int i = 0; i < n; i++) {
            if (arr[i] == k) {
                found = i;
                break;
            }
        }
        System.out.println(found);
    }
}`,
    testCases: [
      { id: 1, inputData: '5\n10 20 30 40 50\n30\n', expectedOutput: '2' },
      { id: 2, inputData: '4\n1 2 3 4\n99\n', expectedOutput: '-1' },
    ],
    solved: false,
    bookmarked: false,
  },

  // --- SUB-TOPIC 5: SUB-ARRAY ---
  {
    id: 501,
    subTopicId: 5,
    title: 'Maximum Subarray Sum',
    questionType: 'CODING',
    difficulty: 'MEDIUM',
    marks: 10,
    description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and print its sum (Kadane\'s Algorithm).',
    inputFormat: 'First line contains integer n. Second line contains n space-separated integers.',
    outputFormat: 'Print the maximum subarray sum.',
    constraints: '1 <= n <= 10^5, -10^4 <= nums[i] <= 10^4',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = scanner.nextInt();
        
        long maxSoFar = nums[0];
        long currMax = nums[0];
        for (int i = 1; i < n; i++) {
            currMax = Math.max((long)nums[i], currMax + nums[i]);
            maxSoFar = Math.max(maxSoFar, currMax);
        }
        System.out.println(maxSoFar);
    }
}`,
    testCases: [
      { id: 1, inputData: '5\n-2 1 -3 4 -1\n', expectedOutput: '4' },
      { id: 2, inputData: '4\n1 2 3 4\n', expectedOutput: '10' },
      { id: 3, inputData: '3\n-5 -2 -9\n', expectedOutput: '-2', isHidden: true },
    ],
    solved: false,
    bookmarked: false,
  },

  // --- SUB-TOPIC 6: MULTIPLE ARRAY (2D MATRIX) ---
  {
    id: 601,
    subTopicId: 6,
    title: 'Matrix Diagonal Sum',
    questionType: 'CODING',
    difficulty: 'EASY',
    marks: 10,
    description: 'Given a square matrix of size N x N, calculate the sum of primary and secondary diagonal elements without counting the center element twice.',
    inputFormat: 'First line: N. Next N lines: N space-separated integers each.',
    outputFormat: 'Print total diagonal sum.',
    constraints: '1 <= N <= 100',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int sum = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                int val = scanner.nextInt();
                if (i == j || i + j == n - 1) {
                    sum += val;
                }
            }
        }
        System.out.println(sum);
    }
}`,
    testCases: [
      { id: 1, inputData: '3\n1 2 3\n4 5 6\n7 8 9\n', expectedOutput: '25' },
      { id: 2, inputData: '2\n1 1\n1 1\n', expectedOutput: '4' },
    ],
    solved: false,
    bookmarked: false,
  },
];

class AssignmentStore {
  private topics: Topic[] = [];
  private subTopics: SubTopic[] = [];
  private questions: AssignmentQuestion[] = [];
  private solvedIds: Set<number> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.topics = parsed.topics || DEFAULT_TOPICS;
        this.subTopics = parsed.subTopics || DEFAULT_SUBTOPICS;
        this.questions = parsed.questions || DEFAULT_QUESTIONS;
      } else {
        this.topics = DEFAULT_TOPICS;
        this.subTopics = DEFAULT_SUBTOPICS;
        this.questions = DEFAULT_QUESTIONS;
        this.save();
      }

      const solved = localStorage.getItem(SOLVED_KEY);
      if (solved) {
        this.solvedIds = new Set(JSON.parse(solved));
      } else {
        // Default pre-solved questions
        this.solvedIds = new Set([101, 102, 103, 104, 105, 106, 201]);
      }
    } catch {
      this.topics = DEFAULT_TOPICS;
      this.subTopics = DEFAULT_SUBTOPICS;
      this.questions = DEFAULT_QUESTIONS;
      this.solvedIds = new Set([101, 102, 103, 104, 105, 106, 201]);
    }
    this.recalculateCounts();
  }

  private save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          topics: this.topics,
          subTopics: this.subTopics,
          questions: this.questions,
        })
      );
      localStorage.setItem(SOLVED_KEY, JSON.stringify(Array.from(this.solvedIds)));
    } catch {}
  }

  private recalculateCounts() {
    this.subTopics = this.subTopics.map((st) => {
      const stQuestions = this.questions.filter((q) => q.subTopicId === st.id);
      const solved = stQuestions.filter((q) => this.solvedIds.has(q.id)).length;
      const totalMarks = stQuestions.reduce((acc, q) => acc + (q.marks || 10), 0);
      const marksObtained = stQuestions
        .filter((q) => this.solvedIds.has(q.id))
        .reduce((acc, q) => acc + (q.marks || 10), 0);

      const isCompleted = stQuestions.length > 0 && solved === stQuestions.length;
      const isInProgress = solved > 0 && !isCompleted;

      return {
        ...st,
        questionCount: stQuestions.length,
        solvedCount: solved,
        totalMarks: totalMarks > 0 ? totalMarks : 10,
        marksObtained: marksObtained,
        status: isCompleted ? 'COMPLETED' : isInProgress ? 'IN_PROGRESS' : 'NOT_STARTED',
      };
    });
  }

  public getTopics(assignmentId: number = 1): Topic[] {
    return this.topics.filter((t) => t.assignmentId === assignmentId);
  }

  public getSubTopics(assignmentId: number = 1): SubTopic[] {
    return this.subTopics.filter((st) => st.assignmentId === assignmentId);
  }

  public getSubTopicsByTopic(topicId: number): SubTopic[] {
    return this.subTopics.filter((st) => st.topicId === topicId);
  }

  public getQuestionsBySubTopic(subTopicId: number): AssignmentQuestion[] {
    return this.questions
      .filter((q) => q.subTopicId === subTopicId)
      .map((q) => ({
        ...q,
        solved: this.solvedIds.has(q.id),
      }));
  }

  public getQuestionById(questionId: number): AssignmentQuestion | undefined {
    const q = this.questions.find((x) => x.id === questionId);
    if (!q) return undefined;
    return {
      ...q,
      solved: this.solvedIds.has(q.id),
    };
  }

  public addTopic(title: string, description: string = '', assignmentId: number = 1): Topic {
    const newId = Date.now();
    const newTopic: Topic = {
      id: newId,
      assignmentId,
      title: title.trim(),
      description: description.trim() || `Topic covering ${title}`,
      orderIndex: this.topics.length + 1,
    };
    this.topics.push(newTopic);
    this.save();
    return newTopic;
  }

  public addSubTopic(
    title: string,
    description: string = '',
    assignmentId: number = 1,
    topicId?: number
  ): SubTopic {
    const newId = Date.now();
    const nextNumber = this.subTopics.length + 1;
    const targetTopicId = topicId || (this.topics[0]?.id || 1);

    const newSubTopic: SubTopic = {
      id: newId,
      topicId: targetTopicId,
      assignmentId,
      sectionNumber: nextNumber,
      title: title.trim(),
      description: description.trim() || `Exercises on ${title}`,
      questionCount: 0,
      solvedCount: 0,
      totalMarks: 0,
      marksObtained: 0,
      locked: false,
      status: 'NOT_STARTED',
    };

    this.subTopics.push(newSubTopic);
    this.recalculateCounts();
    this.save();
    return newSubTopic;
  }

  public addQuestion(payload: {
    subTopicId: number;
    title: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    marks: number;
    description: string;
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    starterCodeJava?: string;
    testCases: TestCase[];
  }): AssignmentQuestion {
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    const defaultStarter = `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Write your solution here
        
    }
}`;

    const newQuestion: AssignmentQuestion = {
      id: newId,
      subTopicId: payload.subTopicId,
      title: payload.title.trim(),
      questionType: 'CODING',
      difficulty: payload.difficulty,
      marks: payload.marks || 10,
      description: payload.description.trim(),
      inputFormat: payload.inputFormat?.trim() || 'Standard input integers/strings',
      outputFormat: payload.outputFormat?.trim() || 'Standard output result',
      constraints: payload.constraints?.trim() || '1 <= n <= 10^5',
      starterCodeJava: payload.starterCodeJava?.trim() || defaultStarter,
      testCases: payload.testCases && payload.testCases.length > 0 ? payload.testCases : [
        { id: 1, inputData: '5\n', expectedOutput: '5' }
      ],
      solved: false,
      bookmarked: false,
    };

    this.questions.push(newQuestion);
    this.recalculateCounts();
    this.save();
    return newQuestion;
  }

  public addMultipleQuestions(questions: Array<{
    subTopicId: number;
    title: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    marks: number;
    description: string;
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    starterCodeJava?: string;
    testCases: TestCase[];
  }>): AssignmentQuestion[] {
    const created: AssignmentQuestion[] = [];
    for (const q of questions) {
      created.push(this.addQuestion(q));
    }
    return created;
  }

  public markSolved(questionId: number) {
    this.solvedIds.add(questionId);
    this.recalculateCounts();
    this.save();
  }

  public toggleBookmark(questionId: number): boolean {
    const q = this.questions.find((x) => x.id === questionId);
    if (q) {
      q.bookmarked = !q.bookmarked;
      this.save();
      return q.bookmarked;
    }
    return false;
  }
}

export const assignmentStore = new AssignmentStore();
