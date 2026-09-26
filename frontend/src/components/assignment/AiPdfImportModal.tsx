import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Key,
  Code2,
  FileCode,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  extractTextFromFile,
  parseQuestionsLocally,
  parseQuestionsWithGemini,
  ExtractedQuestion,
} from '../../services/pdfParserService';
import {
  assignmentStore,
  Topic,
  SubTopic,
  AssignmentQuestion,
} from '../../services/assignmentStore';

interface AiPdfImportModalProps {
  topics: Topic[];
  subTopics: SubTopic[];
  activeSubTopicId: number;
  assignmentId: number;
  onClose: () => void;
  onQuestionsImported: (count: number, subTopicId: number) => void;
  onTopicAdded: (newTopic: Topic) => void;
  onSubTopicAdded: (newSubTopic: SubTopic) => void;
}

export const AiPdfImportModal: React.FC<AiPdfImportModalProps> = ({
  topics,
  subTopics,
  activeSubTopicId,
  assignmentId,
  onClose,
  onQuestionsImported,
  onTopicAdded,
  onSubTopicAdded,
}) => {
  // Target SubTopic state
  const currentSubTopic = subTopics.find((st) => st.id === activeSubTopicId) || subTopics[0];
  const [selectedTopicId, setSelectedTopicId] = useState<number>(
    currentSubTopic?.topicId || topics[0]?.id || 1
  );
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<number>(
    activeSubTopicId || subTopics[0]?.id || 1
  );

  // Quick inline creation
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [showNewSubTopicForm, setShowNewSubTopicForm] = useState(false);
  const [newSubTopicTitle, setNewSubTopicTitle] = useState('');

  // Input modes: 'file' | 'text'
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string>('');

  // Optional Gemini API Key
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('sp_gemini_api_key') || '';
  });
  const [showApiKeySetting, setShowApiKeySetting] = useState(false);

  // Parsing state
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Sub-topics available under currently selected Topic
  const availableSubTopics = subTopics.filter((st) => st.topicId === selectedTopicId);

  const handleTopicChange = (newTopicId: number) => {
    setSelectedTopicId(newTopicId);
    const firstSub = subTopics.find((st) => st.topicId === newTopicId);
    if (firstSub) {
      setSelectedSubTopicId(firstSub.id);
    }
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    const created = assignmentStore.addTopic(newTopicTitle.trim(), '', assignmentId);
    onTopicAdded(created);
    setSelectedTopicId(created.id);
    setNewTopicTitle('');
    setShowNewTopicForm(false);
  };

  const handleCreateSubTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTopicTitle.trim()) return;
    const created = assignmentStore.addSubTopic(
      newSubTopicTitle.trim(),
      '',
      assignmentId,
      selectedTopicId
    );
    onSubTopicAdded(created);
    setSelectedSubTopicId(created.id);
    setNewSubTopicTitle('');
    setShowNewSubTopicForm(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleExtract = async () => {
    setParseError(null);
    setIsParsing(true);

    try {
      let text = '';
      if (inputMode === 'file') {
        if (!file) {
          throw new Error('Please select or drop a PDF or text file first.');
        }
        text = await extractTextFromFile(file);
      } else {
        if (!rawText.trim()) {
          throw new Error('Please paste your problem statement or question sheet text.');
        }
        text = rawText.trim();
      }

      if (!text || text.trim().length < 10) {
        throw new Error('Could not extract readable text from the provided source.');
      }

      let questions: ExtractedQuestion[] = [];
      const trimmedKey = geminiApiKey.trim();

      if (trimmedKey) {
        localStorage.setItem('sp_gemini_api_key', trimmedKey);
        try {
          questions = await parseQuestionsWithGemini(text, trimmedKey);
        } catch (apiErr: any) {
          console.warn('Gemini API parse failed, falling back to local NLP parser:', apiErr);
          questions = parseQuestionsLocally(text);
        }
      } else {
        questions = parseQuestionsLocally(text);
      }

      if (!questions || questions.length === 0) {
        throw new Error('No coding questions could be identified. Ensure the text contains problem statements and test inputs/outputs.');
      }

      setExtractedQuestions(questions);
      setSelectedIndices(new Set(questions.map((_, i) => i)));
      setExpandedIndex(0);
    } catch (err: any) {
      setParseError(err.message || 'Failed to extract questions.');
    } finally {
      setIsParsing(false);
    }
  };

  const toggleSelectQuestion = (index: number) => {
    const updated = new Set(selectedIndices);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    setSelectedIndices(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = extractedQuestions.filter((_, i) => i !== index);
    setExtractedQuestions(updated);
    const updatedIndices = new Set<number>();
    updated.forEach((_, i) => updatedIndices.add(i));
    setSelectedIndices(updatedIndices);
  };

  const updateQuestionField = (index: number, field: keyof ExtractedQuestion, val: any) => {
    const updated = [...extractedQuestions];
    updated[index] = { ...updated[index], [field]: val };
    setExtractedQuestions(updated);
  };

  const handleImportAll = () => {
    const toImport = extractedQuestions.filter((_, idx) => selectedIndices.has(idx));
    if (toImport.length === 0) {
      setParseError('Please select at least one question to import.');
      return;
    }

    const payload = toImport.map((q) => ({
      subTopicId: selectedSubTopicId,
      title: q.title,
      difficulty: q.difficulty,
      marks: q.marks || 10,
      description: q.description,
      inputFormat: q.inputFormat,
      outputFormat: q.outputFormat,
      constraints: q.constraints,
      starterCodeJava: q.starterCodeJava,
      testCases: q.testCases.map((tc, idx) => ({
        id: idx + 1,
        inputData: tc.inputData,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
        explanation: tc.explanation,
      })),
    }));

    assignmentStore.addMultipleQuestions(payload);
    onQuestionsImported(toImport.length, selectedSubTopicId);
    onClose();
  };

  const targetSubTopicObj = subTopics.find((st) => st.id === selectedSubTopicId);
  const targetTopicObj = topics.find((t) => t.id === selectedTopicId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0c0e12] rounded-3xl max-w-4xl w-full border border-[#1f2430] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1a1f2c] flex items-center justify-between bg-[#0f1218]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00c2ff]/20 to-sky-400/20 text-[#00c2ff] border border-[#00c2ff]/30 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-[#00c2ff]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>AI Question Sheet Importer</span>
                <span className="text-[10px] bg-sky-950/70 text-[#38bdf8] border border-sky-800/40 px-2 py-0.5 rounded-full font-bold">
                  PDF / Text / Auto-Test Cases
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Upload a PDF or paste question sheets with 1 or multiple problems — AI automatically generates test cases & constraints!
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {parseError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{parseError}</span>
            </div>
          )}

          {/* 1. Target Topic & Sub-Topic Selection */}
          <div className="p-4 rounded-2xl bg-[#090b0e] border border-[#1a1f2c] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00c2ff]" />
                <span>Target Topic & Sub-Topic</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewTopicForm(!showNewTopicForm)}
                  className="text-[#00c2ff] hover:underline font-semibold text-[11px]"
                >
                  + Add Topic
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewSubTopicForm(!showNewSubTopicForm)}
                  className="text-[#00c2ff] hover:underline font-semibold text-[11px]"
                >
                  + Add Sub-Topic
                </button>
              </div>
            </div>

            {/* Inline Topic Creation Form */}
            {showNewTopicForm && (
              <form onSubmit={handleCreateTopic} className="p-3 rounded-xl bg-[#121620] border border-[#232d3f] flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="New Topic name (e.g. Array, Strings, Recursion)"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="flex-1 bg-[#0c0e12] border border-[#2b374e] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#00c2ff]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-[#00c2ff] text-slate-950 font-bold text-xs"
                >
                  Save Topic
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTopicForm(false)}
                  className="text-xs text-slate-400 hover:text-white px-2"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* Inline Sub-Topic Creation Form */}
            {showNewSubTopicForm && (
              <form onSubmit={handleCreateSubTopic} className="p-3 rounded-xl bg-[#121620] border border-[#232d3f] flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder={`New Sub-Topic under "${targetTopicObj?.title || 'Topic'}" (e.g. Sub-array, 2D Matrix)`}
                  value={newSubTopicTitle}
                  onChange={(e) => setNewSubTopicTitle(e.target.value)}
                  className="flex-1 bg-[#0c0e12] border border-[#2b374e] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#00c2ff]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-[#00c2ff] text-slate-950 font-bold text-xs"
                >
                  Save Sub-Topic
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewSubTopicForm(false)}
                  className="text-xs text-slate-400 hover:text-white px-2"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* Dropdown Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  1. SELECT TOPIC
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => handleTopicChange(Number(e.target.value))}
                  className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  2. SELECT SUB-TOPIC
                </label>
                <select
                  value={selectedSubTopicId}
                  onChange={(e) => setSelectedSubTopicId(Number(e.target.value))}
                  className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
                >
                  {availableSubTopics.length === 0 ? (
                    <option value="">No sub-topics yet. Click "+ Add Sub-Topic" above</option>
                  ) : (
                    availableSubTopics.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.title} ({st.questionCount} questions)
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Choose Upload Mode: File vs Paste */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex rounded-xl bg-[#121620] border border-[#222b3d] p-0.5">
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    inputMode === 'file'
                      ? 'bg-[#00c2ff] text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload PDF / Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    inputMode === 'text'
                      ? 'bg-[#00c2ff] text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Paste Question Text</span>
                </button>
              </div>

              {/* Optional Gemini API Key Link */}
              <button
                type="button"
                onClick={() => setShowApiKeySetting(!showApiKeySetting)}
                className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{geminiApiKey ? 'Gemini Key Configured ✓' : 'Add Gemini Key (Optional)'}</span>
              </button>
            </div>

            {/* Optional Gemini Key Input */}
            {showApiKeySetting && (
              <div className="p-3.5 rounded-xl bg-[#141822] border border-[#242f44] space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gemini 1.5 Flash API Key (Optional)</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Works offline by default. An API key gives extra accuracy on raw scans.
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full bg-[#0c0e12] border border-[#2b374e] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00c2ff]"
                />
              </div>
            )}

            {/* File Upload Area */}
            {inputMode === 'file' ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  file
                    ? 'border-[#00c2ff] bg-[#00c2ff]/5'
                    : 'border-[#222b3d] hover:border-[#00c2ff]/50 bg-[#090b0e]'
                }`}
                onClick={() => document.getElementById('ai-file-upload-input')?.click()}
              >
                <input
                  id="ai-file-upload-input"
                  type="file"
                  accept=".pdf,.txt,.md,.java"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-[#141824] text-[#00c2ff] flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>

                {file ? (
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <span>{file.name}</span>
                    </div>
                    <p className="text-xs text-emerald-400">
                      {(file.size / 1024).toFixed(1)} KB • Ready for automated AI extraction
                    </p>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Click to choose a different file or drag and drop another
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Drop your questions PDF or text file here
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports <strong className="text-white">.pdf</strong>,{' '}
                      <strong className="text-white">.txt</strong>, or assignment sheets containing 1 or more questions
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Paste Text Area */
              <div className="space-y-1">
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Paste your problem statements here. For example:

Problem 1: Maximum Subarray Sum
Find the contiguous subarray with the largest sum.
Input: 5\n-2 1 -3 4 -1
Output: 4
Constraints: 1 <= n <= 10^5

Problem 2: Subarray with Target Sum
...`}
                  className="w-full bg-[#090b0e] border border-[#222b3d] rounded-2xl p-4 font-mono text-xs text-slate-200 outline-none focus:border-[#00c2ff] resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Extract Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={isParsing || (inputMode === 'file' && !file) || (inputMode === 'text' && !rawText.trim())}
                onClick={handleExtract}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00c2ff] to-[#38bdf8] hover:from-[#38bdf8] hover:to-[#00c2ff] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isParsing ? 'Analyzing & Extracting...' : '✨ Extract Questions with AI'}</span>
              </button>
            </div>
          </div>

          {/* 3. Extracted Questions Preview & Review List */}
          {extractedQuestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#1a1f2c]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      Found {extractedQuestions.length} Question{extractedQuestions.length > 1 ? 's' : ''} in Document
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review extracted test cases and constraints before importing into{' '}
                    <strong className="text-white">"{targetSubTopicObj?.title}"</strong>
                  </p>
                </div>

                <div className="text-xs text-slate-400">
                  {selectedIndices.size} of {extractedQuestions.length} selected
                </div>
              </div>

              {/* List of Extracted Cards */}
              <div className="space-y-3">
                {extractedQuestions.map((q, idx) => {
                  const isSelected = selectedIndices.has(idx);
                  const isExpanded = expandedIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isSelected
                          ? 'bg-[#0e1219] border-[#222e42]'
                          : 'bg-[#080a0d] border-[#181d26] opacity-60'
                      }`}
                    >
                      {/* Top Bar of Question Item */}
                      <div className="p-4 flex items-center justify-between gap-3 bg-[#111620]">
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectQuestion(idx)}
                            className="rounded border-[#29354d] text-[#00c2ff] focus:ring-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">
                                #{idx + 1} {q.title}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                                {q.difficulty}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 bg-[#181f2c] px-2 py-0.5 rounded-md">
                                {q.testCases.length} Test Cases
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-lg mt-0.5">
                              {q.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2232] transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuestion(idx)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors"
                            title="Discard this question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details Form */}
                      {isExpanded && (
                        <div className="p-4 space-y-3 bg-[#0a0d13] border-t border-[#1a1f2c] text-xs">
                          {/* Title & Difficulty */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-8 space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">
                                TITLE
                              </label>
                              <input
                                type="text"
                                value={q.title}
                                onChange={(e) => updateQuestionField(idx, 'title', e.target.value)}
                                className="w-full bg-[#11151e] border border-[#222c3e] rounded-xl px-3 py-1.5 text-white"
                              />
                            </div>
                            <div className="sm:col-span-4 space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">
                                DIFFICULTY
                              </label>
                              <select
                                value={q.difficulty}
                                onChange={(e) =>
                                  updateQuestionField(idx, 'difficulty', e.target.value as any)
                                }
                                className="w-full bg-[#11151e] border border-[#222c3e] rounded-xl px-3 py-1.5 text-white"
                              >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                              </select>
                            </div>
                          </div>

                          {/* Problem Description */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">
                              PROBLEM STATEMENT
                            </label>
                            <textarea
                              rows={3}
                              value={q.description}
                              onChange={(e) => updateQuestionField(idx, 'description', e.target.value)}
                              className="w-full bg-[#11151e] border border-[#222c3e] rounded-xl p-2.5 text-white resize-none"
                            />
                          </div>

                          {/* Constraints & Formats */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase">
                                INPUT FORMAT
                              </label>
                              <input
                                type="text"
                                value={q.inputFormat}
                                onChange={(e) => updateQuestionField(idx, 'inputFormat', e.target.value)}
                                className="w-full bg-[#11151e] border border-[#222c3e] rounded-xl px-3 py-1.5 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase">
                                OUTPUT FORMAT
                              </label>
                              <input
                                type="text"
                                value={q.outputFormat}
                                onChange={(e) => updateQuestionField(idx, 'outputFormat', e.target.value)}
                                className="w-full bg-[#11151e] border border-[#222c3e] rounded-xl px-3 py-1.5 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase">
                                CONSTRAINTS
                              </label>
                              <input
                                type="text"
                                value={q.constraints}
                                onChange={(e) => updateQuestionField(idx, 'constraints', e.target.value)}
                                className="w-full bg-[#11151e] border border-[#222c3e] rounded-xl px-3 py-1.5 text-amber-300 font-mono"
                              />
                            </div>
                          </div>

                          {/* Test Cases */}
                          <div className="space-y-2 pt-1">
                            <label className="text-[10px] font-bold text-slate-300 uppercase block">
                              AUTOMATED TEST CASES ({q.testCases.length})
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.testCases.map((tc, tcIdx) => (
                                <div
                                  key={tcIdx}
                                  className="p-2.5 rounded-xl bg-[#07090d] border border-[#1b2230] space-y-1"
                                >
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-slate-400">
                                      Case {tcIdx + 1} {tc.isHidden ? '(Hidden)' : '(Visible)'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-300">
                                    <span className="text-slate-500">In: </span>
                                    {tc.inputData.replace(/\n/g, ' ')}
                                  </div>
                                  <div className="text-[11px] font-mono text-emerald-400">
                                    <span className="text-slate-500">Out: </span>
                                    {tc.expectedOutput.replace(/\n/g, ' ')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1a1f2c] bg-[#0f1218] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Destination:{' '}
            <strong className="text-white">
              {targetTopicObj?.title} &gt; {targetSubTopicObj?.title || 'Selected Sub-Topic'}
            </strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={extractedQuestions.length === 0 || selectedIndices.size === 0}
              onClick={handleImportAll}
              className="px-6 py-2.5 rounded-xl bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Import {selectedIndices.size} Question{selectedIndices.size > 1 ? 's' : ''} Automatically
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
