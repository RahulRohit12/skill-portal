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
  GraduationCap
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StudentQrModal } from '../components/attendance/StudentQrModal';
import { DashboardAttendanceMatrix } from '../components/attendance/DashboardAttendanceMatrix';
import { PracticeStreak } from '../components/dashboard/PracticeStreak';


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
    api.get('/dashboard').then((dRes) => {
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
    }).catch((err) => {
      console.warn('Real-time leaderboard fetch notice:', err);
    });

    // 2. Fetch live personalized dashboard & statistics
    api.get('/student/dashboard').then((res) => {
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
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // Helper to render Segmented progress dash bars
  const renderDashBar = (percentage: number) => {
    const totalSegments = 16;
    const filledSegments = Math.round((percentage / 100) * totalSegments);

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: totalSegments }).map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-3.5 rounded-[2px] ${
              idx < filledSegments
                ? 'bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                : 'bg-[#1a202c]'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && !studentStats) {
    return <LoadingSpinner fullPage message="Loading your student learning dashboard..." />;
  }

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12">
      {/* 1. HERO TOP BANNER (Personalized Student Welcome & Big SKILLEX ACADEMY Branding) */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#070b14] via-[#0d1527] to-[#0a1222] border-2 border-cyan-500/25 p-7 sm:p-9 overflow-hidden shadow-2xl shadow-cyan-950/30">
        {/* Ambient glowing cyber light effects */}
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: SKILLEX ACADEMY Big Display + Personalized Welcome */}
          <div className="space-y-4">
            {/* Big SKILLEX ACADEMY display header matching login page typography */}
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 border border-cyan-300/40 shrink-0">
                <GraduationCap className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white flex items-center leading-none">
                  <span>SKILL</span>
                  <span className="text-[#00c2ff] text-4xl sm:text-6xl lg:text-7xl font-black drop-shadow-[0_0_30px_rgba(0,194,255,1)] mx-0.5 sm:mx-1">
                    X
                  </span>
                  <span className="ml-1 sm:ml-2 font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400 text-2xl sm:text-4xl lg:text-5xl">
                    ACADEMY
                  </span>
                </h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 text-[10px] sm:text-xs font-black border border-cyan-800/60 uppercase tracking-widest">
                    STUDENT LEARNING & PLACEMENT PORTAL
                  </span>
                  <span className="hidden sm:inline text-slate-500">•</span>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-400">
                    BATCH 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Personalized Welcome Header for logged-in student */}
            <div className="pt-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex flex-wrap items-center gap-2.5">
                <span>Welcome back,</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-400 underline decoration-cyan-500/40 underline-offset-4">
                  {user?.fullName || 'Student'}
                </span>
                <span className="text-2xl sm:text-3xl">👋</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300/90 mt-1.5 max-w-2xl leading-relaxed">
                Stay consistent with your daily coding practice, complete pending assignments, and push your placement readiness score to the top!
              </p>
            </div>
          </div>

          {/* Right: Key Performance Badges & Quick Live Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 shrink-0">
            {/* Current Streak Badge */}
            <div className="px-4 py-3.5 rounded-2xl bg-[#0f1626]/90 border border-amber-500/30 shadow-lg flex items-center gap-3 min-w-[140px]">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Flame className="w-5 h-5 fill-amber-400 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block leading-tight">Daily Streak</span>
                <span className="text-base font-black text-amber-300">
                  {studentStats.currentStreak} Days 🔥
                </span>
              </div>
            </div>

            {/* Problems Solved Badge */}
            <div className="px-4 py-3.5 rounded-2xl bg-[#0f1626]/90 border border-cyan-500/30 shadow-lg flex items-center gap-3 min-w-[140px]">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00c2ff] shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block leading-tight">Problems Solved</span>
                <span className="text-base font-black text-cyan-300">
                  {studentStats.correctSubmissions} Solved
                </span>
              </div>
            </div>

            {/* Live Class Schedule Shortcut */}
            <div className="px-4 py-3.5 rounded-2xl bg-[#0f1626]/90 border border-emerald-500/30 shadow-lg flex items-center gap-3 min-w-[150px]">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold leading-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Classes Active</span>
                </div>
                <Link
                  to="/courses"
                  className="text-xs font-black text-slate-200 hover:text-cyan-300 transition-colors flex items-center gap-1 mt-0.5"
                >
                  <span>View Schedule</span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classroom QR Attendance Quick Access Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d131f] via-[#101826] to-[#0d131f] border border-[#1d273a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-cyan-950/20">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-[#00c2ff] shrink-0 shadow-md shadow-cyan-950/40">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-white">
                Classroom Attendance QR
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 text-[10px] font-bold border border-emerald-800/50">
                Verified System
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Present your unique, encrypted student QR identity to the instructor scanner for rapid check-in.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/attendance"
            className="px-3.5 py-2 rounded-xl bg-[#141a27] hover:bg-[#1a2334] text-slate-300 hover:text-white text-xs font-bold transition-all border border-[#222c3f]"
          >
            Monthly Calendar
          </Link>
          <button
            onClick={() => setShowQrModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0096c7] hover:from-[#00c2ff] hover:to-[#00b4d8] text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Show My QR</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: My Learning, Practice Streak & Drives (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: My Learning */}
          <div className="bg-[#12151c] border border-[#1e2330] rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-sm text-white">
                My Learning
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Pick up where you left off
              </span>
            </div>

            {/* Segmented Dash Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-[#1b202a]">
              <div>
                <span className="text-xs text-slate-400 block mb-2 font-medium">Courses</span>
                <div className="flex items-center gap-3">
                  {renderDashBar(studentStats.courseProgress)}
                  <span className="text-xs font-bold text-slate-200">{studentStats.courseProgress}%</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-2 font-medium">Assignments</span>
                <div className="flex items-center gap-3">
                  {renderDashBar(studentStats.assignmentProgress)}
                  <span className="text-xs font-bold text-slate-200">{studentStats.assignmentProgress}%</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-2 font-medium">Tests</span>
                <div className="flex items-center gap-3">
                  {renderDashBar(studentStats.testProgress)}
                  <span className="text-xs font-bold text-slate-200">{studentStats.testProgress}%</span>
                </div>
              </div>
            </div>

            {/* Resume In-Progress Box */}
            <div className="mt-5 flex items-center justify-between bg-[#151922] border border-[#1f2533] p-4 rounded-xl">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-[#38bdf8] tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                  ASSIGNMENT
                </span>
                <h4 className="text-sm font-bold text-white">
                  {studentStats.resumeTitle}
                </h4>
              </div>

              <div className="flex items-center gap-4">
                {/* Circular Progress Meter */}
                <div className="relative w-11 h-11 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#1e2330"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      strokeDasharray="94.2"
                      strokeDashoffset={94.2 - (94.2 * studentStats.resumeProgress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-white">
                    {studentStats.resumeProgress}%
                  </span>
                </div>

                <Link
                  to="/assignments"
                  className="text-xs font-bold text-[#38bdf8] hover:text-sky-300 transition-colors flex items-center gap-1"
                >
                  <span>Resume</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Practice Streak Heatmap (Matching Image 1) */}
          <PracticeStreak
            initialCurrentStreak={8}
            initialLongestStreak={8}
            initialTotalSubmissions={495}
          />

        </div>

        {/* RIGHT COLUMN: Leaderboard with 3D Podium & Rankings (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#12151c] border border-[#1e2330] rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  Leaderboard
                </h3>
                <span className="text-xs text-slate-400">
                  Overall top performers
                </span>
              </div>
              <button
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Share Leaderboard"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* 3D Podium for Top 3 */}
            <div className="pt-8 pb-4 flex items-end justify-center gap-3">
              {/* 2nd Place (Silver, Left) */}
              <div className="flex flex-col items-center flex-1 max-w-[110px]">
                {/* Silver Wreath Avatar */}
                <div className="relative mb-2 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#1e2430] border-2 border-slate-400 flex items-center justify-center text-slate-200 font-black text-sm shadow-md">
                    {topStudents[1].initial}
                  </div>
                  <span className="text-[10px] font-bold text-slate-200 mt-1.5 text-center truncate max-w-[90px]">
                    {topStudents[1].name}
                  </span>
                  <span className="text-[10px] font-black text-slate-400">
                    {topStudents[1].points} pts
                  </span>
                </div>

                {/* Podium Block 2 */}
                <div className="w-full h-24 rounded-t-xl bg-gradient-to-b from-[#2a303d] to-[#1a1f29] border-t-2 border-slate-400 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-black text-slate-300">2</span>
                </div>
              </div>

              {/* 1st Place (Gold, Center, Highest) */}
              <div className="flex flex-col items-center flex-1 max-w-[120px] -mt-6">
                {/* Gold Crown + Gold Wreath Avatar */}
                <div className="relative mb-2 flex flex-col items-center">
                  <div className="text-xl -mb-1 animate-bounce">👑</div>
                  <div className="w-14 h-14 rounded-full bg-[#2a2415] border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-base shadow-lg shadow-amber-500/20">
                    {topStudents[0].initial}
                  </div>
                  <span className="text-xs font-black text-white mt-1.5 text-center truncate max-w-[100px]">
                    {topStudents[0].name}
                  </span>
                  <span className="text-[10px] font-black text-amber-400">
                    {topStudents[0].points} pts
                  </span>
                </div>

                {/* Podium Block 1 */}
                <div className="w-full h-32 rounded-t-xl bg-gradient-to-b from-[#3d331e] to-[#241e12] border-t-2 border-amber-400 flex items-center justify-center shadow-xl">
                  <span className="text-3xl font-black text-amber-400">1</span>
                </div>
              </div>

              {/* 3rd Place (Bronze, Right) */}
              <div className="flex flex-col items-center flex-1 max-w-[110px]">
                {/* Bronze Wreath Avatar */}
                <div className="relative mb-2 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#261d18] border-2 border-amber-700 flex items-center justify-center text-amber-600 font-black text-sm shadow-md">
                    {topStudents[2].initial}
                  </div>
                  <span className="text-[10px] font-bold text-slate-200 mt-1.5 text-center truncate max-w-[90px]">
                    {topStudents[2].name}
                  </span>
                  <span className="text-[10px] font-black text-slate-400">
                    {topStudents[2].points} pts
                  </span>
                </div>

                {/* Podium Block 3 */}
                <div className="w-full h-20 rounded-t-xl bg-gradient-to-b from-[#33241b] to-[#1c1510] border-t-2 border-amber-700 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-black text-amber-700">3</span>
                </div>
              </div>
            </div>

            {/* Ranks 4 to 10 List */}
            <div className="divide-y divide-[#1b202a] text-xs pt-2">
              {topStudents.slice(3).map((item) => (
                <div
                  key={item.rank}
                  className="py-2.5 px-2 flex items-center justify-between hover:bg-[#151922] rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-4 font-bold text-slate-400 text-center text-xs">
                      {item.rank}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#1e2430] text-slate-200 text-[10px] font-bold flex items-center justify-center">
                      {item.initial}
                    </div>
                    <span className="font-semibold text-slate-200">
                      {item.name}
                    </span>
                  </div>

                  <span className="font-mono font-bold text-slate-300">
                    {item.points} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. FULL-WIDTH ATTENDANCE MATRIX (Spanning Edge-to-Edge across entire width) */}
      <div className="w-full">
        <DashboardAttendanceMatrix onOpenQrModal={() => setShowQrModal(true)} />
      </div>

      {/* 4. CAREER & SKILLS ROW (Balanced 2-Column Split) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Placement Drives Card */}
        <div className="bg-[#12151c] border border-[#1e2330] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-white">Placement Drives</h4>
            <Briefcase className="w-4 h-4 text-[#38bdf8]" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#181c26] border border-[#222837] flex items-center justify-center text-slate-300 text-lg">
                💼
              </div>
              <div>
                <span className="text-xl font-black text-white block leading-tight">
                  {studentStats.eligibleDrives}
                </span>
                <span className="text-xs text-slate-400">Eligible drives</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white block leading-tight">
                  {studentStats.appliedDrives}
                </span>
                <span className="text-xs text-slate-400">Applied</span>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <div className="w-full bg-[#181c26] h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full w-[5%]" />
            </div>
            <span className="text-xs text-slate-400 font-medium block mt-1.5">
              {studentStats.appliedPercent}% applied of eligible drives
            </span>
          </div>
        </div>

        {/* Skills Acquired Card */}
        <div className="bg-[#12151c] border border-[#1e2330] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-white">Skills Acquired</h4>
            <span className="text-xs text-slate-400 font-semibold">1 skill verified</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <h5 className="text-base font-bold text-white mb-1.5">
                {studentStats.skills}
              </h5>
              <div className="flex items-center gap-1.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            <span className="px-3 py-1 rounded-lg bg-[#181c26] text-[#38bdf8] text-xs font-black tracking-wider uppercase border border-[#222734]">
              BEGINNER
            </span>
          </div>
        </div>
      </div>

      {/* Official Student QR Identity Modal */}
      <StudentQrModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />
    </div>
  );
};
