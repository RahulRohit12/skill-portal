import React, { useState, useMemo } from 'react';
import { Flame, Share2, Info, X, CheckCircle2, Award } from 'lucide-react';

interface PracticeStreakProps {
  initialCurrentStreak?: number;
  initialLongestStreak?: number;
  initialTotalSubmissions?: number;
}

export const PracticeStreak: React.FC<PracticeStreakProps> = ({
  initialCurrentStreak = 8,
  initialLongestStreak = 8,
  initialTotalSubmissions = 495,
}) => {
  const [showHowWeCount, setShowHowWeCount] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [copiedShare, setCopiedShare] = useState(false);

  // Check if student practiced today
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [practicedToday, setPracticedToday] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('skillportal_today_practiced');
      return stored === todayStr;
    } catch {
      return false;
    }
  });

  const currentStreak = practicedToday ? initialCurrentStreak : Math.max(1, initialCurrentStreak);
  const longestStreak = Math.max(currentStreak, initialLongestStreak);

  // Generate 52 weeks of calendar activity matching the image layout
  const calendarData = useMemo(() => {
    const weeks: Array<Array<{ date: string; count: number; isToday: boolean }>> = [];
    const today = new Date();

    // 52 weeks = 364 days back
    for (let w = 51; w >= 0; w--) {
      const days: Array<{ date: string; count: number; isToday: boolean }> = [];
      for (let d = 0; d < 7; d++) {
        const dayOffset = w * 7 + (6 - d);
        const cellDate = new Date(today);
        cellDate.setDate(today.getDate() - dayOffset);
        const dateKey = cellDate.toISOString().split('T')[0];
        const isCurrentDay = dateKey === todayStr;

        // Simulated activity pattern matching Image 1: recent clusters in Aug/Sep
        let count = 0;
        if (isCurrentDay && practicedToday) {
          count = 4;
        } else if (w < 8) {
          // Recent weeks have high activity (August / September)
          const seed = (w * 7 + d * 13) % 10;
          if (seed > 3) {
            count = (seed % 4) + 1;
          }
        } else if (w >= 12 && w <= 16) {
          // Mid-year activity cluster (July)
          const seed = (w * 3 + d * 5) % 10;
          if (seed > 5) count = (seed % 3) + 1;
        }

        days.push({
          date: dateKey,
          count,
          isToday: isCurrentDay,
        });
      }
      weeks.push(days);
    }
    return weeks;
  }, [practicedToday, todayStr]);

  const handleShare = () => {
    const shareText = `🔥 I am on a ${currentStreak}-day practice streak with ${initialTotalSubmissions} correct submissions on Skillex Academy! #CodingStreak #2026Fresher`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-[#181c24] border border-[#212634]';
    if (count === 1) return 'bg-[#14532d] border border-[#166534]'; // Dark green
    if (count === 2) return 'bg-[#15803d] border border-[#22c55e]'; // Medium green
    if (count === 3) return 'bg-[#22c55e] border border-[#4ade80]'; // Bright green
    return 'bg-[#4ade80] border border-[#86efac] shadow-sm shadow-[#22c55e]/30'; // Neon green
  };

  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  return (
    <div className="bg-[#0c0e12] border border-[#1b1f2b] rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl relative">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
          Practice Streak
        </h3>

        <div className="flex items-center gap-2">
          {copiedShare && (
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Streak Copied!
            </span>
          )}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181c26] transition-colors"
            title="Share Practice Streak"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row (Flame + Stats + Year Pill) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
          {/* Flame Icon Container */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-950/60 to-orange-900/40 border border-amber-600/40 flex items-center justify-center text-2xl shadow-lg shadow-orange-950/30">
              🔥
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white leading-none">
                {currentStreak}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                Current streak
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-[#1e2330] hidden sm:block" />

          {/* Longest Streak */}
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white leading-none">
              {longestStreak}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Longest streak
            </div>
          </div>

          <div className="h-8 w-px bg-[#1e2330] hidden sm:block" />

          {/* Total Submissions */}
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white leading-none">
              {initialTotalSubmissions}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Total Correct submissions
            </div>
          </div>
        </div>

        {/* Year Pill (2026) */}
        <div className="self-end sm:self-center">
          <div className="px-3.5 py-1.5 rounded-full bg-[#141720] border border-[#232938] text-xs font-black text-slate-200">
            {selectedYear}
          </div>
        </div>
      </div>

      {/* 52-Week Activity Heatmap */}
      <div className="space-y-1.5 overflow-x-auto pb-2 no-scrollbar">
        {/* Month Labels */}
        <div className="flex text-[10px] font-semibold text-slate-400 pl-8 pr-2 min-w-[700px] justify-between">
          {months.map((m, idx) => (
            <span key={idx}>{m}</span>
          ))}
        </div>

        {/* Calendar Grid with Day Labels on Left */}
        <div className="flex items-start gap-2 min-w-[700px]">
          {/* Day Labels (Mon, Wed, Fri) */}
          <div className="flex flex-col justify-between h-[106px] text-[10px] font-semibold text-slate-500 shrink-0 pt-0.5">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* 52 Columns */}
          <div className="grid grid-flow-col grid-rows-7 gap-[3.5px] flex-1">
            {calendarData.map((week, wIdx) =>
              week.map((day, dIdx) => (
                <div
                  key={`${wIdx}-${dIdx}`}
                  title={`${day.date}: ${day.count} correct submissions${day.isToday ? ' (Today)' : ''}`}
                  className={`w-3 h-3 rounded-[3px] transition-all cursor-pointer ${getCellColor(day.count)} ${
                    day.isToday
                      ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-[#0c0e12]'
                      : 'hover:scale-125 hover:z-10'
                  }`}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Row (Status + Legend) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#181c26] text-xs">
        {/* Today's Practice Status */}
        <div className="flex items-center gap-2">
          {practicedToday ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Practiced today! 🔥</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>No practice yet today</span>
            </span>
          )}

          <button
            onClick={() => setShowHowWeCount(true)}
            className="text-slate-400 hover:text-white underline text-[11px] font-medium ml-2 cursor-pointer"
          >
            How we count
          </button>
        </div>

        {/* Less / More Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#181c24] border border-[#212634]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#14532d] border border-[#166534]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#15803d] border border-[#22c55e]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#22c55e] border border-[#4ade80]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#4ade80] border border-[#86efac]" />
          <span>More</span>
        </div>
      </div>

      {/* "How We Count" Modal */}
      {showHowWeCount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowHowWeCount(false)}
        >
          <div
            className="bg-[#0e1118] border border-[#1f2430] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHowWeCount(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-[#141824]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-xl">
                🔥
              </div>
              <div>
                <h3 className="text-sm font-black text-white">How We Count Practice Streaks</h3>
                <p className="text-[11px] text-slate-400">Daily Coding Consistency Rule</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-[#12151c] p-4 rounded-xl border border-[#1f2430]">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Daily Practice Rule:</strong> Solve at least <strong>1 question or coding test case</strong> in your Assignments or Coding Labs each day.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Streak Extension:</strong> Your current streak automatically increments when your solution is accepted by the online judge.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Time Window:</strong> Submissions are tracked based on your local time zone from 00:00 to 23:59 daily.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHowWeCount(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Got it, keep practicing!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeStreak;
