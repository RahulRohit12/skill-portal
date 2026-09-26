import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Code2,
  CheckCircle2,
  FolderPlus,
  FileQuestion,
  Lightbulb
} from 'lucide-react';
import { assignmentStore, SubTopic, AssignmentQuestion } from '../../services/assignmentStore';
import api from '../../api/client';

interface AddQuestionModalProps {
  subTopics: SubTopic[];
  activeSubTopicId: number;
  assignmentId: number;
  onClose: () => void;
  onQuestionAdded: (question: AssignmentQuestion) => void;
  onSubTopicAdded: (newSubTopic: SubTopic) => void;
}

const TEMPLATES = [
  {
    name: 'Check Prime Number',
    difficulty: 'MEDIUM' as const,
    marks: 10,
    title: 'Check Prime Number',
    description: 'Write a Java program to check whether a given integer N is a prime number. Print "Prime" if it is prime, otherwise print "Not Prime".',
    inputFormat: 'A single integer N.',
    outputFormat: 'Print "Prime" or "Not Prime".',
    constraints: '1 <= N <= 10^5',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        
        if (n <= 1) {
            System.out.println("Not Prime");
            return;
        }
        
        boolean isPrime = true;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                isPrime = false;
                break;
            }
        }
        
        if (isPrime) {
            System.out.println("Prime");
        } else {
            System.out.println("Not Prime");
        }
    }
}`,
    testCases: [
      { id: 1, inputData: '7\n', expectedOutput: 'Prime' },
      { id: 2, inputData: '12\n', expectedOutput: 'Not Prime' },
      { id: 3, inputData: '2\n', expectedOutput: 'Prime', isHidden: true },
      { id: 4, inputData: '1\n', expectedOutput: 'Not Prime', isHidden: true },
    ]
  },
  {
    name: 'Reverse a String',
    difficulty: 'EASY' as const,
    marks: 10,
    title: 'Reverse a String',
    description: 'Given a single word string S, reverse the characters and print the resulting string.',
    inputFormat: 'Single string S without whitespace.',
    outputFormat: 'Print the reversed string.',
    constraints: '1 <= |S| <= 1000',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String s = scanner.next();
        
        StringBuilder sb = new StringBuilder(s);
        System.out.println(sb.reverse().toString());
    }
}`,
    testCases: [
      { id: 1, inputData: 'hello\n', expectedOutput: 'olleh' },
      { id: 2, inputData: 'skillx\n', expectedOutput: 'xlliks' },
      { id: 3, inputData: 'radar\n', expectedOutput: 'radar', isHidden: true },
    ]
  },
  {
    name: 'Count Vowels',
    difficulty: 'EASY' as const,
    marks: 10,
    title: 'Count Vowels in String',
    description: 'Read a string from input and count total vowels (a, e, i, o, u in lowercase). Print total vowel count.',
    inputFormat: 'Single lowercase word string S.',
    outputFormat: 'Print the integer count of vowels.',
    constraints: '1 <= |S| <= 1000',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String s = scanner.next().toLowerCase();
        
        int count = 0;
        for (char c : s.toCharArray()) {
            if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
                count++;
            }
        }
        System.out.println(count);
    }
}`,
    testCases: [
      { id: 1, inputData: 'programming\n', expectedOutput: '3' },
      { id: 2, inputData: 'aeiou\n', expectedOutput: '5' },
      { id: 3, inputData: 'rhythm\n', expectedOutput: '0', isHidden: true },
    ]
  },
  {
    name: 'Multiplication Table',
    difficulty: 'EASY' as const,
    marks: 10,
    title: 'First 5 Multiples',
    description: 'Given an integer N, print its first 5 multiples (N*1, N*2, N*3, N*4, N*5) on separate lines.',
    inputFormat: 'Single integer N.',
    outputFormat: '5 lines showing each multiple.',
    constraints: '1 <= N <= 100',
    starterCodeJava: `import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        for (int i = 1; i <= 5; i++) {
            System.out.println(n * i);
        }
    }
}`,
    testCases: [
      { id: 1, inputData: '3\n', expectedOutput: '3\n6\n9\n12\n15' },
      { id: 2, inputData: '10\n', expectedOutput: '10\n20\n30\n40\n50' },
    ]
  }
];

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  subTopics,
  activeSubTopicId,
  assignmentId,
  onClose,
  onQuestionAdded,
  onSubTopicAdded,
}) => {
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<number>(activeSubTopicId || subTopics[0]?.id || 1);
  const [isCreatingSubTopic, setIsCreatingSubTopic] = useState(false);
  const [newSubTopicTitle, setNewSubTopicTitle] = useState('');
  const [newSubTopicDesc, setNewSubTopicDesc] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [marks, setMarks] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [inputFormat, setInputFormat] = useState('First line contains an integer N');
  const [outputFormat, setOutputFormat] = useState('Print the resulting output');
  const [constraints, setConstraints] = useState('1 <= N <= 10^5');
  const [starterCodeJava, setStarterCodeJava] = useState(`import java.util.Scanner;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Write your solution here
        
    }
}`);

  const [testCases, setTestCases] = useState<
    Array<{ id: number; inputData: string; expectedOutput: string; isHidden?: boolean }>
  >([
    { id: 1, inputData: '5\n', expectedOutput: '5', isHidden: false },
    { id: 2, inputData: '10\n', expectedOutput: '10', isHidden: true },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const applyTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setTitle(tpl.title);
    setDifficulty(tpl.difficulty);
    setMarks(tpl.marks);
    setDescription(tpl.description);
    setInputFormat(tpl.inputFormat);
    setOutputFormat(tpl.outputFormat);
    setConstraints(tpl.constraints);
    setStarterCodeJava(tpl.starterCodeJava);
    setTestCases(tpl.testCases);
    setErrorMsg(null);
  };

  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      { id: Date.now(), inputData: '', expectedOutput: '', isHidden: false },
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    if (testCases.length <= 1) {
      setErrorMsg('At least one test case is required.');
      return;
    }
    setTestCases(testCases.filter((_, idx) => idx !== index));
  };

  const updateTestCase = (
    index: number,
    field: 'inputData' | 'expectedOutput' | 'isHidden',
    value: any
  ) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  const handleCreateNewSubTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTopicTitle.trim()) return;
    const titleVal = newSubTopicTitle.trim();
    const descVal = newSubTopicDesc.trim();

    let backendSecId: number | undefined;
    try {
      const res = await api.post(`/assignments/${assignmentId}/sections`, {
        topicName: 'Programming',
        title: titleVal,
        description: descVal,
      });
      if (res.data?.data?.id) {
        backendSecId = res.data.data.id;
      }
    } catch (err) {
      console.warn('Backend section creation notice:', err);
    }

    const newSt = assignmentStore.addSubTopic(titleVal, descVal, assignmentId);
    if (backendSecId) {
      newSt.id = backendSecId;
      assignmentStore.save();
    }
    onSubTopicAdded(newSt);
    setSelectedSubTopicId(newSt.id);
    setIsCreatingSubTopic(false);
    setNewSubTopicTitle('');
    setNewSubTopicDesc('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please enter a question title.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a problem description.');
      return;
    }
    if (testCases.some((tc) => tc.expectedOutput.trim() === '')) {
      setErrorMsg('Every test case must have an expected output value.');
      return;
    }

    const formattedTestCases = testCases.map((tc, idx) => ({
      id: idx + 1,
      inputData: tc.inputData,
      expectedOutput: tc.expectedOutput.trim(),
      isHidden: !!tc.isHidden,
    }));

    // Post to backend database so it persists across all devices
    const backendQuestionPayload = [
      {
        title: title.trim(),
        difficulty,
        marks: Number(marks) || 10,
        description: description.trim(),
        inputFormat,
        outputFormat,
        constraints,
        starterCodeJava,
        testCases: formattedTestCases.map((tc) => ({
          inputData: tc.inputData,
          expectedOutput: tc.expectedOutput,
          hidden: tc.isHidden,
          explanation: '',
        })),
      },
    ];

    let backendQId: number | undefined;
    try {
      const res = await api.post(
        `/assignments/${assignmentId}/sections/${selectedSubTopicId}/questions/batch`,
        backendQuestionPayload
      );
      if (res.data?.data && res.data.data.length > 0) {
        backendQId = res.data.data[0].id;
      }
    } catch (err) {
      console.warn('Backend question save notice:', err);
    }

    const created = assignmentStore.addQuestion({
      subTopicId: selectedSubTopicId,
      title: title.trim(),
      difficulty,
      marks: Number(marks) || 10,
      description: description.trim(),
      inputFormat,
      outputFormat,
      constraints,
      starterCodeJava,
      testCases: formattedTestCases,
    });

    if (backendQId) {
      created.id = backendQId;
      assignmentStore.save();
    }

    onQuestionAdded(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0c0e12] rounded-3xl max-w-3xl w-full border border-[#1f2430] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1a1f2c] flex items-center justify-between bg-[#0f1218]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00c2ff]/10 text-[#00c2ff] border border-[#00c2ff]/30 flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Add Assignment Question</h2>
              <p className="text-xs text-slate-400">
                Create new Java coding challenge with automated test cases
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a1f2c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Quick Pre-fill Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00c2ff]" />
                <span>Quick Templates (1-Click Fill)</span>
              </span>
              <span className="text-[11px] text-slate-500">Click to instantly populate form</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TEMPLATES.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="p-2.5 rounded-xl bg-[#141822] hover:bg-[#1b2233] border border-[#232c40] hover:border-[#00c2ff]/50 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-[#00c2ff] truncate">
                    {tpl.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {tpl.difficulty} • {tpl.marks} Marks
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Topic Selection */}
          <div className="p-4 rounded-2xl bg-[#090b0e] border border-[#1a1f2c] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Target Sub-Topic / Module</label>
              {!isCreatingSubTopic && (
                <button
                  type="button"
                  onClick={() => setIsCreatingSubTopic(true)}
                  className="text-xs text-[#00c2ff] hover:underline flex items-center gap-1 font-semibold"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ New Sub-Topic</span>
                </button>
              )}
            </div>

            {isCreatingSubTopic ? (
              <div className="p-3 rounded-xl bg-[#121620] border border-[#242f44] space-y-2">
                <div className="text-xs font-bold text-sky-400">Create New Sub-Topic</div>
                <input
                  type="text"
                  placeholder="e.g. String Algorithms, Bit Manipulation"
                  value={newSubTopicTitle}
                  onChange={(e) => setNewSubTopicTitle(e.target.value)}
                  className="w-full bg-[#0c0e12] border border-[#2b374e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
                />
                <input
                  type="text"
                  placeholder="Short description (optional)"
                  value={newSubTopicDesc}
                  onChange={(e) => setNewSubTopicDesc(e.target.value)}
                  className="w-full bg-[#0c0e12] border border-[#2b374e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingSubTopic(false)}
                    className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateNewSubTopic}
                    className="px-3.5 py-1 rounded-lg bg-[#00c2ff] text-slate-950 font-bold text-xs"
                  >
                    Save Sub-Topic
                  </button>
                </div>
              </div>
            ) : (
              <select
                value={selectedSubTopicId}
                onChange={(e) => setSelectedSubTopicId(Number(e.target.value))}
                className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
              >
                {subTopics.map((st) => (
                  <option key={st.id} value={st.id}>
                    Module {st.sectionNumber}: {st.title} ({st.questionCount} questions)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Question Title & Marks & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Question Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Check Palindrome Number"
                className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Difficulty</label>
              <div className="flex rounded-xl bg-[#121620] border border-[#222b3d] p-0.5">
                {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      difficulty === diff
                        ? diff === 'EASY'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : diff === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff[0] + diff.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Marks</label>
              <input
                type="number"
                min={1}
                max={100}
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Problem Statement / Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task clearly for the student..."
              className="w-full bg-[#121620] border border-[#222b3d] rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#00c2ff] resize-none"
            />
          </div>

          {/* Input / Output Format & Constraints */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Input Format</label>
              <input
                type="text"
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Output Format</label>
              <input
                type="text"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Constraints</label>
              <input
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
              />
            </div>
          </div>

          {/* Starter Java Code */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#00c2ff]" />
                <span>Starter Java Template (Solution Boilerplate)</span>
              </label>
              <span className="text-[11px] text-slate-500">Student will see this in Monaco editor</span>
            </div>
            <textarea
              rows={7}
              value={starterCodeJava}
              onChange={(e) => setStarterCodeJava(e.target.value)}
              className="w-full bg-[#07090c] border border-[#1f2638] rounded-xl p-3.5 font-mono text-xs text-emerald-300 focus:outline-none focus:border-[#00c2ff] leading-relaxed"
            />
          </div>

          {/* Test Cases List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-200">
                  Automated Test Cases ({testCases.length})
                </label>
                <p className="text-[11px] text-slate-500">
                  Evaluated automatically by the OpenJDK 21 online compiler
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="px-3 py-1.5 rounded-xl bg-[#162030] hover:bg-[#1f2e46] text-[#00c2ff] border border-[#263b57] text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Test Case</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {testCases.map((tc, idx) => (
                <div
                  key={tc.id || idx}
                  className="p-3.5 rounded-2xl bg-[#090c10] border border-[#1b2230] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#161c28] text-slate-300 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>Test Case #{idx + 1}</span>
                    </span>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400 select-none">
                        <input
                          type="checkbox"
                          checked={tc.isHidden || false}
                          onChange={(e) => updateTestCase(idx, 'isHidden', e.target.checked)}
                          className="rounded border-[#29354d] text-[#00c2ff] focus:ring-0"
                        />
                        <span>Hidden Case</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete test case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        STDIN INPUT
                      </label>
                      <textarea
                        rows={2}
                        value={tc.inputData}
                        onChange={(e) => updateTestCase(idx, 'inputData', e.target.value)}
                        placeholder="e.g. 5\n10\n"
                        className="w-full bg-[#11151e] border border-[#222c3e] rounded-xl p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-[#00c2ff] resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        EXPECTED STDOUT OUTPUT
                      </label>
                      <textarea
                        rows={2}
                        value={tc.expectedOutput}
                        onChange={(e) => updateTestCase(idx, 'expectedOutput', e.target.value)}
                        placeholder="e.g. 15"
                        className="w-full bg-[#11151e] border border-[#222c3e] rounded-xl p-2.5 font-mono text-xs text-emerald-400 focus:outline-none focus:border-[#00c2ff] resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1a1f2c] bg-[#0f1218] flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Questions will instantly appear and persist in the assignment list</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#1a1f2c] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Question</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
