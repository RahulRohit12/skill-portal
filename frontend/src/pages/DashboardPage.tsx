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
  Trophy,
  ArrowUpRight,
  TrendingUp,
  GraduationCap,
  Calendar,
  Layers,
  Medal
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

  // Helper to render Segmented progress dash bars cleanly
  const renderDashBar = (percentage: number) => {
    const totalSegments = 14;
    const filledSegments = Math.round((percentage / 100) * totalSegments);

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: totalSegments }).map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-3.5 rounded-[2px] transition-colors ${
              idx < filledSegments
                ? 'bg-sky-400'
                : 'bg-slate-800'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && !studentStats) {
    return <LoadingSpinner fullPage message="Loading student dashboard..." />;
  }

  const studentDisplayName = user?.fullName || 'Prajwal';

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12">
      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="card-pro p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Left Greeting & Context */}
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-sky-400 tracking-wide">
                SkillX Academy
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-medium">Academic Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {studentDisplayName}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              Overview of your technical coursework, automated coding evaluations, and placement drive eligibility.
            </p>
          </div>

          {/* Right: Placed Students / Drive Highlights */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800 w-full lg:w-auto">
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Partner Placements
              </div>
              <div className="text-xs font-semibold text-slate-200">
                TCS · Infosys · Capgemini · Wipro
              </div>
              <div className="text-[11px] text-slate-500">
                2,500+ student placements this season
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5 overflow-hidden">
                {[
                  { name: 'Rahul S.', bg: 'bg-blue-600' },
                  { name: 'Pooja V.', bg: 'bg-emerald-600' },
                  { name: 'Amit K.', bg: 'bg-cyan-600' },
                  { name: 'Sneha R.', bg: 'bg-amber-600' },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`w-9 h-9 rounded-full ${s.bg} border-2 border-[#0d1119] flex items-center justify-center text-white font-bold text-xs shadow-sm`}
                    title={s.name}
                  >
                    {s.name[0]}
                  </div>
                ))}
              </div>

              <Link
                to="/courses"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
              >
                <span>Roadmap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FOUR CLEAN EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Streak */}
        <div className="card-pro p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Coding Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {studentStats.currentStreak}
            </span>
            <span className="text-xs font-semibold text-amber-400">Days</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 border-t border-slate-800/80 pt-2">
            Personal best: {studentStats.longestStreak} days continuous
          </p>
        </div>

        {/* KPI 2: Problems Solved */}
        <div className="card-pro p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Problems Solved</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {studentStats.correctSubmissions}
            </span>
            <span className="text-xs font-semibold text-sky-400">Evaluated</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 border-t border-slate-800/80 pt-2">
            Java syntax & data structures
          </p>
        </div>

        {/* KPI 3: Curriculum Completion */}
        <div className="card-pro p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Curriculum Progress</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {studentStats.assignmentProgress}%
            </span>
            <span className="text-xs font-semibold text-emerald-400">Completed</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 border-t border-slate-800/80 pt-2">
            Module: Arrays & Conditionals
          </p>
        </div>

        {/* KPI 4: Placement Drives */}
        <div className="card-pro p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Placement Eligibility</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {studentStats.eligibleDrives}
            </span>
            <span className="text-xs font-semibold text-indigo-400">Active Drives</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 border-t border-slate-800/80 pt-2">
            {studentStats.appliedDrives} applications submitted
          </p>
        </div>
      </div>

      {/* 3. DIGITAL ATTENDANCE STRIP */}
      <div className="card-pro p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                Classroom Attendance Pass
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-[10px] font-semibold border border-emerald-800/40">
                Verified Identity
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Present your student QR pass to the instructor scanner for rapid classroom presence recording.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/attendance"
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Attendance History
          </Link>
          <button
            onClick={() => setShowQrModal(true)}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Open Student QR</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Learning Progress & Matrix (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: My Learning Progress */}
          <div className="card-pro p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-white">
                  Academic Progress
                </h3>
                <span className="text-xs text-slate-400">
                  Performance across structured modules
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Semester Target: 85%
              </span>
            </div>

            {/* Segmented Dash Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pb-5 border-b border-slate-800/80">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-medium">Courses</span>
                  <span className="text-xs font-bold text-white">{studentStats.courseProgress}%</span>
                </div>
                {renderDashBar(studentStats.courseProgress)}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-medium">Assignments</span>
                  <span className="text-xs font-bold text-sky-400">{studentStats.assignmentProgress}%</span>
                </div>
                {renderDashBar(studentStats.assignmentProgress)}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-medium">Tests</span>
                  <span className="text-xs font-bold text-white">{studentStats.testProgress}%</span>
                </div>
                {renderDashBar(studentStats.testProgress)}
              </div>
            </div>

            {/* In-Progress Module Callout */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-sky-400 tracking-wider">
                  CONTINUE LEARNING
                </span>
                <h4 className="text-sm font-bold text-white">
                  {studentStats.resumeTitle}: Arrays & Kadane's Algorithm
                </h4>
                <p className="text-xs text-slate-400">
                  Hands-on problem statement with online Java test runner
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {/* Clean Circular Meter */}
                <div className="relative w-11 h-11 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="3" />
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
                  <span className="absolute text-[10px] font-bold text-white">
                    {studentStats.resumeProgress}%
                  </span>
                </div>

                <Link
                  to="/assignments"
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span>Continue</span>
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
            <div className="card-pro p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-white">Campus Drives</h4>
                <Briefcase className="w-4 h-4 text-sky-400" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-extrabold text-white block">
                    {studentStats.eligibleDrives}
                  </span>
                  <span className="text-[10px] text-slate-400">Eligible to apply</span>
                </div>

                <div>
                  <span className="text-xl font-extrabold text-white block text-right">
                    {studentStats.appliedDrives}
                  </span>
                  <span className="text-[10px] text-slate-400">Applications sent</span>
                </div>
              </div>

              <div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full w-[12%]" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-1.5">
                  {studentStats.appliedPercent}% applied across eligible positions
                </span>
              </div>
            </div>

            {/* Skills Acquired Card */}
            <div className="card-pro p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-white">Technical Skills</h4>
                <span className="text-[10px] text-sky-400 font-medium bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded">
                  Core Verified
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h5 className="text-sm font-bold text-white mb-1">
                    {studentStats.skills}
                  </h5>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 text-[10px] font-bold tracking-wider uppercase border border-slate-700">
                  INTERMEDIATE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Executive Top Performers & Leaderboard (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-pro p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">
                    Cohort Leaderboard
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs text-slate-400">
                  Rankings dynamically updated on submissions
                </span>
              </div>
              <button
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Share Leaderboard"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Executive Top 3 Performers Cards */}
            <div className="space-y-2.5 mb-4">
              {/* Rank 1: Gold */}
              <div className="rank-gold-pro p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-xs flex items-center justify-center">
                    #1
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {topStudents[0]?.name || 'Pasupathi M'}
                    </span>
                    <span className="text-[10px] text-amber-300/80 font-medium">
                      Cohort Champion
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-amber-300">
                  {topStudents[0]?.points?.toLocaleString() || '9,871'} pts
                </span>
              </div>

              {/* Rank 2: Silver */}
              <div className="rank-silver-pro p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-400/20 border border-slate-400/40 text-slate-200 font-extrabold text-xs flex items-center justify-center">
                    #2
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {topStudents[1]?.name || 'Fakkirappa S'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Runner-up
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-slate-300">
                  {topStudents[1]?.points?.toLocaleString() || '9,807'} pts
                </span>
              </div>

              {/* Rank 3: Bronze */}
              <div className="rank-bronze-pro p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-700/20 border border-amber-600/40 text-amber-400 font-extrabold text-xs flex items-center justify-center">
                    #3
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {topStudents[2]?.name || 'Darshan Patil'}
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-medium">
                      Third Place
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-slate-300">
                  {topStudents[2]?.points?.toLocaleString() || '9,803'} pts
                </span>
              </div>
            </div>

            {/* Ranks 4 to 10 Clean Tabular List */}
            <div className="divide-y divide-slate-800/80 text-xs pt-1">
              {topStudents.slice(3, 10).map((item) => (
                <div
                  key={item.rank}
                  className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-900/60 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-4 font-mono font-semibold text-slate-500 text-xs">
                      #{item.rank}
                    </span>
                    <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                      {item.initial}
                    </div>
                    <span className="font-medium text-slate-200">
                      {item.name}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-slate-400 font-medium">
                    {item.points.toLocaleString()} pts
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
