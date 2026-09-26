import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import {
  Code2,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  History,
  Terminal,
  FileCode,
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Settings,
  Sun,
  Moon,
  Bot,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import { CodingProblemDetail, RunCodeResult, SubmitCodeResult } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { assignmentStore, AssignmentQuestion } from '../services/assignmentStore';
import { executeJavaCode, evaluateAllTestCases, TestCaseItem } from '../services/compilerService';

export const CodingWorkspacePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const problemId = Number(searchParams.get('problemId')) || 1;
  const questionId = Number(searchParams.get('questionId')) || 101;
  const assignmentId = searchParams.get('assignmentId') ? Number(searchParams.get('assignmentId')) : null;

  const [problem, setProblem] = useState<CodingProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'history'>('description');
  const [history, setHistory] = useState<any[]>([]);

  // Editor State
  const [language, setLanguage] = useState<'java' | 'python' | 'javascript'>('java');
  const [code, setCode] = useState<string>('');
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');

  // Execution State
  const [activeConsoleTab, setActiveConsoleTab] = useState<'sample' | 'cases' | 'custom' | 'result'>('sample');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<RunCodeResult | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitCodeResult | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  // Fallback problem details
  const fallbackProblem: CodingProblemDetail = {
    id: 101,
    title: 'Add 2 Integers',
    slug: 'add-2-integers',
    description: 'Write a Java program to read two integers m and n from standard input and print their sum.',
    inputFormat: 'First line contains integer m. Second line contains integer n.',
    outputFormat: 'Print the sum of both the integers m and n.',
    constraints: '-10^9 <= m, n <= 10^9',
    difficulty: 'EASY',
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int m = scanner.nextInt();
        int n = scanner.nextInt();
        
        // Print sum of m and n
        System.out.println(m + n);
    }
}`,
    starterCodePython: `import sys\nlines = sys.stdin.read().split()\nif len(lines) >= 2:\n    print(int(lines[0]) + int(lines[1]))`,
    starterCodeJs: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    console.log(parseInt(input[0]) + parseInt(input[1]));\n}`,
    sampleTestCases: [
      { id: 1, orderIndex: 1, inputData: '5\n10\n', expectedOutput: '15', explanation: '5 + 10 = 15' },
      { id: 2, orderIndex: 2, inputData: '20\n30\n', expectedOutput: '50', explanation: '20 + 30 = 50' },
    ],
  };

  useEffect(() => {
    setLoading(true);
    setRunResult(null);
    setSubmitResult(null);

    // 1. Check local assignmentStore first for real question with test cases
    const storeQ = assignmentStore.getQuestionById(questionId);
    if (storeQ) {
      setProblem({
        id: storeQ.id,
        title: storeQ.title,
        slug: storeQ.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: storeQ.description,
        inputFormat: storeQ.inputFormat,
        outputFormat: storeQ.outputFormat,
        constraints: storeQ.constraints,
        difficulty: storeQ.difficulty,
        timeLimitMs: 2000,
        memoryLimitMb: 256,
        starterCodeJava: storeQ.starterCodeJava,
        starterCodePython: '# Java compiler enabled for this problem',
        starterCodeJs: '// Java compiler enabled for this problem',
        sampleTestCases: storeQ.testCases.map((tc, idx) => ({
          id: tc.id || idx + 1,
          orderIndex: idx + 1,
          inputData: tc.inputData,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation || `Test case ${idx + 1}`,
        })),
      });
      setCode(storeQ.starterCodeJava || '');
      setBookmarked(storeQ.bookmarked || false);
      setSelectedCaseIdx(0);
      setLoading(false);
      return;
    }

    // 2. Fallback to API if not in assignmentStore
    api.get(`/questions/${questionId}`)
      .then((res) => {
        const p = res.data.data.codingProblem;
        if (p) {
          setProblem(p);
          setCode(p.starterCodeJava || fallbackProblem.starterCodeJava || '');
        } else {
          setProblem(fallbackProblem);
          setCode(fallbackProblem.starterCodeJava || '');
        }
      })
      .catch((err) => {
        console.warn('Using fallback problem', err);
        setProblem(fallbackProblem);
        setCode(fallbackProblem.starterCodeJava || '');
      })
      .finally(() => setLoading(false));

    loadHistory();
  }, [questionId]);

  const loadHistory = () => {
    api.get(`/coding/questions/${questionId}/submissions`)
      .then((res) => setHistory(res.data.data || []))
      .catch(() => {});
  };

  const handleLanguageChange = (newLang: 'java' | 'python' | 'javascript') => {
    setLanguage(newLang);
    const p = problem || fallbackProblem;
    if (newLang === 'java') setCode(p.starterCodeJava || '');
    if (newLang === 'python') setCode(p.starterCodePython || '');
    if (newLang === 'javascript') setCode(p.starterCodeJs || '');
  };

  const resetCode = () => {
    const storeQ = assignmentStore.getQuestionById(questionId);
    if (storeQ) {
      setCode(storeQ.starterCodeJava || '');
    } else {
      handleLanguageChange(language);
    }
  };

  // Real Java Online Compilation via Wandbox OpenJDK 21
  const handleRunCode = async () => {
    setRunning(true);
    setActiveConsoleTab('result');
    setSubmitResult(null);

    try {
      let stdin = '';
      let expected = '';
      if (activeConsoleTab === 'custom') {
        stdin = customInput;
      } else {
        const selected = sampleCases[selectedCaseIdx];
        stdin = selected?.inputData || '';
        expected = selected?.expectedOutput || '';
      }

      // Execute with real Wandbox OpenJDK 21 compiler
      const res = await executeJavaCode(code, stdin);

      const actualTrimmed = (res.stdout || '').trim();
      const expectedTrimmed = (expected || '').trim();
      const isMatch =
        activeConsoleTab === 'custom'
          ? res.success
          : res.success && (!expectedTrimmed || actualTrimmed === expectedTrimmed);

      const runStatus =
        res.compileError && !res.stdout
          ? 'COMPILATION_ERROR'
          : isMatch
          ? 'ACCEPTED'
          : 'WRONG_ANSWER';

      setRunResult({
        status: runStatus,
        passedCount: isMatch ? 1 : 0,
        totalCount: 1,
        runtimeMs: res.runtimeMs,
        memoryKb: 256,
        compileOutput: res.compileError || (res.stderr && !res.stdout ? res.stderr : undefined),
        testCaseResults: [
          {
            testCaseId: selectedCaseIdx + 1,
            passed: isMatch,
            input: stdin,
            expectedOutput: expectedTrimmed || '(Custom Run Output)',
            actualOutput: res.stdout || res.stderr || '(No output returned)',
            runtimeMs: res.runtimeMs,
            hidden: false,
          },
        ],
      });
    } catch (err: any) {
      setRunResult({
        status: 'EXECUTION_ERROR',
        passedCount: 0,
        totalCount: 0,
        runtimeMs: 0,
        memoryKb: 0,
        compileOutput: err.message || 'Execution error encountered.',
      });
    } finally {
      setRunning(false);
    }
  };

  // Real Multi-Case Test Suite Evaluation via Wandbox OpenJDK 21
  const handleSubmitCode = async () => {
    setSubmitting(true);
    setActiveConsoleTab('result');
    setRunResult(null);

    try {
      const q = assignmentStore.getQuestionById(questionId);
      const testCasesToEvaluate: TestCaseItem[] =
        q?.testCases?.map((tc) => ({
          id: tc.id,
          inputData: tc.inputData,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          explanation: tc.explanation,
        })) ||
        activeProblem.sampleTestCases?.map((tc) => ({
          id: tc.id,
          inputData: tc.inputData,
          expectedOutput: tc.expectedOutput,
          isHidden: false,
        })) || [
          { inputData: '5\n10\n', expectedOutput: '15' },
        ];

      const maxMarks = q?.marks || 10;
      const evalRes = await evaluateAllTestCases(code, testCasesToEvaluate, maxMarks);

      const submitData: SubmitCodeResult = {
        submissionId: Date.now(),
        status: evalRes.status,
        passedTestCases: evalRes.passedTestCases,
        totalTestCases: evalRes.totalTestCases,
        runtimeMs: evalRes.runtimeMs,
        memoryKb: 256,
        marksAwarded: evalRes.marksAwarded,
        compileOutput: evalRes.compileOutput,
        testCaseResults: evalRes.testCaseResults.map((tc) => ({
          testCaseId: tc.testCaseIndex,
          passed: tc.passed,
          input: tc.input,
          hidden: tc.isHidden,
          runtimeMs: tc.runtimeMs,
          actualOutput: tc.actualOutput,
          expectedOutput: tc.expectedOutput,
        })),
      };

      setSubmitResult(submitData);

      if (evalRes.status === 'ACCEPTED') {
        assignmentStore.markSolved(questionId);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }

      // Add to local history list
      setHistory((prev) => [
        {
          id: Date.now(),
          status: evalRes.status,
          language: 'JAVA (OpenJDK 21)',
          passedCases: evalRes.passedTestCases,
          totalCases: evalRes.totalTestCases,
          runtimeMs: evalRes.runtimeMs,
          submittedAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      // Async log to backend if reachable
      api.post('/coding/submissions', {
        problemId: problem?.id || problemId,
        questionId: questionId,
        language: 'JAVA',
        code: code,
        assignmentId: assignmentId,
      }).catch(() => {});

    } catch (err: any) {
      setSubmitResult({
        submissionId: 0,
        status: 'EVALUATION_ERROR',
        passedTestCases: 0,
        totalTestCases: 0,
        runtimeMs: 0,
        memoryKb: 0,
        marksAwarded: 0,
        compileOutput: err.message || 'Submission failed to grade.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const activeProblem = problem || fallbackProblem;
  const sampleCases = activeProblem.sampleTestCases || [
    { id: 1, inputData: '5\n10\n', expectedOutput: '15' },
    { id: 2, inputData: '20\n30\n', expectedOutput: '50' },
  ];

  // Prev / Next Question Navigation
  const currentSubTopicId = assignmentStore.getQuestionById(questionId)?.subTopicId || 1;
  const subTopicQuestions = assignmentStore.getQuestionsBySubTopic(currentSubTopicId);
  const currentIdx = subTopicQuestions.findIndex((q) => q.id === questionId);
  const prevQuestion = currentIdx > 0 ? subTopicQuestions[currentIdx - 1] : null;
  const nextQuestion =
    currentIdx >= 0 && currentIdx < subTopicQuestions.length - 1
      ? subTopicQuestions[currentIdx + 1]
      : null;

  const handleToggleBookmark = () => {
    const newState = assignmentStore.toggleBookmark(questionId);
    setBookmarked(newState);
  };

  if (loading) return <LoadingSpinner fullPage message="Spinning up Monaco execution environment..." />;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-4 sm:-m-6 lg:-m-8 bg-[#090b0e] text-slate-200 overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-12 border-b border-[#1f2430] bg-[#0c0e12] px-4 flex items-center justify-between shrink-0 select-none">
        {/* Left: Back Arrow + Title + EASY Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(assignmentId ? `/assignments/${assignmentId}` : '/assignments')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#181c26] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="font-bold text-sm text-white">{activeProblem.title}</span>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 uppercase tracking-wider">
            {activeProblem.difficulty || 'EASY'}
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950/60 text-[#38bdf8] border border-sky-800/50">
            <Cpu className="w-3 h-3" /> OpenJDK 21
          </span>
        </div>

        {/* Right: Bookmark + Prev / Next */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarked ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400 hover:text-white hover:bg-[#181c26]'
            }`}
            title="Bookmark"
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>

          <button
            disabled={!prevQuestion}
            onClick={() => {
              if (prevQuestion) {
                navigate(`/coding?questionId=${prevQuestion.id}&assignmentId=${assignmentId || 1}`);
              }
            }}
            className="px-3 py-1 bg-[#141822] hover:bg-[#1a202c] border border-[#232a3b] text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <button
            disabled={!nextQuestion}
            onClick={() => {
              if (nextQuestion) {
                navigate(`/coding?questionId=${nextQuestion.id}&assignmentId=${assignmentId || 1}`);
              }
            }}
            className="px-3.5 py-1 bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-md shadow-cyan-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Split Body: Left Description Pane & Right Editor + Console */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Description / Submissions */}
        <div className="w-[45%] border-r border-[#1f2430] flex flex-col bg-[#0c0e12] overflow-hidden">
          {/* Left Tabs Bar */}
          <div className="h-10 border-b border-[#1f2430] px-4 flex items-center justify-between bg-[#0a0c10] shrink-0">
            <div className="flex items-center gap-4 h-full">
              <button
                onClick={() => setActiveLeftTab('description')}
                className={`text-xs font-semibold h-full border-b-2 flex items-center gap-1.5 px-1 transition-all ${
                  activeLeftTab === 'description'
                    ? 'border-[#00c2ff] text-[#00c2ff]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Description</span>
              </button>

              <button
                onClick={() => setActiveLeftTab('history')}
                className={`text-xs font-semibold h-full border-b-2 flex items-center gap-1.5 px-1 transition-all ${
                  activeLeftTab === 'history'
                    ? 'border-[#00c2ff] text-[#00c2ff]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Submissions</span>
                <span className="text-[10px] bg-[#181c26] text-slate-400 px-1.5 py-0.2 rounded-full">
                  {history.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="w-6 h-6 rounded-lg bg-[#00c2ff]/10 hover:bg-[#00c2ff]/20 text-[#00c2ff] flex items-center justify-center transition-colors"
                title="AI Coding Assistant"
              >
                <Bot className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Left Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-300">
            {activeLeftTab === 'description' ? (
              <>
                <p className="text-sm leading-relaxed text-slate-200">
                  {activeProblem.description}
                </p>

                {/* Input Format */}
                {activeProblem.inputFormat && (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-xs text-white">Input Format</h4>
                    <p className="text-slate-400 leading-relaxed">{activeProblem.inputFormat}</p>
                  </div>
                )}

                {/* Output Format */}
                {activeProblem.outputFormat && (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-xs text-white">Output Format</h4>
                    <p className="text-slate-400 leading-relaxed">{activeProblem.outputFormat}</p>
                  </div>
                )}

                {/* Constraints */}
                {activeProblem.constraints && (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-xs text-white">Constraints</h4>
                    <pre className="bg-[#090b0e] border border-[#1f2430] rounded-xl p-2.5 font-mono text-[11px] text-amber-300">
                      {activeProblem.constraints}
                    </pre>
                  </div>
                )}

                {/* Sample Cases */}
                {sampleCases.map((sc, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="font-bold text-xs text-white">Sample Case {idx + 1}</h4>
                    <div>
                      <span className="text-slate-400 block mb-1">Input:</span>
                      <pre className="bg-[#090b0e] border border-[#1f2430] rounded-xl p-3 font-mono text-xs text-slate-200">
                        {sc.inputData}
                      </pre>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Expected Output:</span>
                      <pre className="bg-[#090b0e] border border-[#1f2430] rounded-xl p-3 font-mono text-xs text-emerald-400">
                        {sc.expectedOutput}
                      </pre>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              /* Submissions History */
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No submissions recorded yet. Submit your code to earn score points!
                  </div>
                ) : (
                  history.map((h) => (
                    <div
                      key={h.id}
                      className="p-3.5 rounded-xl bg-[#090b0e] border border-[#1f2430] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-bold text-xs flex items-center gap-1 ${
                              h.status === 'ACCEPTED' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {h.status === 'ACCEPTED' ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            {h.status}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            {h.language}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {h.passedCases}/{h.totalCases} passed • {h.runtimeMs}ms
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(h.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Bottom Console Pane */}
        <div className="w-[55%] flex flex-col bg-[#0c0e12] overflow-hidden">
          {/* Editor Header Toolbar */}
          <div className="h-10 border-b border-[#1f2430] px-4 flex items-center justify-between bg-[#0a0c10] shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#00c2ff]" />
              <span className="text-xs font-bold text-white">Java Code (OpenJDK 21)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={resetCode}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181c26] transition-colors"
                title="Reset starter template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181c26] transition-colors"
                title="Toggle Theme"
              >
                {editorTheme === 'vs-dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative min-h-[220px]">
            <Editor
              height="100%"
              language="java"
              theme={editorTheme}
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                automaticLayout: true,
                tabSize: 4,
              }}
            />

            {/* Floating Action Buttons: Run & Submit */}
            <div className="absolute bottom-3 right-4 z-10 flex items-center gap-2">
              <button
                disabled={running || submitting}
                onClick={handleRunCode}
                className="px-5 py-1.5 rounded-lg bg-[#00c853] hover:bg-[#00b248] text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{running ? 'Compiling & Running...' : 'Run'}</span>
              </button>

              <button
                disabled={running || submitting}
                onClick={handleSubmitCode}
                className="px-5 py-1.5 rounded-lg bg-[#ff9100] hover:bg-[#f57c00] text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>{submitting ? 'Evaluating Test Cases...' : 'Submit'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Execution & Test Cases Drawer */}
          <div className="h-60 border-t border-[#1f2430] bg-[#090b0e] flex flex-col shrink-0">
            {/* Console Drawer Tabs */}
            <div className="h-9 border-b border-[#1f2430] px-4 flex items-center justify-between bg-[#0a0c10] shrink-0">
              <div className="flex items-center gap-5 h-full">
                <button
                  onClick={() => setActiveConsoleTab('sample')}
                  className={`text-xs font-semibold h-full border-b-2 flex items-center gap-1.5 px-1 transition-all ${
                    activeConsoleTab === 'sample'
                      ? 'border-[#00c2ff] text-[#00c2ff]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-emerald-400">✓</span>
                  <span>Sample Cases</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab('cases')}
                  className={`text-xs font-semibold h-full border-b-2 flex items-center gap-1.5 px-1 transition-all ${
                    activeConsoleTab === 'cases'
                      ? 'border-[#00c2ff] text-[#00c2ff]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <span>:: All Cases</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab('custom')}
                  className={`text-xs font-semibold h-full border-b-2 flex items-center gap-1.5 px-1 transition-all ${
                    activeConsoleTab === 'custom'
                      ? 'border-[#00c2ff] text-[#00c2ff]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <span>▶ Custom STDIN</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab('result')}
                  className={`text-xs font-semibold h-full border-b-2 flex items-center gap-1.5 px-1 transition-all ${
                    activeConsoleTab === 'result'
                      ? 'border-[#00c2ff] text-[#00c2ff]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <span>&gt;_ Output Results</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">Wandbox OpenJDK 21</span>
              </div>
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeConsoleTab === 'sample' && (
                <div className="space-y-3">
                  {/* Case selector pills */}
                  <div className="flex items-center gap-2">
                    {sampleCases.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedCaseIdx(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selectedCaseIdx === idx
                            ? 'bg-[#181c26] text-white border border-[#2b354c] shadow-sm'
                            : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Input & Output */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        INPUT
                      </label>
                      <pre className="bg-[#0c0e12] border border-[#1f2430] rounded-xl p-2.5 font-mono text-xs text-slate-200">
                        {sampleCases[selectedCaseIdx]?.inputData || ''}
                      </pre>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        EXPECTED OUTPUT
                      </label>
                      <pre className="bg-[#0c0e12] border border-[#1f2430] rounded-xl p-2.5 font-mono text-xs text-emerald-400">
                        {sampleCases[selectedCaseIdx]?.expectedOutput || ''}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeConsoleTab === 'cases' && (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-500">Test cases configured for this coding challenge:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sampleCases.map((tc, idx) => (
                      <div key={idx} className="p-3 bg-[#0c0e12] border border-[#1f2430] rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400">Test Case {idx + 1}</span>
                        <p className="text-slate-200 font-mono mt-1 text-[11px]">Input: {tc.inputData.replace(/\n/g, ' ')}</p>
                        <p className="text-emerald-400 font-mono text-[11px]">Expected: {tc.expectedOutput.replace(/\n/g, ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeConsoleTab === 'custom' && (
                <div className="h-full flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    CUSTOM STDIN INPUT
                  </label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Provide custom input arguments to feed into Scanner (System.in)..."
                    className="flex-1 w-full bg-[#0c0e12] border border-[#1f2430] rounded-xl p-3 font-mono text-xs text-slate-200 outline-none resize-none focus:border-[#00c2ff]"
                  />
                </div>
              )}

              {activeConsoleTab === 'result' && (
                <div>
                  {runResult && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-xs px-2.5 py-0.5 rounded-full ${
                            runResult.status === 'ACCEPTED'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {runResult.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {runResult.runtimeMs} ms runtime
                        </span>
                      </div>

                      {runResult.compileOutput && (
                        <pre className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-rose-300 text-[11px] whitespace-pre-wrap font-mono">
                          {runResult.compileOutput}
                        </pre>
                      )}

                      {runResult.testCaseResults && (
                        <div className="space-y-2">
                          {runResult.testCaseResults.map((tc, idx) => (
                            <div
                              key={tc.testCaseId || idx}
                              className={`p-3 rounded-xl border ${
                                tc.passed
                                  ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                                  : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs">
                                  {tc.passed ? 'PASSED ✓' : 'FAILED ✗'}
                                </span>
                                <span className="text-[10px] text-slate-500">{tc.runtimeMs} ms</span>
                              </div>
                              <p className="text-[11px] font-mono">Expected: {tc.expectedOutput}</p>
                              <p className="text-[11px] font-mono mt-0.5">Actual: {tc.actualOutput}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {submitResult && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-xs px-2.5 py-0.5 rounded-full ${
                            submitResult.status === 'ACCEPTED'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {submitResult.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {submitResult.passedTestCases}/{submitResult.totalTestCases} Tests Passed • +
                          {submitResult.marksAwarded} Marks Awarded
                        </span>
                      </div>

                      {submitResult.compileOutput && (
                        <pre className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-rose-300 text-[11px] whitespace-pre-wrap font-mono">
                          {submitResult.compileOutput}
                        </pre>
                      )}

                      {submitResult.testCaseResults && (
                        <div className="grid grid-cols-2 gap-2">
                          {submitResult.testCaseResults.map((tc, idx) => (
                            <div
                              key={tc.testCaseId || idx}
                              className={`p-2.5 rounded-xl border text-[11px] ${
                                tc.passed
                                  ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                                  : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold">Test Case {idx + 1} {tc.hidden && '(Hidden)'}</span>
                                <span>{tc.passed ? '✓ PASSED' : '✗ FAILED'}</span>
                              </div>
                              {!tc.hidden && tc.actualOutput && (
                                <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">
                                  Output: {tc.actualOutput}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!runResult && !submitResult && !running && !submitting && (
                    <div className="text-slate-500 text-center py-6 text-xs">
                      No execution output yet. Click "Run" to test your solution, or "Submit" to grade all test cases.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
