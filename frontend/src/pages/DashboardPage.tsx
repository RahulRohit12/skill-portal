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
  QrCode
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StudentQrModal } from '../components/attendance/StudentQrModal';

interface LeaderboardItem {
  rank: number;
  name: string;
  points: number;
  initial: string;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
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

  // Leaderboard data matching reference
  const topStudents: LeaderboardItem[] = [
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
  ];

  useEffect(() => {
    // Single consolidated fetch for live personalized dashboard & statistics
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

  // 12-Month GitHub-style Green Activity Grid
  const renderContributionGrid = () => {
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const daysOfWeek = ['Mon', 'Wed', 'Fri'];

    // Generate 52 weeks x 7 days
    const weeks = [];
    const today = new Date();

    for (let w = 51; w >= 0; w--) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (w * 7 + (6 - d)));
        const dateStr = date.toISOString().split('T')[0];
        const count = heatmapData[dateStr] || 0;
        days.push({ date: dateStr, count });
      }
      weeks.push(days);
    }

    const getTileColor = (count: number) => {
      if (count === 0) return 'bg-[#14171f] border border-[#1b202a]';
      if (count === 1) return 'bg-[#064e3b] border border-[#065f46]';
      if (count === 2) return 'bg-[#15803d] border border-[#16a34a]';
      if (count === 3) return 'bg-[#22c55e] border border-[#4ade80]';
      return 'bg-[#4ade80] border border-[#86efac]';
    };

    return (
      <div className="overflow-x-auto pb-2">
        {/* Month labels header */}
        <div className="flex text-[10px] text-slate-400 font-medium pl-7 justify-between mb-1.5 min-w-[640px]">
          {months.map((m, idx) => (
            <span key={idx}>{m}</span>
          ))}
        </div>

        <div className="flex gap-1 min-w-[640px]">
          {/* Day of week labels */}
          <div className="flex flex-col justify-between text-[9px] text-slate-400 pr-2 py-0.5 select-none shrink-0 w-6">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* 52 Columns */}
          <div className="flex gap-1 flex-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    title={`${day.date}: ${day.count} activities`}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px] transition-transform hover:scale-125 cursor-pointer ${getTileColor(
                      day.count
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

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

  if (loading) {
    return <LoadingSpinner fullPage message="Loading your student learning dashboard..." />;
  }

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12">
      {/* 1. HERO TOP BANNER CAROUSEL (Placed Students & Class Notice) */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0d1017] via-[#121622] to-[#151926] border border-[#1f2432] p-6 overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Left: Placed Students Spotlight */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black tracking-widest text-[#ec4899] uppercase">
                TCS SERVICES
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-300 font-semibold">Infosys · Wipro · Capgemini</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Placed Students
            </h2>
            <p className="text-xs text-slate-400 max-w-md">
              Over 2,500+ students placed this season in premier technology roles across India.
            </p>
          </div>

          {/* Center/Right: Placed Students Row */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3 overflow-hidden p-1">
              {[
                { name: 'Rahul S.', company: 'TCS', bg: 'from-sky-500 to-blue-600' },
                { name: 'Pooja V.', company: 'Infosys', bg: 'from-emerald-500 to-teal-600' },
                { name: 'Amit K.', company: 'Capgemini', bg: 'from-cyan-500 to-blue-600' },
                { name: 'Sneha R.', company: 'Accenture', bg: 'from-amber-500 to-orange-600' }
              ].map((s, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-full bg-gradient-to-tr ${s.bg} border-2 border-[#121622] flex items-center justify-center text-white font-black text-xs shadow-md shadow-black/40`}
                  title={`${s.name} (${s.company})`}
                >
                  {s.name[0]}
                </div>
              ))}
            </div>

            {/* Live Schedule notice on right */}
            <div className="hidden xl:flex flex-col items-end pl-6 border-l border-[#1f2432]">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Classes right now</span>
              </div>
              <Link
                to="/courses"
                className="text-xs font-bold text-[#38bdf8] hover:text-sky-300 transition-colors flex items-center gap-1"
              >
                <span>View schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Pagination dots */}
        <div className="flex items-center justify-center gap-1.5 pt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                heroSlide === i ? 'w-6 bg-[#38bdf8]' : 'w-1.5 bg-slate-700'
              }`}
            />
          ))}
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

          {/* Card 2: Practice Streak & Contribution Calendar */}
          <div className="bg-[#12151c] border border-[#1e2330] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white">
                Practice Streak
              </h3>
              <button
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Share Streak"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Streak Metrics Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#1b202a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Flame className="w-5 h-5 fill-amber-500" />
                </div>
                <div>
                  <div className="text-xl font-black text-white leading-tight">
                    {studentStats.currentStreak}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Current streak</span>
                </div>
              </div>

              <div>
                <div className="text-xl font-black text-white leading-tight">
                  {studentStats.longestStreak}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Longest streak</span>
              </div>

              <div>
                <div className="text-xl font-black text-white leading-tight">
                  {studentStats.correctSubmissions}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Total Correct submissions</span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-[#181c26] border border-[#222734] text-xs font-bold text-slate-200">
                2026
              </div>
            </div>

            {/* GitHub-style Green Activity Heatmap */}
            {renderContributionGrid()}

            {/* Heatmap Legend Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  No practice yet today
                </span>
                <span>•</span>
                <span className="underline cursor-pointer hover:text-slate-200">How we count</span>
              </div>

              <div className="flex items-center gap-1 text-[10px]">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#14171f] border border-[#1b202a]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#064e3b]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#15803d]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#22c55e]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#4ade80]" />
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Bottom Sub-Cards: Placement Drives & Skills Acquired */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Placement Drives Card */}
            <div className="bg-[#12151c] border border-[#1e2330] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-white">Placement Drives</h4>
                <Briefcase className="w-4 h-4 text-[#38bdf8]" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#181c26] flex items-center justify-center text-slate-300">
                    💼
                  </div>
                  <div>
                    <span className="text-base font-black text-white block leading-tight">
                      {studentStats.eligibleDrives}
                    </span>
                    <span className="text-[10px] text-slate-400">Eligible drives</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-base font-black text-white block leading-tight">
                      {studentStats.appliedDrives}
                    </span>
                    <span className="text-[10px] text-slate-400">Applied</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="w-full bg-[#181c26] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#38bdf8] h-full rounded-full w-[5%]" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  {studentStats.appliedPercent}% applied
                </span>
              </div>
            </div>

            {/* Skills Acquired Card */}
            <div className="bg-[#12151c] border border-[#1e2330] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-white">Skills Acquired</h4>
                <span className="text-[10px] text-slate-400 font-semibold">1 skill</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h5 className="text-sm font-bold text-white mb-1">
                    {studentStats.skills}
                  </h5>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-md bg-[#181c26] text-[#38bdf8] text-[10px] font-black tracking-wider uppercase border border-[#222734]">
                  BEGINNER
                </span>
              </div>
            </div>
          </div>
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

      {/* Official Student QR Identity Modal */}
      <StudentQrModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />
    </div>
  );
};
