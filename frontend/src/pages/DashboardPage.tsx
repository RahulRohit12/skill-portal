import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Clock,
  CheckCircle2,
  Share2,
  Briefcase,
  Star,
  ChevronRight,
  Sparkles,
  Award,
  AlertCircle,
  ExternalLink,
  Code2,
  BookOpen,
  QrCode,
  Zap,
  Trophy,
  ArrowUpRight,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StudentQrModal } from '../components/attendance/StudentQrModal';
import { DashboardAttendanceMatrix } from '../components/attendance/DashboardAttendanceMatrix';

interface LeaderboardItem {
  rank: number;
  name: string;
  points: number;
  initial: string;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Student metrics state
  const [studentStats, setStudentStats] = useState({
    practiceDays: 14,
    currentStreak: 3,
    longestStreak: 4,
    correctSubmissions: 478,
    courseProgress: 1,
    assignmentProgress: 20,
    testProgress: 20,
    resumeTitle: 'Programming',
    resumeProgress: 88,
    eligibleDrives: 63,
    appliedDrives: 3,
    appliedPercent: 5,
    skills: 'Core Java',
  });

  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [heroSlide, setHeroSlide] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);

  // Live Leaderboard data from backend database with fallback
  const [topStudents, setTopStudents] = useState<LeaderboardItem[]>([
    { rank: 1, name: 'Pasupathi M', points: 9871, initial: 'P' },
    { rank: 2, name: 'Fakkirappa S', points: 9807, initial: 'F' },
    { rank: 3, name: 'Darshan Patil', points: 9803, initial: 'D' },
    { rank: 4, name: 'Gunavathi', points: 9756, initial: 'G' },
    { rank: 5, name: 'Ankita', points: 9643, initial: 'A' },
    { rank: 6, name: 'Ashwini K', points: 9608, initial: 'A' },
    { rank: 7, name: 'Akshata Sanjeev', points: 9605, initial: 'A' },
    { rank: 8, name: 'R Gopika Sri', points: 9574, initial: 'R' },
    { rank: 9, name: 'Supraja', points: 9569, initial: 'S' },
    { rank: 10, name: 'Nagulapally', points: 9505, initial: 'N' },
  ]);

  useEffect(() => {
    // 1. Fetch live leaderboard updated in real time from coding submissions
    api.get('/dashboard')
      .then((dRes) => {
        const top = dRes.data?.data?.leaderboard?.topStudents;
        if (Array.isArray(top) && top.length > 0) {
          const live: LeaderboardItem[] = top.map((item: any, idx: number) => ({
            rank: item.rank || idx + 1,
            name: item.name || 'Student',
            points: item.points != null ? item.points : 0,
            initial: (item.name || 'S').trim().charAt(0).toUpperCase(),
          }));
          if (live.length >= 3) {
            setTopStudents(live);
          } else {
            setTopStudents((prev) => {
              const merged = [...live];
              for (let i = live.length; i < prev.length; i++) {
                merged.push({ ...prev[i], rank: i + 1 });
              }
              return merged;
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Real-time leaderboard fetch notice:', err);
      });

    // 2. Fetch live personalized dashboard & statistics
    api.get('/student/dashboard')
      .then((res) => {
        let map: Record<string, number> = {};

        if (res.data?.data) {
          const sData = res.data.data;
          const stats = sData.statistics || {};
          setStudentStats((prev) => ({
            ...prev,
            practiceDays: stats.practiceDays || prev.practiceDays,
            currentStreak: stats.currentStreak || prev.currentStreak,
            longestStreak: stats.longestStreak || prev.longestStreak,
            correctSubmissions: stats.problemsSolved || prev.correctSubmissions,
            courseProgress: Math.round(stats.courseProgressPercentage || stats.courseProgress || prev.courseProgress),
            assignmentProgress: Math.round(stats.overallPercentage || prev.assignmentProgress),
            testProgress: Math.round(stats.testAveragePercentage || prev.testProgress),
            resumeTitle: sData.resumeLearning?.topicTitle || prev.resumeTitle,
            resumeProgress: Math.round(sData.resumeLearning?.watchedPercentage || prev.resumeProgress),
          }));

          if (Array.isArray(sData.activityHeatmap)) {
            sData.activityHeatmap.forEach((item: { date: string; count: number }) => {
              if (item && item.date) map[item.date] = item.count;
            });
          }
        }

        setHeatmapData(map);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Helper to render Segmented progress dash bars with 3D glow
  const renderDashBar = (percentage: number) => {
    const totalSegments = 16;
    const filledSegments = Math.round((percentage / 100) * totalSegments);

    return (
      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0d1017]/80 border border-white/[0.04]">
        {Array.from({ length: totalSegments }).map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-4 rounded-[2px] transition-all duration-300 ${
              idx < filledSegments
                ? 'bg-gradient-to-t from-[#00b4d8] to-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.5)] scale-y-105'
                : 'bg-[#181d28]'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && !studentStats) {
    return <LoadingSpinner fullPage message="Loading your student learning dashboard..." />;
  }

  const studentDisplayName = user?.fullName || 'Prajwal';

  return (
    <div className="space-y-7 max-w-[1550px] mx-auto pb-14 animate-in fade-in duration-300">
      {/* 1. HERO 3D WELCOME & PLACEMENT SPOTLIGHT BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0d111a] via-[#131826] to-[#0f1422] border border-white/[0.08] p-6 sm:p-8 overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] group">
        {/* Specular Top Reflection Line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        
        {/* Ambient Radial Lighting Effect */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-sky-500/10 blur-[90px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Student Personalized Greeting & Quick Stats */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-950/80 to-sky-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>SkillX Intelligence Hub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-[#38bdf8] via-[#00c2ff] to-[#60a5fa] bg-clip-text text-transparent">{studentDisplayName}</span>! 🚀
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              You are currently on a <strong className="text-amber-400 font-extrabold">{studentStats.currentStreak}-day coding streak</strong>. Continue solving problems to boost your batch employability score!
            </p>

            {/* Quick 3D Stat Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-bold text-slate-200 shadow-sm">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span>{studentStats.currentStreak} Days Streak</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-bold text-slate-200 shadow-sm">
                <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
                <span>Top 10% Batch</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-bold text-slate-200 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                <span>{studentStats.correctSubmissions} Solved</span>
              </div>
            </div>
          </div>

          {/* Right: Placed Students Spotlight with 3D Ring Cards */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-2xl bg-[#0e121c]/80 border border-white/[0.06] shadow-xl w-full lg:w-auto">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold tracking-widest text-[#ec4899] uppercase">
                  TCS · INFOSYS · WIPRO
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Recent Placements
              </h3>
              <p className="text-[11px] text-slate-400">
                2,500+ tech placements this year
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-3.5 overflow-hidden p-1">
                {[
                  { name: 'Rahul S.', company: 'TCS', bg: 'from-sky-500 to-blue-600' },
                  { name: 'Pooja V.', company: 'Infosys', bg: 'from-emerald-500 to-teal-600' },
                  { name: 'Amit K.', company: 'Capgemini', bg: 'from-cyan-500 to-blue-600' },
                  { name: 'Sneha R.', company: 'Accenture', bg: 'from-amber-500 to-orange-600' },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`w-11 h-11 rounded-full bg-gradient-to-tr ${s.bg} border-2 border-[#121624] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-black/60 hover:scale-110 hover:z-20 transition-transform duration-200 cursor-pointer`}
                    title={`${s.name} (${s.company})`}
                  >
                    {s.name[0]}
                  </div>
                ))}
              </div>

              <Link
                to="/courses"
                className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-200"
                title="View Course Roadmap"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Slider Dots */}
        <div className="flex items-center justify-center gap-2 pt-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                heroSlide === i ? 'w-8 bg-gradient-to-r from-cyan-400 to-sky-400 shadow-[0_0_8px_#00c2ff]' : 'w-2 bg-slate-700/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. FOUR 3D HOLOGRAPHIC METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Practice Streak */}
        <div className="glass-panel-3d rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Practice Streak
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 fill-amber-400/20" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {studentStats.currentStreak}
            </span>
            <span className="text-xs font-bold text-amber-400">DAYS ACTIVE</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.04] pt-2.5">
            <span>Longest: {studentStats.longestStreak} days</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
        </div>

        {/* Card 2: Problems Solved */}
        <div className="glass-panel-3d rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Problems Solved
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00c2ff] shadow-[0_0_15px_rgba(0,194,255,0.25)] group-hover:scale-110 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {studentStats.correctSubmissions}
            </span>
            <span className="text-xs font-bold text-cyan-400">VERIFIED PASS</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.04] pt-2.5">
            <span>Java & Data Structures</span>
            <span className="text-cyan-400 font-semibold">100% Automated</span>
          </div>
        </div>

        {/* Card 3: Course Progress */}
        <div className="glass-panel-3d rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Course Progress
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {studentStats.assignmentProgress}%
            </span>
            <span className="text-xs font-bold text-emerald-400">CURRICULUM</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.04] pt-2.5">
            <span>Module: Programming</span>
            <Link to="/assignments" className="text-sky-400 hover:underline flex items-center gap-0.5">
              Open <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Placement Drives */}
        <div className="glass-panel-3d rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Placement Drives
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {studentStats.eligibleDrives}
            </span>
            <span className="text-xs font-bold text-indigo-400">ELIGIBLE JOBS</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.04] pt-2.5">
            <span>{studentStats.appliedDrives} Applications sent</span>
            <Link to="/jobs" className="text-indigo-400 hover:underline flex items-center gap-0.5">
              Explore <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. CLASSROOM QR ATTENDANCE 3D STRIP */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0a101b] via-[#101726] to-[#0a101b] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_15px_30px_-5px_rgba(0,194,255,0.15)] relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-950 via-sky-950 to-cyan-900 border border-cyan-500/50 flex items-center justify-center text-[#00c2ff] shrink-0 shadow-[0_0_20px_rgba(0,194,255,0.35)] group-hover:rotate-6 transition-transform">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-white">
                Classroom Attendance Identity QR
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 text-[10px] font-black border border-emerald-800/60">
                ACTIVE STUDENT ID
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Present your encrypted QR code to the instructor scanner for immediate presence verification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/attendance"
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-bold transition-all border border-white/[0.08]"
          >
            Monthly Log
          </Link>
          <button
            onClick={() => setShowQrModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00b4d8] via-[#00c2ff] to-[#38bdf8] hover:from-[#38bdf8] hover:to-[#00b4d8] text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,194,255,0.4)] hover:scale-[1.02]"
          >
            <QrCode className="w-4 h-4" />
            <span>Show My QR</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN 2-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: My Learning, Practice Streak & Drives (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: My Learning Centerpiece */}
          <div className="glass-panel-3d rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  My Learning Progress
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Continuous skill mastery breakdown
                </span>
              </div>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-1 rounded-full">
                Active Term
              </span>
            </div>

            {/* Segmented Dash Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pb-6 border-b border-white/[0.06]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-semibold">Courses</span>
                  <span className="text-xs font-bold text-white">{studentStats.courseProgress}%</span>
                </div>
                {renderDashBar(studentStats.courseProgress)}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-semibold">Assignments</span>
                  <span className="text-xs font-bold text-cyan-400">{studentStats.assignmentProgress}%</span>
                </div>
                {renderDashBar(studentStats.assignmentProgress)}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-semibold">Tests</span>
                  <span className="text-xs font-bold text-white">{studentStats.testProgress}%</span>
                </div>
                {renderDashBar(studentStats.testProgress)}
              </div>
            </div>

            {/* Resume In-Progress Box (3D Floating Container) */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#141926] via-[#171e2e] to-[#121622] border border-white/[0.08] p-5 rounded-2xl shadow-lg">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-[#00c2ff] tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00c2ff] shadow-[0_0_8px_#00c2ff]" />
                  CURRENT ASSIGNMENT MODULE
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {studentStats.resumeTitle}: Arrays & Kadane's Algorithm
                </h4>
                <p className="text-xs text-slate-400">
                  Pick up where you left off with automated Java compiler testing
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {/* 3D Circular Progress Meter */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 p-0.5" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#222b3d" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#00c2ff"
                      strokeWidth="3.2"
                      strokeDasharray="94.2"
                      strokeDashoffset={94.2 - (94.2 * studentStats.resumeProgress) / 100}
                      strokeLinecap="round"
                      className="filter drop-shadow-[0_0_8px_rgba(0,194,255,0.6)]"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-white">
                    {studentStats.resumeProgress}%
                  </span>
                </div>

                <Link
                  to="/assignments"
                  className="px-4 py-2 rounded-xl bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,194,255,0.4)] hover:scale-105"
                >
                  <span>Resume</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card: Classroom Attendance Matrix */}
          <DashboardAttendanceMatrix onOpenQrModal={() => setShowQrModal(true)} />

          {/* Bottom Grid: Placement Drives & Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Placement Drives Card */}
            <div className="glass-panel-3d rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-white">Placement Drives</h4>
                <Briefcase className="w-4 h-4 text-cyan-400" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-200 text-sm shadow-sm">
                    💼
                  </div>
                  <div>
                    <span className="text-lg font-black text-white block leading-tight">
                      {studentStats.eligibleDrives}
                    </span>
                    <span className="text-[10px] text-slate-400">Eligible drives</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-lg font-black text-white block leading-tight">
                      {studentStats.appliedDrives}
                    </span>
                    <span className="text-[10px] text-slate-400">Applied</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="w-full bg-[#181d28] h-2 rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                  <div className="bg-gradient-to-r from-cyan-400 to-sky-400 h-full rounded-full w-[15%] shadow-[0_0_8px_#00c2ff]" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-1.5">
                  {studentStats.appliedPercent}% applied across tech drives
                </span>
              </div>
            </div>

            {/* Skills Acquired Card */}
            <div className="glass-panel-3d rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-white">Skills Verified</h4>
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                  1 Core Skill
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h5 className="text-sm font-extrabold text-white mb-1">
                    {studentStats.skills}
                  </h5>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-950 to-sky-950 text-cyan-300 text-[10px] font-black tracking-wider uppercase border border-cyan-800/50 shadow-sm">
                  CERTIFIED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D Esports Leaderboard Podium (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel-3d rounded-3xl p-6 shadow-xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 border-b border-white/[0.06] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white tracking-tight">
                    Live Leaderboard
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-xs text-slate-400">
                  Real-time points from problem submissions
                </span>
              </div>
              <button
                className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                title="Share Leaderboard"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* 3D Isometric Esports Podium for Top 3 */}
            <div className="pt-6 pb-2 flex items-end justify-center gap-3">
              {/* 2nd Place (Silver, Left) */}
              <div className="flex flex-col items-center flex-1 max-w-[110px] group">
                <div className="relative mb-2.5 flex flex-col items-center">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#2d3748] to-[#1a202c] border-2 border-slate-300 flex items-center justify-center text-slate-100 font-black text-sm shadow-[0_0_15px_rgba(203,213,225,0.3)]">
                    {topStudents[1]?.initial || '2'}
                  </div>
                  <span className="text-[11px] font-extrabold text-white mt-1.5 text-center truncate max-w-[90px]">
                    {topStudents[1]?.name || 'Student'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {topStudents[1]?.points || 0} pts
                  </span>
                </div>

                {/* 3D Silver Pedestal */}
                <div className="w-full h-24 rounded-t-2xl podium-silver-3d flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <span className="text-3xl font-black text-white/90 drop-shadow-md">2</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">SILVER</span>
                </div>
              </div>

              {/* 1st Place (Gold, Center, Tallest) */}
              <div className="flex flex-col items-center flex-1 max-w-[125px] -mt-8 group">
                <div className="relative mb-2.5 flex flex-col items-center">
                  <div className="text-2xl -mb-1 animate-bounce">👑</div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#78350f] via-[#b45309] to-[#d97706] border-2 border-amber-300 flex items-center justify-center text-amber-100 font-black text-lg shadow-[0_0_25px_rgba(251,191,36,0.45)]">
                    {topStudents[0]?.initial || '1'}
                  </div>
                  <span className="text-xs font-black text-white mt-1.5 text-center truncate max-w-[105px]">
                    {topStudents[0]?.name || 'Champion'}
                  </span>
                  <span className="text-[10px] font-black text-amber-300">
                    {topStudents[0]?.points || 0} pts
                  </span>
                </div>

                {/* 3D Gold Pedestal */}
                <div className="w-full h-36 rounded-t-2xl podium-gold-3d flex flex-col items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-200">
                  <span className="text-4xl font-black text-white drop-shadow-lg">1</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">CHAMPION</span>
                </div>
              </div>

              {/* 3rd Place (Bronze, Right) */}
              <div className="flex flex-col items-center flex-1 max-w-[110px] group">
                <div className="relative mb-2.5 flex flex-col items-center">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#431407] to-[#1c1917] border-2 border-orange-500 flex items-center justify-center text-orange-200 font-black text-sm shadow-[0_0_15px_rgba(234,88,12,0.3)]">
                    {topStudents[2]?.initial || '3'}
                  </div>
                  <span className="text-[11px] font-extrabold text-white mt-1.5 text-center truncate max-w-[90px]">
                    {topStudents[2]?.name || 'Student'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {topStudents[2]?.points || 0} pts
                  </span>
                </div>

                {/* 3D Bronze Pedestal */}
                <div className="w-full h-20 rounded-t-2xl podium-bronze-3d flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <span className="text-2xl font-black text-white/90 drop-shadow-md">3</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-200">BRONZE</span>
                </div>
              </div>
            </div>

            {/* Ranks 4 to 10 List */}
            <div className="divide-y divide-white/[0.04] text-xs pt-3 mt-2 border-t border-white/[0.06]">
              {topStudents.slice(3, 10).map((item) => (
                <div
                  key={item.rank}
                  className="py-2.5 px-3 flex items-center justify-between hover:bg-white/[0.04] rounded-xl transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-black text-slate-500 text-center text-xs group-hover:text-cyan-400 transition-colors">
                      #{item.rank}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] text-slate-200 text-xs font-bold flex items-center justify-center group-hover:scale-105 transition-transform">
                      {item.initial}
                    </div>
                    <span className="font-bold text-slate-200 group-hover:text-white transition-colors">
                      {item.name}
                    </span>
                  </div>

                  <span className="font-mono font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded-lg">
                    {item.points.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Official Student QR Identity Modal */}
      <StudentQrModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />
    </div>
  );
};
