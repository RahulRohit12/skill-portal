// Real OpenJDK Online Java Compiler Service
// Uses high-speed Wandbox OpenJDK 21 execution engine

export interface TestCaseItem {
  id?: number | string;
  inputData: string;
  expectedOutput: string;
  isHidden?: boolean;
  explanation?: string;
}

export interface SingleRunResult {
  success: boolean;
  stdout: string;
  stderr: string;
  compileError?: string;
  runtimeMs: number;
  exitCode: number;
}

export interface TestCaseEvaluation {
  testCaseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isHidden: boolean;
  runtimeMs: number;
  error?: string;
}

export interface EvaluationResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR';
  passedTestCases: number;
  totalTestCases: number;
  marksAwarded: number;
  totalMarks: number;
  compileOutput?: string;
  runtimeMs: number;
  testCaseResults: TestCaseEvaluation[];
}

/**
 * Sanitizes Java code so that public classes don't conflict with single-file compilation
 */
function prepareJavaCode(rawCode: string): string {
  let code = rawCode.trim();
  // Strip package declaration which causes file location issues in online single-file compiler
  code = code.replace(/^\s*package\s+[^;]+;\s*/gm, '');
  // Wandbox compiles code in prog.java, so top-level classes cannot be public unless named prog.
  // Strip 'public' keyword before 'class' so class Main, class Solution, etc. compile cleanly.
  code = code.replace(/\bpublic\s+class\s+/g, 'class ');
  return code;
}

/**
 * Executes a single run of Java code with given stdin input via Wandbox OpenJDK 21
 */
export async function executeJavaCode(code: string, stdin: string): Promise<SingleRunResult> {
  const startTime = Date.now();
  const sanitizedCode = prepareJavaCode(code);

  try {
    const res = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        compiler: 'openjdk-jdk-21+35',
        code: sanitizedCode,
        stdin: stdin || '',
      }),
    });

    if (!res.ok) {
      throw new Error(`Compiler service returned status: ${res.status}`);
    }

    const data = await res.json();
    const runtimeMs = Date.now() - startTime;

    // Check for compilation errors
    const compileError = data.compiler_error || data.compiler_message || '';
    if (data.status !== '0' && compileError && !data.program_output) {
      return {
        success: false,
        stdout: '',
        stderr: compileError,
        compileError: compileError.trim(),
        runtimeMs,
        exitCode: Number(data.status) || 1,
      };
    }

    // Check for runtime errors
    const stderr = data.program_error || '';
    const stdout = data.program_output || '';

    return {
      success: data.status === '0',
      stdout: stdout,
      stderr: stderr,
      compileError: data.status !== '0' ? compileError || stderr : undefined,
      runtimeMs,
      exitCode: Number(data.status) || 0,
    };
  } catch (err: any) {
    // Fallback: If network is offline, provide graceful offline feedback
    console.warn('Wandbox network error, falling back:', err);
    return {
      success: false,
      stdout: '',
      stderr: err.message || 'Execution failed due to network connectivity.',
      compileError: 'Compiler connection error: Please check your internet connection.',
      runtimeMs: Date.now() - startTime,
      exitCode: 1,
    };
  }
}

/**
 * Evaluates Java code against multiple test cases and produces an ACCEPTED/WRONG_ANSWER grade
 */
export async function evaluateAllTestCases(
  code: string,
  testCases: TestCaseItem[],
  maxMarks: number = 10
): Promise<EvaluationResult> {
  const startTime = Date.now();
  const results: TestCaseEvaluation[] = [];
  let passedCount = 0;
  let hasCompileError = false;
  let firstCompileOutput = '';

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const execRes = await executeJavaCode(code, tc.inputData);

    if (execRes.compileError && !execRes.stdout) {
      hasCompileError = true;
      firstCompileOutput = execRes.compileError;
      results.push({
        testCaseIndex: i + 1,
        input: tc.isHidden ? '[Hidden Test Case]' : tc.inputData,
        expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
        actualOutput: 'Compilation Error',
        passed: false,
        isHidden: !!tc.isHidden,
        runtimeMs: execRes.runtimeMs,
        error: execRes.compileError,
      });
      break;
    }

    const actual = (execRes.stdout || '').trim();
    const expected = (tc.expectedOutput || '').trim();
    const isPassed = execRes.success && actual === expected;

    if (isPassed) {
      passedCount++;
    }

    results.push({
      testCaseIndex: i + 1,
      input: tc.isHidden ? '[Hidden Test Case]' : tc.inputData,
      expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
      actualOutput: tc.isHidden ? (isPassed ? '[Hidden - Passed]' : '[Hidden - Failed]') : actual,
      passed: isPassed,
      isHidden: !!tc.isHidden,
      runtimeMs: execRes.runtimeMs,
      error: execRes.stderr || undefined,
    });
  }

  const totalRuntimeMs = Date.now() - startTime;
  const totalCount = testCases.length;

  if (hasCompileError) {
    return {
      status: 'COMPILATION_ERROR',
      passedTestCases: 0,
      totalTestCases: totalCount,
      marksAwarded: 0,
      totalMarks: maxMarks,
      compileOutput: firstCompileOutput,
      runtimeMs: totalRuntimeMs,
      testCaseResults: results,
    };
  }

  const isAccepted = passedCount === totalCount && totalCount > 0;
  const marksAwarded = totalCount > 0 ? Math.round((passedCount / totalCount) * maxMarks) : 0;

  return {
    status: isAccepted ? 'ACCEPTED' : 'WRONG_ANSWER',
    passedTestCases: passedCount,
    totalTestCases: totalCount,
    marksAwarded: marksAwarded,
    totalMarks: maxMarks,
    runtimeMs: totalRuntimeMs,
    testCaseResults: results,
  };
}
