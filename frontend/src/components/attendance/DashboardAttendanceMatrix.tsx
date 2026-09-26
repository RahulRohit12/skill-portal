import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import api from '../../api/client';

interface DayItem {
  day: number;
  status: 'PRESENT' | 'ABSENT' | 'WEEK_OFF' | 'NONE';
  title?: string;
  source?: string;
  markedAt?: string;
}

interface MonthRow {
  name: string;
  monthIndex: number; // 6 = Jun, 7 = Jul, 8 = Aug, 9 = Sep
  days: Record<number, DayItem>;
}

interface SubjectData {
  id: string;
  name: string;
  months: MonthRow[];
}

export const DashboardAttendanceMatrix: React.FC<{ onOpenQrModal?: () => void }> = ({ onOpenQrModal }) => {
  const [activeSubject, setActiveSubject] = useState<string>('core-java');
  const [startDate, setStartDate] = useState<string>('Start date');
  const [endDate, setEndDate] = useState<string>('End date');
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
    date: string;
    month: string;
    day: number;
    item: DayItem;
    subjectName: string;
  } | null>(null);

  // Live real scan records fetched from existing backend endpoints (0 backend changes)
  const [liveScans, setLiveScans] = useState<Record<string, { status: string; markedAt?: string; source?: string; title?: string }>>({});

  useEffect(() => {
    // 1. Fetch student overall attendance & recent history
    api.get('/attendance')
      .then((res) => {
        if (res.data?.data?.history) {
          const map: Record<string, { status: string; markedAt?: string; source?: string; title?: string }> = {};
          res.data.data.history.forEach((h: any) => {
            if (h.sessionDate) {
              map[h.sessionDate] = {
                status: h.status,
                markedAt: h.remarks,
                source: h.remarks?.includes('QR') ? 'QR_SCAN' : 'MANUAL',
                title: h.sessionTitle
              };
            }
          });
          setLiveScans((prev) => ({ ...prev, ...map }));
        }
      })
      .catch(() => {});

    // 2. Fetch real calendar records for June, July, August, September from existing backend
    const currentYear = new Date().getFullYear();
    [6, 7, 8, 9].forEach((mNum) => {
      api.get('/attendance/calendar', {
        params: { year: currentYear, month: mNum }
      })
        .then((res) => {
          if (res.data?.data?.days) {
            const map: Record<string, { status: string; markedAt?: string; source?: string; title?: string }> = {};
            res.data.data.days.forEach((d: any) => {
              if (d.date && d.status && d.status !== 'NO_SESSION') {
                map[d.date] = {
                  status: d.status,
                  markedAt: d.markedAt,
                  source: d.source || 'QR_SCAN',
                  title: d.sessionTitle
                };
              }
            });
            setLiveScans((prev) => ({ ...prev, ...map }));
          }
        })
        .catch(() => {});
    });
  }, []);

  // Helper to build 31-day map with ONLY real scans and weekend week-offs (all sample marks cleared)
  const buildMonthDays = (
    daysInMonth: number,
    weekendDays: number[],
    topicPrefix: string,
    monthNum: number
  ): Record<number, DayItem> => {
    const map: Record<number, DayItem> = {};
    for (let d = 1; d <= 31; d++) {
      if (d > daysInMonth) {
        map[d] = { day: d, status: 'NONE' };
        continue;
      }

      // Check if real live scan or recorded session exists for this date
      const dateKey = `2026-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (liveScans[dateKey]) {
        const scan = liveScans[dateKey];
        map[d] = {
          day: d,
          status: scan.status === 'PRESENT' ? 'PRESENT' : 'ABSENT',
          title: scan.title || `${topicPrefix} Session`,
          source: scan.source || 'QR_SCAN',
          markedAt: scan.markedAt
        };
        continue;
      }

      if (weekendDays.includes(d)) {
        map[d] = {
          day: d,
          status: 'WEEK_OFF'
        };
      } else {
        map[d] = {
          day: d,
          status: 'NONE'
        };
      }
    }
    return map;
  };

  // Month rows: Jun, July, Aug, Sep (clean real data only)
  const buildCleanMonths = (subjectTitle: string): MonthRow[] => [
    {
      name: 'Jun',
      monthIndex: 6,
      days: buildMonthDays(30, [6, 7, 13, 14, 20, 21, 27, 28], subjectTitle, 6)
    },
    {
      name: 'July',
      monthIndex: 7,
      days: buildMonthDays(31, [4, 5, 11, 12, 18, 19, 25, 26], subjectTitle, 7)
    },
    {
      name: 'Aug',
      monthIndex: 8,
      days: buildMonthDays(31, [1, 2, 8, 9, 15, 16, 22, 23, 30], subjectTitle, 8)
    },
    {
      name: 'Sep',
      monthIndex: 9,
      days: buildMonthDays(30, [5, 6, 12, 13, 19, 20, 26, 27], subjectTitle, 9)
    }
  ];

  // Subject catalogues with dynamic pills
  const subjects: Record<string, SubjectData> = {
    'core-java': {
      id: 'core-java',
      name: 'Core Java',
      months: buildCleanMonths('Core Java')
    },
    'programming': {
      id: 'programming',
      name: 'Programming',
      months: buildCleanMonths('Programming')
    },
    'sql': {
      id: 'sql',
      name: 'SQL',
      months: buildCleanMonths('SQL')
    },
    'advanced-java': {
      id: 'advanced-java',
      name: 'Advanced Java',
      months: buildCleanMonths('Advanced Java')
    },
    'soft-skills': {
      id: 'soft-skills',
      name: 'Soft Skills',
      months: buildCleanMonths('Soft Skills')
    },
    'html-css': {
      id: 'html-css',
      name: 'HTML & CSS',
      months: buildCleanMonths('HTML & CSS')
    },
    'python': {
      id: 'python',
      name: 'Python',
      months: buildCleanMonths('Python')
    }
  };

  const currentSubject = subjects[activeSubject] || subjects['core-java'];
  const dayNumbers = Array.from({ length: 31 }, (_, i) => i + 1);

  // Compute real dynamic statistics based strictly on verified sessions / scans
  let realTotal = 0;
  let realPresent = 0;
  let realAbsent = 0;

  currentSubject.months.forEach((m) => {
    Object.values(m.days).forEach((d) => {
      if (d.status === 'PRESENT') {
        realTotal++;
        realPresent++;
      } else if (d.status === 'ABSENT') {
        realTotal++;
        realAbsent++;
      }
    });
  });

  const percentage = realTotal > 0 ? Math.round((realPresent / realTotal) * 100) : 100;

  const getPercentageColor = (pct: number) => {
    if (pct < 60) return 'text-[#f87171]';
    if (pct < 75) return 'text-amber-400';
    return 'text-[#38bdf8]';
  };

  return (
    <div className="bg-[#12151c] border border-[#1e2330] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* 1. Header Bar: ATTENDANCE & Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-black tracking-widest text-slate-300 uppercase select-none">
            ATTENDANCE
          </span>
        </div>

        {/* Date Range Selector matching reference: [ Start date -> End date 📅 ] */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151924] border border-[#232a3c] text-xs text-slate-300 shadow-inner">
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start date"
              className="bg-transparent border-none text-slate-300 text-xs w-20 sm:w-24 focus:outline-none placeholder-slate-500 font-medium"
            />
            <span className="text-slate-500 font-bold select-none">→</span>
            <input
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End date"
              className="bg-transparent border-none text-slate-300 text-xs w-20 sm:w-24 focus:outline-none placeholder-slate-500 font-medium"
            />
            <CalendarIcon className="w-4 h-4 text-sky-400 shrink-0 ml-0.5 cursor-pointer" />
          </div>

          {onOpenQrModal && (
            <button
              onClick={onOpenQrModal}
              className="p-1.5 px-2.5 rounded-xl bg-[#161c2b] hover:bg-[#1d2538] text-slate-300 hover:text-white transition-all border border-[#242e44] flex items-center gap-1.5 text-xs font-bold shrink-0"
              title="View My Attendance QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-[#00c2ff]" />
              <span className="hidden sm:inline">My QR</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Subject Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
        {Object.values(subjects).map((sub) => {
          const isActive = activeSubject === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#38bdf8] text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.4)] font-black'
                  : 'bg-[#151924] text-slate-400 hover:text-slate-200 hover:bg-[#1b2130] border border-[#202738]'
              }`}
            >
              {sub.name}
            </button>
          );
        })}
      </div>

      {/* 3. Summary Stats Row & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 pb-3 border-b border-[#1b202a]">
        {/* Left: Dynamic Real Percentage & Class Counts */}
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-black tracking-tight ${getPercentageColor(percentage)}`}>
              {percentage}%
            </span>
            <span className="text-xs sm:text-sm text-slate-400 font-semibold">
              attended
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700/60 hidden sm:block mx-1" />

          <div className="text-xs sm:text-sm text-slate-300 font-medium">
            <span className="font-extrabold text-white">
              {realPresent} of {realTotal} classes attended
            </span>
            <span className="text-slate-400 ml-1.5">
              · {realAbsent} missed
            </span>
          </div>
        </div>

        {/* Right: Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 self-start md:self-auto select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-black text-sm">✓</span>
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-rose-500 font-black text-sm">✕</span>
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold text-sm">–</span>
            <span>Week off</span>
          </div>
        </div>
      </div>

      {/* 4. Horizontal Month-by-Month Matrix Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[760px]">
          {/* Day Numbers Header 1 to 31 */}
          <div className="flex items-center mb-2.5">
            <div className="w-12 sm:w-14 shrink-0" />
            <div className="flex-1 grid grid-cols-[repeat(31,minmax(0,1fr))] gap-1 text-center">
              {dayNumbers.map((d) => (
                <div
                  key={d}
                  className="text-[11px] font-medium text-slate-500 text-center select-none"
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Month Rows: Jun, July, Aug, Sep */}
          <div className="space-y-3">
            {currentSubject.months.map((mRow) => (
              <div
                key={mRow.name}
                className="flex items-center group hover:bg-[#151926]/40 py-1 rounded-lg transition-colors"
              >
                {/* Month Name */}
                <div className="w-12 sm:w-14 shrink-0 text-xs font-bold text-slate-300 select-none">
                  {mRow.name}
                </div>

                {/* 31 Day Cells */}
                <div className="flex-1 grid grid-cols-[repeat(31,minmax(0,1fr))] gap-1 text-center">
                  {dayNumbers.map((d) => {
                    const cell = mRow.days[d];

                    if (!cell || cell.status === 'NONE') {
                      return <div key={d} className="h-6 w-full" />;
                    }

                    if (cell.status === 'WEEK_OFF') {
                      return (
                        <div
                          key={d}
                          className="h-6 flex items-center justify-center text-slate-600 font-bold text-xs select-none"
                          title={`${mRow.name} ${d}: Week off`}
                        >
                          –
                        </div>
                      );
                    }

                    if (cell.status === 'PRESENT') {
                      const isQr = cell.source === 'QR_SCAN';
                      return (
                        <div
                          key={d}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCell({
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                              date: `2026-${String(mRow.monthIndex).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                              month: mRow.name,
                              day: d,
                              item: cell,
                              subjectName: currentSubject.name
                            });
                          }}
                          onMouseLeave={() => setHoveredCell(null)}
                          className="h-6 flex items-center justify-center text-emerald-400 font-black text-xs cursor-pointer transition-transform hover:scale-130 relative"
                        >
                          ✓
                          {isQr && (
                            <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                          )}
                        </div>
                      );
                    }

                    if (cell.status === 'ABSENT') {
                      return (
                        <div
                          key={d}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCell({
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                              date: `2026-${String(mRow.monthIndex).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                              month: mRow.name,
                              day: d,
                              item: cell,
                              subjectName: currentSubject.name
                            });
                          }}
                          onMouseLeave={() => setHoveredCell(null)}
                          className="h-6 flex items-center justify-center text-rose-500 font-black text-xs cursor-pointer transition-transform hover:scale-130"
                        >
                          ✕
                        </div>
                      );
                    }

                    return <div key={d} className="h-6 w-full" />;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Interactive Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-[#121622] border border-[#232b3f] shadow-2xl rounded-xl p-3 text-xs text-slate-200 min-w-[220px] space-y-1.5"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y - 8}px`
          }}
        >
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#1d2436]">
            <span className="font-bold text-white">
              {hoveredCell.month} {hoveredCell.day}, 2026
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                hoveredCell.item.status === 'PRESENT'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
              }`}
            >
              {hoveredCell.item.status === 'PRESENT' ? 'PRESENT ✓' : 'ABSENT ✕'}
            </span>
          </div>

          <div className="text-[11px] text-slate-300">
            <span className="text-slate-400 font-semibold">{hoveredCell.subjectName}: </span>
            <span>{hoveredCell.item.title || 'Scheduled Classroom Session'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 pt-0.5">
            <QrCode className="w-3 h-3" />
            <span>
              {hoveredCell.item.source === 'QR_SCAN'
                ? 'Verified by QR Attendance Scanner'
                : 'Regular Batch Lecture'}
            </span>
          </div>

          {hoveredCell.item.markedAt && (
            <div className="text-[9px] text-slate-500">
              Verified at: {hoveredCell.item.markedAt}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
