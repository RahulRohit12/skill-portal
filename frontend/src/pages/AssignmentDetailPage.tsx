import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertCircle,
  Code2,
  FileQuestion,
  Bookmark,
  Check,
  X,
  Share2,
  PlayCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Plus,
  FolderPlus,
  Layers
} from 'lucide-react';
import api from '../api/client';
import { AssignmentDetail, QuestionDetail } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  assignmentStore,
  SubTopic,
  AssignmentQuestion,
} from '../services/assignmentStore';
import { AddQuestionModal } from '../components/assignment/AddQuestionModal';

export const AssignmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assignmentIdNum = Number(id) || 1;

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Sub-topics & Questions state from assignmentStore
  const [subTopics, setSubTopics] = useState<SubTopic[]>(() =>
    assignmentStore.getSubTopics(assignmentIdNum)
  );
  const [selectedSectionId, setSelectedSectionId] = useState<number>(
    subTopics[0]?.id || 1
  );

  // Modal States
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [isNewSubTopicPromptOpen, setIsNewSubTopicPromptOpen] = useState(false);
  const [newSubTopicTitle, setNewSubTopicTitle] = useState('');
  const [newSubTopicDesc, setNewSubTopicDesc] = useState('');

  // MCQ Question Solving Modal State (if MCQ questions exist)
  const [activeMcqModal, setActiveMcqModal] = useState<QuestionDetail | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [submittingMcq, setSubmittingMcq] = useState(false);
  const [mcqFeedback, setMcqFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  const refreshHierarchy = () => {
    const freshSubTopics = assignmentStore.getSubTopics(assignmentIdNum);
    setSubTopics([...freshSubTopics]);
    if (freshSubTopics.length > 0 && !freshSubTopics.some((st) => st.id === selectedSectionId)) {
      setSelectedSectionId(freshSubTopics[0].id);
    }
  };

  const loadData = () => {
    if (!id) return;
    api.get(`/assignments/${id}`)
      .then((res) => {
        const data = res.data.data;
        setAssignment(data);
      })
      .catch((err) => console.warn('Backend assignment fetch warning:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    refreshHierarchy();
  }, [id]);

  const handleToggleBookmark = (qId: number) => {
    assignmentStore.toggleBookmark(qId);
    refreshHierarchy();
  };

  const handleCreateSubTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTopicTitle.trim()) return;
    const created = assignmentStore.addSubTopic(newSubTopicTitle, newSubTopicDesc, assignmentIdNum);
    refreshHierarchy();
    setSelectedSectionId(created.id);
    setNewSubTopicTitle('');
    setNewSubTopicDesc('');
    setIsNewSubTopicPromptOpen(false);
  };

  if (loading) return <LoadingSpinner fullPage message="Loading assignment..." />;

  const title = assignment?.title || 'Java Programming';
  const difficulty = assignment?.difficulty || 'Intermediate';

  const currentSection =
    subTopics.find((s) => s.id === selectedSectionId) || subTopics[0] || {
      id: 1,
      assignmentId: assignmentIdNum,
      sectionNumber: 1,
      title: 'Data Types',
      description: 'Primitive and non-primitive data types in Java',
      questionCount: 0,
      solvedCount: 0,
      totalMarks: 0,
      marksObtained: 0,
      locked: false,
      status: 'NOT_STARTED' as const,
    };

  const currentQuestions = assignmentStore.getQuestionsBySubTopic(currentSection.id);

  // Metrics calculations
  const totalModules = subTopics.length;
  const completedModules = subTopics.filter((s) => s.status === 'COMPLETED').length;
  const modulesPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const totalQuestions = subTopics.reduce((acc, s) => acc + s.questionCount, 0);
  const totalSolved = subTopics.reduce((acc, s) => acc + s.solvedCount, 0);
  const solvedPct = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

  const totalAttempted = Math.min(totalQuestions, totalSolved + 1);
  const attemptedPct = totalQuestions > 0 ? Math.round((totalAttempted / totalQuestions) * 100) : 0;

  const totalMarks = subTopics.reduce((acc, s) => acc + s.totalMarks, 0);
  const marksObtained = subTopics.reduce((acc, s) => acc + s.marksObtained, 0);
  const marksPct = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/assignments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assignments</span>
        </Link>

        {/* Quick Admin Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewSubTopicPromptOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#141822] hover:bg-[#1c2232] border border-[#232c40] text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#00c2ff]" />
            <span>+ New Sub-Topic</span>
          </button>
          <button
            onClick={() => setIsAddQuestionModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Question</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#181c26] text-sky-400 border border-[#263147]">
            {difficulty}
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-4xl">
          {assignment?.description ||
            'Master core Java concepts with hands-on coding challenges evaluated by an automated OpenJDK 21 online compiler.'}
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Modules */}
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Modules</span>
              <span className="text-[#00c2ff] font-bold">{modulesPct}%</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{totalModules}</div>
            <div className="text-xs text-slate-500 mt-0.5">{completedModules} completed</div>
          </div>
          <div className="h-1 w-full bg-[#181c26] rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-[#00c2ff] rounded-full transition-all duration-500"
              style={{ width: `${modulesPct}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Solved */}
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Solved</span>
              <span className="text-emerald-400 font-bold">{solvedPct}%</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{totalSolved}</div>
            <div className="text-xs text-slate-500 mt-0.5">of {totalQuestions} questions</div>
          </div>
          <div className="h-1 w-full bg-[#181c26] rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${solvedPct}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Attempted */}
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Attempted</span>
              <span className="text-amber-400 font-bold">{attemptedPct}%</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{totalAttempted}</div>
            <div className="text-xs text-slate-500 mt-0.5">of {totalQuestions} questions</div>
          </div>
          <div className="h-1 w-full bg-[#181c26] rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${attemptedPct}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Marks Obtained */}
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Marks obtained</span>
              <span className="text-cyan-400 font-bold">{marksPct}%</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {marksObtained}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              / {totalMarks} total marks
            </div>
          </div>
          <div className="h-1 w-full bg-[#181c26] rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${marksPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two-Column Split: Modules Sidebar (Left) + Questions List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sub-Topics Navigation */}
        <div className="lg:col-span-4 bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1a1f2c]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Sub-Topics</span>
              <span className="text-[10px] bg-[#181c26] text-slate-400 font-bold px-1.5 py-0.5 rounded-md">
                {subTopics.length}
              </span>
            </div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{completedModules} completed</span>
            </div>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {subTopics.map((sec, idx) => {
              const isSelected = sec.id === currentSection.id;
              const isCompleted = sec.status === 'COMPLETED';
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-[#141924] border-[#00c2ff]/40 shadow-sm'
                      : 'bg-transparent hover:bg-[#12151c] border-transparent text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isSelected
                          ? 'bg-[#00c2ff]/20 text-[#00c2ff]'
                          : 'bg-[#181c26] text-slate-400'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-medium truncate ${
                        isSelected ? 'text-white font-semibold' : 'text-slate-300'
                      }`}
                    >
                      {sec.title}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-medium shrink-0 ml-2">
                    <strong className={isCompleted ? 'text-emerald-400' : 'text-slate-300'}>
                      {sec.solvedCount}
                    </strong>
                    /{sec.questionCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Add Subtopic inline button */}
          <div className="pt-3 mt-3 border-t border-[#1a1f2c]">
            <button
              onClick={() => setIsNewSubTopicPromptOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-[#141822] hover:bg-[#1a202e] border border-dashed border-[#263147] hover:border-[#00c2ff]/50 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <FolderPlus className="w-3.5 h-3.5 text-[#00c2ff]" />
              <span>+ Add New Sub-Topic</span>
            </button>
          </div>
        </div>

        {/* Right Column: Questions List for selected Sub-Topic */}
        <div className="lg:col-span-8 bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-5 shadow-xl">
          {/* Header of Right Pane */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#1a1f2c]">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-base text-white">
                  {currentSection.sectionNumber || 1} · {currentSection.title}
                </h3>
                {currentSection.status === 'COMPLETED' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                    ✓ Completed
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {currentQuestions.length} questions · {currentSection.totalMarks} marks ·{' '}
                {currentSection.description}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsAddQuestionModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Locked Notice if section is locked */}
          {currentSection.locked ? (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-400 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Sub-Topic Locked</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Complete prior challenges to unlock this module.
              </p>
            </div>
          ) : currentQuestions.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center bg-[#090b0e] rounded-xl border border-dashed border-[#1f2430]">
              <div className="w-12 h-12 rounded-2xl bg-[#141822] text-[#00c2ff] flex items-center justify-center mb-3">
                <Code2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No questions in this sub-topic yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
                Be the first to add a Java coding question with automated test cases to this topic!
              </p>
              <button
                onClick={() => setIsAddQuestionModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#00c2ff] text-slate-950 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Question</span>
              </button>
            </div>
          ) : (
            /* Questions List */
            <div className="space-y-2.5">
              {currentQuestions.map((q) => {
                const isSolved = q.solved;
                const difficultyColor =
                  q.difficulty === 'EASY'
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                    : q.difficulty === 'MEDIUM'
                    ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                    : 'bg-rose-950/60 text-rose-400 border-rose-800/40';

                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-[#090b0e] hover:bg-[#12151c] border border-[#1a1f2c] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Left: Solved circle + Title + Badges */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 sm:mt-0 ${
                          isSolved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#181c26] text-slate-500 border border-[#232938]'
                        }`}
                      >
                        {isSolved ? '✓' : ''}
                      </div>

                      <div className="min-w-0">
                        <h4
                          onClick={() => {
                            navigate(
                              `/coding?questionId=${q.id}&assignmentId=${assignmentIdNum}`
                            );
                          }}
                          className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00c2ff] transition-colors cursor-pointer truncate"
                        >
                          {q.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-950/60 text-[#38bdf8] border border-sky-800/40 flex items-center gap-1">
                            •) CODING
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Code2 className="w-3 h-3 text-[#00c2ff]" /> OpenJDK 21
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" /> {q.testCases?.length || 1} test cases
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Difficulty + Marks + Bookmark + Action Button */}
                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyColor}`}
                      >
                        • {q.difficulty[0] + q.difficulty.slice(1).toLowerCase()}
                      </span>

                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#181c26] text-slate-300 border border-[#232938]">
                        {isSolved ? `${q.marks} / ${q.marks}` : `0 / ${q.marks}`} marks
                      </span>

                      <button
                        onClick={() => handleToggleBookmark(q.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          q.bookmarked
                            ? 'text-amber-400 bg-amber-950/50'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-[#181c26]'
                        }`}
                        title="Bookmark question"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <Link
                        to={`/coding?questionId=${q.id}&assignmentId=${assignmentIdNum}`}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                          isSolved
                            ? 'bg-[#181c26] hover:bg-[#202533] border border-[#2a3040] text-slate-200'
                            : 'bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 font-bold'
                        }`}
                      >
                        {isSolved ? 'Review' : 'Solve'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Question */}
      {isAddQuestionModalOpen && (
        <AddQuestionModal
          subTopics={subTopics}
          activeSubTopicId={selectedSectionId}
          assignmentId={assignmentIdNum}
          onClose={() => setIsAddQuestionModalOpen(false)}
          onQuestionAdded={(newQ) => {
            refreshHierarchy();
            setSelectedSectionId(newQ.subTopicId);
          }}
          onSubTopicAdded={(newSt) => {
            refreshHierarchy();
            setSelectedSectionId(newSt.id);
          }}
        />
      )}

      {/* Quick Modal: Add Sub-Topic */}
      {isNewSubTopicPromptOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0e12] rounded-2xl max-w-md w-full border border-[#1f2430] p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a1f2c]">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#00c2ff]" />
                <h3 className="font-bold text-sm text-white">Create New Sub-Topic</h3>
              </div>
              <button
                onClick={() => setIsNewSubTopicPromptOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubTopic} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Sub-Topic Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. String Manipulation, Bitwise Algorithms"
                  value={newSubTopicTitle}
                  onChange={(e) => setNewSubTopicTitle(e.target.value)}
                  className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. String methods, palindrome, anagram questions"
                  value={newSubTopicDesc}
                  onChange={(e) => setNewSubTopicDesc(e.target.value)}
                  className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00c2ff]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSubTopicPromptOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  Create Sub-Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
