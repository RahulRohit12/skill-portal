import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Search,
  ChevronRight,
  Play,
  X,
  ExternalLink,
  Sparkles,
  Calendar,
  Radio,
  User
} from 'lucide-react';
import api from '../api/client';
import { CourseSummary, LiveClassItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { getEmbedVideoUrl } from '../utils/videoUtils';

interface CourseCardItem {
  id: number;
  title: string;
  modules: number;
  duration: string;
  thumbnail: string;
  category: string;
}

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [activeLiveClass, setActiveLiveClass] = useState<LiveClassItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<any | null>(null);
  const [activeCourseModal, setActiveCourseModal] = useState<any | null>(null);
  const [playingVideo, setPlayingVideo] = useState<{ title: string; videoUrl: string } | null>(null);

  // Fallback reference courses matching the exact cards shown in user's image
  const defaultCourses: CourseCardItem[] = [
    {
      id: 1,
      title: 'Hibernate',
      modules: 6,
      duration: '7 Hr 39 mins',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      category: 'Backend',
    },
    {
      id: 2,
      title: 'Springs',
      modules: 8,
      duration: '3 Hr 51 mins',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      category: 'Backend',
    },
    {
      id: 3,
      title: 'Advanced JAVA',
      modules: 3,
      duration: '20 Hr 34 mins',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      category: 'Java',
    },
    {
      id: 4,
      title: 'Data Structures and Algorithm - Java',
      modules: 14,
      duration: '51 Hr 28 mins',
      thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&auto=format&fit=crop&q=80',
      category: 'DSA',
    },
    {
      id: 5,
      title: 'HTML and CSS',
      modules: 2,
      duration: '18 Hr 5 mins',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&auto=format&fit=crop&q=80',
      category: 'Frontend',
    },
    {
      id: 6,
      title: 'Python',
      modules: 30,
      duration: '52 Hr 54 mins',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80',
      category: 'Programming',
    },
    {
      id: 7,
      title: 'Data Structures and Algorithm - Python',
      modules: 14,
      duration: '50 Hr 3 mins',
      thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80',
      category: 'DSA',
    },
    {
      id: 8,
      title: 'MySQL',
      modules: 10,
      duration: '28 Hr 3 mins',
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
      category: 'Database',
    },
    {
      id: 9,
      title: 'Aptitude',
      modules: 12,
      duration: '23 Hr 35 mins',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
      category: 'Aptitude',
    },
    {
      id: 10,
      title: 'Notes',
      modules: 9,
      duration: '0 mins',
      thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
      category: 'Notes',
    },
    {
      id: 11,
      title: 'Javascript',
      modules: 41,
      duration: '41 Hr 1 mins',
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&auto=format&fit=crop&q=80',
      category: 'Frontend',
    },
    {
      id: 12,
      title: 'Projects',
      modules: 3,
      duration: '17 Hr 46 mins',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      category: 'Projects',
    },
  ];

  // Helper to generate a complete educational curriculum with working YouTube video links
  const getDefaultCurriculum = (title: string) => {
    let videoUrl = 'https://www.youtube.com/watch?v=eIrMbG46SuE';
    if (title.includes('Hibernate')) videoUrl = 'https://www.youtube.com/watch?v=Yv2xctJxE-w';
    else if (title.includes('Spring')) videoUrl = 'https://www.youtube.com/watch?v=35EQXmHKZYs';
    else if (title.includes('Advanced JAVA')) videoUrl = 'https://www.youtube.com/watch?v=A74TOX803D0';
    else if (title.includes('Java')) videoUrl = 'https://www.youtube.com/watch?v=BBpAmxU_NQo';
    else if (title.includes('Python')) videoUrl = 'https://www.youtube.com/watch?v=xk4_1vDrzzo';
    else if (title.includes('HTML')) videoUrl = 'https://www.youtube.com/watch?v=mU6anWqZJcc';
    else if (title.includes('MySQL')) videoUrl = 'https://www.youtube.com/watch?v=7S_tz1z_5bA';
    else if (title.includes('Javascript')) videoUrl = 'https://www.youtube.com/watch?v=W6NZfCO5SIk';
    else if (title.includes('Projects')) videoUrl = 'https://www.youtube.com/watch?v=5pd278OGTv4';

    return {
      title,
      subjects: [
        {
          id: 101,
          title: 'Section 1: Fundamentals & Environment Setup',
          modules: [
            {
              id: 201,
              title: 'Module 1: Architecture & Core Mechanics',
              topics: [
                {
                  id: 1,
                  title: `${title} - Introduction & Execution Lifecycle`,
                  durationMinutes: 45,
                  videoUrl,
                  hasVideo: true,
                },
                {
                  id: 1,
                  title: `${title} - Configuration, Annotations & Components`,
                  durationMinutes: 50,
                  videoUrl,
                  hasVideo: true,
                }
              ]
            },
            {
              id: 202,
              title: 'Module 2: Real-World Implementation & Deep Dive',
              topics: [
                {
                  id: 1,
                  title: `${title} - Production Best Practices & Patterns`,
                  durationMinutes: 60,
                  videoUrl,
                  hasVideo: true,
                }
              ]
            }
          ]
        }
      ]
    };
  };

  const fetchLiveClass = async () => {
    try {
      const res = await api.get('/live-classes/active');
      if (res.data?.data) {
        setActiveLiveClass(res.data.data);
      } else {
        setActiveLiveClass(null);
      }
    } catch (e) {
      console.error('Failed to load active live class for student', e);
      setActiveLiveClass(null);
    }
  };

  useEffect(() => {
    api.get('/courses')
      .then((res) => {
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setCourses(res.data.data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));

    fetchLiveClass();
    const interval = setInterval(fetchLiveClass, 15000);
    return () => clearInterval(interval);
  }, []);

  // Merge backend courses with default course catalog
  const displayCourses: CourseCardItem[] = defaultCourses.map((def, idx) => {
    const matched = courses[idx];
    if (matched) {
      return {
        id: matched.id,
        title: matched.title || def.title,
        modules: matched.topicCount || def.modules,
        duration: def.duration,
        thumbnail: matched.thumbnailUrl || def.thumbnail,
        category: def.category,
      };
    }
    return def;
  });

  const filteredCourses = displayCourses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCourse = (c: CourseCardItem) => {
    api.get(`/courses/${c.id}`)
      .then((res) => {
        const data = res.data?.data;
        if (data && data.subjects && data.subjects.length > 0) {
          setActiveCourseModal(data);
        } else {
          setActiveCourseModal(getDefaultCurriculum(c.title));
        }
      })
      .catch(() => {
        setActiveCourseModal(getDefaultCurriculum(c.title));
      });
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading course library..." />;
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Page Heading */}
      <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
        Courses
      </h1>

      {/* Live Class Section: Dynamic based on active live session */}
      {activeLiveClass ? (
        <div className="rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#131620] to-[#131620] border-2 border-rose-500/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl shadow-rose-950/30">
          {/* Subtle glowing animated backdrop */}
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
        <div className="rounded-2xl bg-[#131620] border border-[#1f2432] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-slate-500" />
              <h2 className="text-base sm:text-lg font-black text-white">
                No live class currently scheduled
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-lg">
              There are currently no active live sessions for your batch. Check back when your instructor starts a class or browse our on-demand courses below.
            </p>
            <button
              onClick={() => alert('Class Schedule: Mon-Fri 10:00 AM - 1:00 PM & 3:00 PM - 6:00 PM')}
              className="mt-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              View Schedule
            </button>
          </div>

          {/* Right Illustration */}
          <div className="w-44 h-28 hidden sm:flex items-center justify-center relative shrink-0">
            <div className="w-36 h-24 rounded-xl bg-gradient-to-tr from-sky-500/20 to-blue-500/10 border border-sky-500/30 flex items-center justify-center text-3xl">
              💻
            </div>
          </div>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for course"
          className="w-full bg-[#12151c] border border-[#1e2330] focus:border-[#00b4d8] text-slate-100 text-xs pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      {/* 6-Column Responsive Course Cards Grid (Matching Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredCourses.map((c) => (
          <div
            key={c.id}
            onClick={() => handleOpenCourse(c)}
            className="group bg-[#12151c] border border-[#1e2330] hover:border-[#2f394c] rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 shadow-sm"
          >
            {/* Course Thumbnail Banner */}
            <div className="relative h-28 w-full bg-[#161922] overflow-hidden">
              <img
                src={c.thumbnail}
                alt={c.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12151c] via-transparent to-black/20" />
            </div>

            {/* Course Content Info */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-xs font-black text-white group-hover:text-[#38bdf8] transition-colors line-clamp-1">
                  {c.title}
                </h3>

                {/* Modules & Duration Metadata */}
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    <span>{c.modules} modules</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{c.duration}</span>
                  </span>
                </div>
              </div>

              {/* Action Link: Get Started -> */}
              <div className="pt-2 border-t border-[#1a1f2c] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#38bdf8] group-hover:text-sky-300 transition-colors flex items-center gap-1">
                  <span>Get Started</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Curriculum Hierarchy & Recorded Class Preview Modal */}
      {activeCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#12151c] border border-[#1f2430] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#161922] border-b border-[#1f2430] flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">{activeCourseModal.title}</h3>
                <span className="text-xs text-slate-400">Curriculum & Recorded Sessions</span>
              </div>
              <button
                onClick={() => setActiveCourseModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>


            {/* Modules List */}
            <div className="p-6 overflow-y-auto space-y-4">
              {activeCourseModal.subjects?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No modules published yet for this course.</p>
              ) : (
                activeCourseModal.subjects?.map((sub: any) => (
                  <div key={sub.id} className="space-y-2">
                    <h4 className="text-xs font-black text-[#38bdf8] uppercase tracking-wider">
                      {sub.title}
                    </h4>
                    <div className="space-y-2">
                      {sub.modules?.map((m: any) => (
                        <div key={m.id} className="p-3.5 bg-[#161922] border border-[#1f2430] rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                            <span>{m.title}</span>
                            <span className="text-[10px] text-slate-400">{m.topics?.length || 0} Lessons</span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            {m.topics?.map((t: any, tIdx: number) => (
                              <div
                                key={t.id || tIdx}
                                className="p-2.5 bg-[#12151c] rounded-lg flex items-center justify-between text-xs hover:bg-[#181c26] transition-colors gap-3"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Play className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                                  <span className="text-slate-200 font-medium truncate">{t.title}</span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => setPlayingVideo({
                                      title: t.title,
                                      videoUrl: t.videoUrl || 'https://www.youtube.com/watch?v=eIrMbG46SuE'
                                    })}
                                    className="px-3 py-1 bg-[#38bdf8] hover:bg-sky-400 text-slate-950 rounded-lg text-[11px] font-black transition-colors flex items-center gap-1 shadow-sm"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>Play Video</span>
                                  </button>

                                  <Link
                                    to={`/topics/${t.id || 1}`}
                                    className="px-2.5 py-1 bg-[#181c26] hover:bg-[#222838] border border-[#2a3040] text-slate-300 rounded-lg text-[11px] font-bold transition-colors"
                                  >
                                    Full Notes
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instant Video Stream Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#12151c] border-b border-[#1f2430] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#00c2ff] fill-current" />
                <h3 className="font-black text-sm text-white truncate max-w-lg">{playingVideo.title}</h3>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-[#181c26] border border-[#263147] transition-colors"
                title="Close Video"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={getEmbedVideoUrl(playingVideo.videoUrl)}
                title={playingVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="p-4 pt-0 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recorded Class Streaming Live</span>
              </span>
              <a
                href={playingVideo.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#00c2ff] hover:underline flex items-center gap-1 font-semibold transition-colors"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
