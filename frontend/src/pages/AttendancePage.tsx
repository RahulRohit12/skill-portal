import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  QrCode
} from 'lucide-react';
import api from '../api/client';
import { AttendanceData } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AttendanceCalendar } from '../components/attendance/AttendanceCalendar';
import { StudentQrModal } from '../components/attendance/StudentQrModal';

export const AttendancePage: React.FC = () => {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    api.get('/attendance')
      .then((res) => setData(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Retrieving batch attendance registers..." />;
  if (!data) return <div className="p-8 text-center text-sm text-slate-400">Attendance records not available.</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-[#00c2ff]" />
            Classroom Attendance & Session History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor your batch lecture attendance percentage, verified sessions, and instant QR identity.
          </p>
        </div>

        <button
          onClick={() => setShowQrModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#0096c7] hover:from-[#00c2ff] hover:to-[#00b4d8] text-slate-950 text-xs font-black transition-all shadow-lg shadow-cyan-500/20 shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>My Attendance QR Code</span>
        </button>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl">
          <span className="text-xs text-slate-400 font-semibold">Overall Attendance</span>
          <div className="text-2xl sm:text-3xl font-black text-[#00c2ff] mt-1">
            {data.overallPercentage}%
          </div>
          <span className="text-[11px] font-bold text-emerald-400">Eligible for Placements</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl">
          <span className="text-xs text-slate-400 font-semibold">Total Sessions Held</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {data.totalClasses}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Batch Lectures</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl">
          <span className="text-xs text-slate-400 font-semibold">Present Count</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {data.presentClasses}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Verified Active</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl">
          <span className="text-xs text-slate-400 font-semibold">Absent Count</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-300 mt-1">
            {data.absentClasses}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Missed Sessions</span>
        </div>
      </div>

      {/* Interactive Monthly Attendance Calendar */}
      <AttendanceCalendar />

      {/* Subject-Wise Attendance Breakdown */}
      <div className="p-6 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-4">
        <h3 className="font-extrabold text-sm text-white">
          Subject-Wise Verification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.subjectWise.map((sub) => (
            <div
              key={sub.subjectId}
              className="p-4 rounded-xl bg-[#090b0e] border border-[#1a1f2c] flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-xs text-white">
                  {sub.subjectTitle}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {sub.presentClasses} of {sub.totalClasses} Classes Attended
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-[#00c2ff]">
                  {sub.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Session History Table */}
      <div className="p-6 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-4">
        <h3 className="font-extrabold text-sm text-white">
          Verified Classroom Attendance Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2430] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Date</th>
                <th className="pb-3 font-bold">Lecture Topic</th>
                <th className="pb-3 font-bold">Subject</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181c26]">
              {data.history.map((h) => (
                <tr key={h.sessionId} className="hover:bg-[#12151c] transition-colors">
                  <td className="py-3 font-medium text-slate-300">
                    {h.sessionDate}
                  </td>
                  <td className="py-3 font-bold text-white">
                    {h.sessionTitle}
                  </td>
                  <td className="py-3 text-slate-400">
                    {h.subjectTitle}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        h.status === 'PRESENT'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {h.status === 'PRESENT' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {h.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">
                    {h.remarks || 'Standard Lecture Attendance'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student QR Identity Modal */}
      <StudentQrModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />
    </div>
  );
};

