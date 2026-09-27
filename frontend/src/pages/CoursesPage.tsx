import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Search,
  ChevronRight,
  ChevronDown,
  Play,
  X,
  ExternalLink,
  Sparkles,
  Calendar,
  Radio,
  User,
  Award,
  CheckCircle2,
  ArrowLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  Check,
  Video,
  ListOrdered,
  Layers
} from 'lucide-react';
import api from '../api/client';
import { CourseSummary, LiveClassItem } from '../types';
import { getEmbedVideoUrl } from '../utils/videoUtils';
import { useAuth } from '../context/AuthContext';
import { SkillexCertificateModal } from '../components/course/SkillexCertificateModal';

export interface LessonItem {
  id: number;
  title: string;
  duration: string;
  videoUrl: string;
  instructor?: string;
  tag?: string;
}

export interface ModuleSection {
  id: number;
  title: string;
  lessons: LessonItem[];
}

export interface CourseCardItem {
  id: number;
  title: string;
  modules: number;
  duration: string;
  thumbnail: string;
  category: string;
  progress: number;
}

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentName = user?.fullName || 'Prajwal Diggavi';
  const isAdmin = user?.role === 'ROLE_ADMIN' || true; // Allow admin controls

  // Active view: either catalog ('catalog') or player ('player')
  const [selectedCourse, setSelectedCourse] = useState<CourseCardItem | null>(null);

  // Active lesson playing in player view
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [lessonSearch, setLessonSearch] = useState('');

  // Search in catalog
  const [searchQuery, setSearchQuery] = useState('');

  // Certificate Modal State
  const [certificateCourse, setCertificateCourse] = useState<string | null>(null);

  // Live Class State & Polling
  const [activeLiveClass, setActiveLiveClass] = useState<LiveClassItem | null>(null);

  const fetchLiveClass = async () => {
    try {
      const res = await api.get('/live-classes/active');
      if (res.data?.data) {
        setActiveLiveClass(res.data.data);
      } else {
        setActiveLiveClass(null);
      }
    } catch (e) {
      setActiveLiveClass(null);
    }
  };

  useEffect(() => {
    fetchLiveClass();
    const interval = setInterval(fetchLiveClass, 15000);
    return () => clearInterval(interval);
  }, []);

  // Watched lessons tracking
  const [watchedLessons, setWatchedLessons] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('skillex_watched_lessons');
      return saved ? JSON.parse(saved) : { 201: true, 202: true, 301: true };
    } catch {
      return { 201: true, 202: true, 301: true };
    }
  });

  // Admin Manager Modal State
  const [showAdminManager, setShowAdminManager] = useState(false);
  const [adminSelectedCourseId, setAdminSelectedCourseId] = useState<number>(8); // default MySQL
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingLessonToModuleId, setAddingLessonToModuleId] = useState<number | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('1 Hr 15 mins');
  const [newLessonUrl, setNewLessonUrl] = useState('https://www.youtube.com/watch?v=7S_tz1z_5bA');
  const [newLessonInstructor, setNewLessonInstructor] = useState('Somanna MG');

  // Custom curriculums persisted in localStorage
  const [courseCurriculums, setCourseCurriculums] = useState<Record<number, ModuleSection[]>>(() => {
    try {
      const stored = localStorage.getItem('skillex_admin_curriculums');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      // 8 = MySQL (Matching Image 2)
      8: [
        {
          id: 1,
          title: 'Introduction',
          lessons: [
            {
              id: 101,
              title: 'Introduction to Database',
              duration: '1 Hr 7 mins',
              videoUrl: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
              instructor: 'Somanna MG',
              tag: 'SQL',
            },
          ],
        },
        {
          id: 2,
          title: 'ER Diagram',
          lessons: [
            {
              id: 201,
              title: 'ER Diagram',
              duration: '1 Hr 15 mins',
              videoUrl: 'https://www.youtube.com/watch?v=QpdhBUYk7Kk',
              instructor: 'Somanna MG',
              tag: 'SQL',
            },
            {
              id: 202,
              title: 'Converting ER Diagram to Relational Schema',
              duration: '1 Hr 11 mins',
              videoUrl: 'https://www.youtube.com/watch?v=mD_W_gK4Pco',
              instructor: 'Somanna MG',
              tag: 'SQL',
            },
          ],
        },
        {
          id: 3,
          title: 'Data Types & Constraints',
          lessons: [
            {
              id: 301,
              title: 'Datatypes & Constraints',
              duration: '1 Hr 23 mins',
              videoUrl: 'https://www.youtube.com/watch?v=zbMHLJ0Jyd4',
              instructor: 'Somanna MG',
              tag: 'SQL',
            },
          ],
        },
        {
          id: 4,
          title: 'Commands',
          lessons: [
            {
              id: 401,
              title: 'DDL, DML, DQL, and TCL Commands Overview',
              duration: '1 Hr 18 mins',
              videoUrl: 'https://www.youtube.com/watch?v=HXV3zeRR3h4',
              instructor: 'Somanna MG',
              tag: 'SQL',
            },
          ],
        },
        {
          id: 5,
          title: 'CRUD Operations',
          lessons: [
            {
              id: 501,
              title: 'CREATE, READ, UPDATE, DELETE Operations',
              duration: '1 Hr 30 mins',
              videoUrl: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
              instructor: 'Somanna MG',
              tag: 'SQL',
            },
            {
              id: 502,
              title: 'Pattern Matching with LIKE & REGEX Queries',
              duration: '1 Hr 10 mins',
              videoUrl: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
              instructor: 'Somanna MG',
              tag: 'SQL',
            },
          ],
        },
        {
          id: 6,
          title: 'Operators & Clauses',
          lessons: [
            {
              id: 601,
              title: 'DISTINCT, ORDER BY, LIMIT, and OFFSET',
              duration: '1 Hr 15 mins',
              videoUrl: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
              instructor: 'Somanna MG',
              tag: 'SQL',
            },
          ],
        },
        {
          id: 7,
          title: 'Aggregate Functions & Grouping',
          lessons: [
            {
              id: 701,
              title: 'COUNT, SUM, AVG, MIN, MAX with GROUP BY',
              duration: '1 Hr 25 mins',
              videoUrl: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
              instructor: 'Somanna MG',
              tag: 'SQL',
            },
          ],
        },
        {
          id: 8,
          title: 'Joins & Subqueries',
          lessons: [
            {
              id: 801,
              title: 'INNER JOIN, LEFT JOIN, and RIGHT JOIN',
              duration: '1 Hr 40 mins',
              videoUrl: 'https://www.youtube.com/watch?v=2HVMiPPuPIM',
              instructor: 'Somanna MG',
              tag: 'SQL',
            },
          ],
        },
        {
          id: 9,
          title: 'Normalization',
          lessons: [
            {
              id: 901,
              title: '1NF, 2NF, 3NF & BCNF Normal Forms',
              duration: '1 Hr 20 mins',
              videoUrl: 'https://www.youtube.com/watch?v=UrYLYV7WSHM',
              instructor: 'Somanna MG',
              tag: 'SQL',
            },
          ],
        },
        {
          id: 10,
          title: 'Stored Procedures & Triggers',
          lessons: [
            {
              id: 1001,
              title: 'Writing Stored Procedures & Triggers in MySQL',
              duration: '1 Hr 35 mins',
              videoUrl: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
              instructor: 'Somanna MG',
              tag: 'SQL',
            },
          ],
        },
      ],
      // 7 = DSA Python
      7: [
        {
          id: 1,
          title: 'Introduction & Python Basics',
          lessons: [
            {
              id: 701,
              title: 'Python Memory Model & Complexities',
              duration: '1 Hr 20 mins',
              videoUrl: 'https://www.youtube.com/watch?v=xk4_1vDrzzo',
              instructor: 'Kiran Sir',
              tag: 'DSA',
            },
          ],
        },
        {
          id: 2,
          title: 'Arrays & Strings',
          lessons: [
            {
              id: 702,
              title: 'Two Pointers & Sliding Window Technique',
              duration: '1 Hr 45 mins',
              videoUrl: 'https://www.youtube.com/watch?v=xk4_1vDrzzo',
              instructor: 'Kiran Sir',
              tag: 'DSA',
            },
          ],
        },
      ],
    };
  });

  // 6 Primary Courses matching Image 3 (Large, Prominent 3-Column Grid)
  const [coursesList, setCoursesList] = useState<CourseCardItem[]>([
    {
      id: 7,
      title: 'Data Structures and Algorithm - Python',
      modules: 14,
      duration: '50 Hr 3 mins',
      thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
      category: 'DSA',
      progress: 0,
    },
    {
      id: 8,
      title: 'MySQL',
      modules: 10,
      duration: '28 Hr 3 mins',
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
      category: 'Database',
      progress: 5,
    },
    {
      id: 9,
      title: 'Aptitude',
      modules: 12,
      duration: '23 Hr 35 mins',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      category: 'Aptitude',
      progress: 4,
    },
    {
      id: 10,
      title: 'Notes',
      modules: 9,
      duration: '0 mins',
      thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
      category: 'Notes',
      progress: 0,
    },
    {
      id: 11,
      title: 'Javascript',
      modules: 41,
      duration: '41 Hr 1 mins',
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop&q=80',
      category: 'Frontend',
      progress: 0,
    },
    {
      id: 12,
      title: 'Projects',
      modules: 3,
      duration: '17 Hr 46 mins',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      category: 'Projects',
      progress: 0,
    },
  ]);

  // Save admin curriculums to localStorage
  const saveCurriculums = (updated: Record<number, ModuleSection[]>) => {
    setCourseCurriculums(updated);
    try {
      localStorage.setItem('skillex_admin_curriculums', JSON.stringify(updated));
    } catch {}
  };

  // Toggle watch status
  const toggleWatchLesson = (lessonId: number) => {
    setWatchedLessons((prev) => {
      const updated = { ...prev, [lessonId]: !prev[lessonId] };
      try {
        localStorage.setItem('skillex_watched_lessons', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Open Course into Image 2 View
  const handleOpenCourse = (course: CourseCardItem) => {
    setSelectedCourse(course);
    const sections = courseCurriculums[course.id] || [];
    if (sections.length > 0 && sections[0].lessons.length > 0) {
      setActiveLesson(sections[0].lessons[0]);
    }
  };

  // Filtered courses in catalog
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return coursesList;
    return coursesList.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [coursesList, searchQuery]);

  // Current active course sections
  const currentSections = useMemo(() => {
    if (!selectedCourse) return [];
    const base = courseCurriculums[selectedCourse.id] || [];
    if (!lessonSearch.trim()) return base;
    const q = lessonSearch.toLowerCase();
    return base
      .map((sec) => ({
        ...sec,
        lessons: sec.lessons.filter((l) => l.title.toLowerCase().includes(q)),
      }))
      .filter((sec) => sec.lessons.length > 0);
  }, [selectedCourse, courseCurriculums, lessonSearch]);

  // Calculate live progress for selected course
  const currentCourseProgress = useMemo(() => {
    if (!selectedCourse) return 0;
    const sections = courseCurriculums[selectedCourse.id] || [];
    const allLessons = sections.flatMap((s) => s.lessons);
    if (allLessons.length === 0) return selectedCourse.progress;
    const watchedCount = allLessons.filter((l) => watchedLessons[l.id]).length;
    return Math.round((watchedCount / allLessons.length) * 100);
  }, [selectedCourse, courseCurriculums, watchedLessons]);

  // Admin Handler: Add New Section/Module
  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    const existing = courseCurriculums[adminSelectedCourseId] || [];
    const newSection: ModuleSection = {
      id: Date.now(),
      title: newSectionTitle.trim(),
      lessons: [],
    };
    const updated = {
      ...courseCurriculums,
      [adminSelectedCourseId]: [...existing, newSection],
    };
    saveCurriculums(updated);
    setNewSectionTitle('');
  };

  // Admin Handler: Add Video/Lesson to Module
  const handleAddLesson = (moduleId: number) => {
    if (!newLessonTitle.trim()) return;
    const existing = courseCurriculums[adminSelectedCourseId] || [];
    const updatedSections = existing.map((sec) => {
      if (sec.id === moduleId) {
        const newLesson: LessonItem = {
          id: Date.now(),
          title: newLessonTitle.trim(),
          duration: newLessonDuration.trim() || '1 Hr 15 mins',
          videoUrl: newLessonUrl.trim() || 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
          instructor: newLessonInstructor.trim() || 'Somanna MG',
          tag: 'SQL',
        };
        return { ...sec, lessons: [...sec.lessons, newLesson] };
      }
      return sec;
    });

    const updated = {
      ...courseCurriculums,
      [adminSelectedCourseId]: updatedSections,
    };
    saveCurriculums(updated);
    setAddingLessonToModuleId(null);
    setNewLessonTitle('');
  };

  // Admin Handler: Delete Section
  const handleDeleteSection = (moduleId: number) => {
    const existing = courseCurriculums[adminSelectedCourseId] || [];
    const updated = {
      ...courseCurriculums,
      [adminSelectedCourseId]: existing.filter((s) => s.id !== moduleId),
    };
    saveCurriculums(updated);
  };

  // Admin Handler: Delete Lesson
  const handleDeleteLesson = (moduleId: number, lessonId: number) => {
    const existing = courseCurriculums[adminSelectedCourseId] || [];
    const updated = {
      ...courseCurriculums,
      [adminSelectedCourseId]: existing.map((sec) => {
        if (sec.id === moduleId) {
          return { ...sec, lessons: sec.lessons.filter((l) => l.id !== lessonId) };
        }
        return sec;
      }),
    };
    saveCurriculums(updated);
  };

  // ==================== RENDER VIEW: COURSE CONTENT & VIDEO PLAYER (IMAGE 2) ====================
  if (selectedCourse) {
    const isCompleted = currentCourseProgress >= 100;
    return (
      <div className="space-y-5 max-w-[1700px] mx-auto pb-16 animate-in fade-in duration-200">
        {/* Top Header: Back Button + Title + Progress + Search */}
        <div className="bg-[#0c0e12] border border-[#191c24] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          {/* Back button + Course Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCourse(null)}
              className="p-2 rounded-xl bg-[#141822] hover:bg-[#1e2434] text-slate-300 hover:text-white border border-[#222938] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Courses</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {selectedCourse.title}
            </h1>
          </div>

          {/* Right Header Info: Circular Progress + Modules count + Search */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Progress Badge */}
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#1f2533" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#00c2ff"
                    strokeWidth="3"
                    strokeDasharray="94.2"
                    strokeDashoffset={94.2 - (94.2 * currentCourseProgress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[11px] font-black text-white">
                  {currentCourseProgress}%
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-black text-white block">Course content</span>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {selectedCourse.modules} modules &bull; {selectedCourse.duration}
                </span>
              </div>
            </div>

            {/* Search Lessons input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lessons"
                value={lessonSearch}
                onChange={(e) => setLessonSearch(e.target.value)}
                className="w-full bg-[#141822] border border-[#222838] focus:border-[#00c2ff] text-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl outline-none"
              />
            </div>

            {/* Admin Edit Shortcut */}
            {isAdmin && (
              <button
                onClick={() => {
                  setAdminSelectedCourseId(selectedCourse.id);
                  setShowAdminManager(true);
                }}
                className="p-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Admin: Edit Curriculum & Add Videos"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* ==================== 2-COLUMN VIEW (IMAGE 2) ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Large Video Player (7 or 8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#000000] border border-[#191c24] rounded-2xl overflow-hidden shadow-2xl relative aspect-video">
              {activeLesson ? (
                <iframe
                  src={getEmbedVideoUrl(activeLesson.videoUrl)}
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Play className="w-12 h-12 text-[#00c2ff]" />
                  <p className="text-xs">Select a lesson from the course content to start watching</p>
                </div>
              )}
            </div>

            {/* Video Title & Instructor Bar */}
            {activeLesson && (
              <div className="bg-[#0c0e12] border border-[#191c24] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {activeLesson.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeLesson.instructor || 'Somanna MG'}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                      {activeLesson.tag || 'SQL'}
                    </span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-slate-400">{activeLesson.duration}</span>
                  </div>
                </div>

                {/* Mark as Completed Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWatchLesson(activeLesson.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      watchedLessons[activeLesson.id]
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{watchedLessons[activeLesson.id] ? 'Watched ✓' : 'Mark as Watched'}</span>
                  </button>

                  {isCompleted && (
                    <button
                      onClick={() => setCertificateCourse(selectedCourse.title)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-950/40 cursor-pointer"
                    >
                      <Award className="w-4 h-4 fill-slate-950" />
                      <span>Claim Certificate</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Accordion Course Content (4 Cols) */}
          <div className="lg:col-span-4 bg-[#0c0e12] border border-[#191c24] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xl max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-[#191c24]">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Curriculum Modules ({currentSections.length})
              </span>
              <span className="text-[11px] text-slate-400">
                {currentCourseProgress}% Completed
              </span>
            </div>

            {currentSections.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No lessons match your search query.</p>
            ) : (
              currentSections.map((sec, sIdx) => {
                const isExpanded = expandedModules[sec.id] ?? (sIdx === 0);
                const totalSecDuration = sec.lessons.map((l) => l.duration).join(', ');

                return (
                  <div
                    key={sec.id}
                    className="border border-[#1e2434] rounded-xl overflow-hidden bg-[#10131b] transition-all"
                  >
                    {/* Module Accordion Header */}
                    <div
                      onClick={() =>
                        setExpandedModules((prev) => ({ ...prev, [sec.id]: !isExpanded }))
                      }
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#151924] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-black shrink-0">
                          {sIdx + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{sec.title}</h4>
                          <span className="text-[10px] text-slate-400">
                            {sec.lessons.length} lessons &bull; {sec.lessons[0]?.duration || '1 Hr'}
                          </span>
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {/* Lessons inside Module */}
                    {isExpanded && (
                      <div className="p-2 space-y-1.5 border-t border-[#191d29] bg-[#0e1118]">
                        {sec.lessons.map((lesson) => {
                          const isCurrent = activeLesson?.id === lesson.id;
                          const isWatched = watchedLessons[lesson.id];

                          return (
                            <div
                              key={lesson.id}
                              onClick={() => setActiveLesson(lesson)}
                              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isCurrent
                                  ? 'bg-blue-600/20 border border-blue-500/50 text-white shadow-sm'
                                  : 'hover:bg-[#141824] text-slate-300 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Video
                                  className={`w-4 h-4 shrink-0 ${
                                    isCurrent ? 'text-[#00c2ff]' : 'text-slate-500'
                                  }`}
                                />
                                <div className="min-w-0">
                                  <span
                                    className={`text-xs block truncate ${
                                      isCurrent ? 'font-bold text-white' : 'font-medium text-slate-300'
                                    }`}
                                  >
                                    {lesson.title}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">
                                    {lesson.duration}
                                  </span>
                                </div>
                              </div>

                              {/* Watch tick or Radio dot */}
                              <div className="shrink-0">
                                {isWatched ? (
                                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                                    <Check className="w-3 h-3" />
                                  </div>
                                ) : isCurrent ? (
                                  <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[#00c2ff]" />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-slate-700" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Certificate Modal */}
        <SkillexCertificateModal
          isOpen={!!certificateCourse}
          onClose={() => setCertificateCourse(null)}
          courseTitle={certificateCourse || ''}
          studentName={studentName}
        />
      </div>
    );
  }

  // ==================== RENDER VIEW: 3-COLUMN COURSE CARDS (IMAGE 3) ====================
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-20">
      {/* Live Class Section: Dynamic based on active live session */}
      {activeLiveClass ? (
        <div className="rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#131620] to-[#131620] border-2 border-rose-500/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl shadow-rose-950/30">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="space-y-3 z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/25 border border-rose-500/50 text-rose-300 text-xs font-black tracking-wider uppercase">
                Live Now
              </span>
              {activeLiveClass.batchName && (
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold">
                  Batch: {activeLiveClass.batchName}
                </span>
              )}
              {activeLiveClass.courseTitle && (
                <span className="hidden sm:inline px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  {activeLiveClass.courseTitle}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {activeLiveClass.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  Instructor: {activeLiveClass.instructorName}
                </span>
                {activeLiveClass.startedAt && (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Started:{' '}
                    {new Date(activeLiveClass.startedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>

            {activeLiveClass.description && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeLiveClass.description}
              </p>
            )}
          </div>

          {/* Join Live CTA Button */}
          <div className="z-10 shrink-0">
            <a
              href={activeLiveClass.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-black text-sm tracking-wide transition-all shadow-xl shadow-rose-900/50 hover:scale-[1.03] active:scale-95 group"
            >
              <Radio className="w-4 h-4 animate-pulse text-white" />
              <span>Join Live Class</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      ) : (
        /* Top Banner: No live classes currently scheduled */
        <div className="rounded-2xl bg-[#0c0e12] border border-[#191c24] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-slate-500" />
              <h2 className="text-base sm:text-lg font-black text-white">
                No live class currently scheduled
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              There are currently no active live sessions for your batch. Check back when your instructor starts a class or browse your on-demand masterclasses below.
            </p>
            <button
              onClick={() => alert('Class Schedule: Mon-Fri 10:00 AM - 1:00 PM & 3:00 PM - 6:00 PM')}
              className="mt-2 px-4 py-2 bg-[#161a24] hover:bg-[#1e2332] text-slate-200 border border-[#232938] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              View Schedule
            </button>
          </div>

          <div className="w-44 h-28 hidden sm:flex items-center justify-center relative shrink-0">
            <div className="w-36 h-24 rounded-xl bg-gradient-to-tr from-sky-500/15 to-blue-500/10 border border-sky-500/30 flex items-center justify-center text-3xl">
              💻
            </div>
          </div>
        </div>
      )}

      {/* Top Banner / Header */}
      <div className="bg-[#0c0e12] border border-[#191c24] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00c2ff]/15 border border-[#00c2ff]/30 text-[#00c2ff] text-xs font-bold">
              TAP Academy &bull; Skillex Curriculum
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
              2026 Batch Ready
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Comprehensive Course Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Master full-stack programming, databases, and problem solving. Click any course to watch recorded masterclasses and track your lesson progress.
          </p>
        </div>

        {/* Search & Admin Control */}
        <div className="flex items-center gap-3 shrink-0 relative z-10 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-[#141822] border border-[#222838] focus:border-[#00c2ff] text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl outline-none"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAdminManager(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-950/40 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Course Manager</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================== 3-COLUMN LARGE CARDS GRID (MATCHING IMAGE 3) ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const hasProgress = course.progress > 0;
          return (
            <div
              key={course.id}
              onClick={() => handleOpenCourse(course)}
              className="group bg-[#0c0e12] border border-[#191c24] hover:border-blue-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1.5 shadow-xl hover:shadow-2xl hover:shadow-black/80 relative"
            >
              {/* 16:9 Banner Image */}
              <div className="relative aspect-video w-full bg-[#141822] overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-transparent to-black/30" />

                {/* Tap Academy Top Tag */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-white flex items-center gap-1">
                  <span>TAP ACADEMY</span>
                </div>
              </div>

              {/* Course Content Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-black text-white group-hover:text-[#00c2ff] transition-colors leading-snug">
                    {course.title}
                  </h3>

                  {/* Metadata Row: 10 modules • 28 Hr 3 mins */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.modules} modules</span>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.duration}</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Progress / Ready to start + Arrow Button */}
                <div className="pt-3 border-t border-[#181c26] flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-400">
                        {hasProgress ? `${course.progress}% complete` : 'Ready to start'}
                      </span>
                    </div>

                    {hasProgress && (
                      <div className="w-full h-1.5 bg-[#1b202c] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Circular Arrow Button (↗) */}
                  <div className="w-8 h-8 rounded-full bg-[#161a24] group-hover:bg-blue-600 text-slate-300 group-hover:text-white border border-[#232938] group-hover:border-blue-500 flex items-center justify-center transition-all shrink-0 shadow-sm">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== ADMIN COURSE & MODULE CONTENT MANAGER MODAL ==================== */}
      {showAdminManager && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setShowAdminManager(false)}
        >
          <div
            className="bg-[#0c0e12] border border-[#1f2430] w-full max-w-3xl rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAdminManager(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-[#141822]"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Admin Course & Video Manager</h3>
                <p className="text-xs text-slate-400">Easily add sections, modules, and video lessons to any course</p>
              </div>
            </div>

            {/* Select Course Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Select Course to Edit</label>
              <select
                value={adminSelectedCourseId}
                onChange={(e) => setAdminSelectedCourseId(Number(e.target.value))}
                className="w-full bg-[#141822] border border-[#222838] focus:border-[#00c2ff] text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none"
              >
                {coursesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Section 1: Add New Section / Module */}
            <div className="bg-[#12151f] p-4 rounded-xl border border-[#1f2536] space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#00c2ff]" />
                <span>Add New Section / Module (e.g. Introduction, ER Diagram, CRUD)</span>
              </h4>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Section Title (e.g. CRUD Operations)"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="flex-1 bg-[#161a26] border border-[#242c3f] text-white text-xs px-3 py-2 rounded-xl outline-none focus:border-[#00c2ff]"
                />
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md"
                >
                  Add Section
                </button>
              </div>
            </div>

            {/* Existing Sections & Lessons List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Current Sections & Lessons in Course
              </h4>

              {(courseCurriculums[adminSelectedCourseId] || []).length === 0 ? (
                <p className="text-xs text-slate-500 p-4 bg-[#12151f] rounded-xl text-center">
                  No sections created yet for this course. Add one above!
                </p>
              ) : (
                (courseCurriculums[adminSelectedCourseId] || []).map((sec, sIdx) => (
                  <div
                    key={sec.id}
                    className="p-4 rounded-xl bg-[#12151f] border border-[#1f2536] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px]">
                          {sIdx + 1}
                        </span>
                        <span>{sec.title}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAddingLessonToModuleId(sec.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#1a2030] hover:bg-[#232c42] text-[#00c2ff] text-[11px] font-bold border border-[#26324a] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Video</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSection(sec.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Add Lesson Form if Active */}
                    {addingLessonToModuleId === sec.id && (
                      <div className="p-3 bg-[#161a26] border border-[#242c3f] rounded-xl space-y-2.5 animate-in fade-in">
                        <span className="text-[11px] font-bold text-slate-300 block">
                          Add Video Lesson to &quot;{sec.title}&quot;
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Lesson Title (e.g. Introduction to Database)"
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                            className="bg-[#12151f] border border-[#242c3f] text-white text-xs px-3 py-1.5 rounded-lg outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g. 1 Hr 7 mins)"
                            value={newLessonDuration}
                            onChange={(e) => setNewLessonDuration(e.target.value)}
                            className="bg-[#12151f] border border-[#242c3f] text-white text-xs px-3 py-1.5 rounded-lg outline-none"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Video URL (YouTube embed or direct link)"
                          value={newLessonUrl}
                          onChange={(e) => setNewLessonUrl(e.target.value)}
                          className="w-full bg-[#12151f] border border-[#242c3f] text-white text-xs px-3 py-1.5 rounded-lg outline-none font-mono"
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setAddingLessonToModuleId(null)}
                            className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddLesson(sec.id)}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Save Lesson
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Lessons List in Section */}
                    <div className="space-y-1.5 pl-2 border-l-2 border-[#1f2536]">
                      {sec.lessons.length === 0 ? (
                        <p className="text-[11px] text-slate-500 py-1">No video lessons in this section yet.</p>
                      ) : (
                        sec.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="p-2 rounded-lg bg-[#161a26] flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Video className="w-3.5 h-3.5 text-[#00c2ff] shrink-0" />
                              <span className="font-semibold text-slate-200 truncate">
                                {lesson.title}
                              </span>
                              <span className="text-[10px] text-slate-500 shrink-0">
                                ({lesson.duration})
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(sec.id, lesson.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors shrink-0"
                              title="Delete Lesson"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAdminManager(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Done Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
