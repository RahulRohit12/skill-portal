import React, { useEffect, useState } from 'react';
import {
  Radio,
  Video,
  Play,
  Square,
  ExternalLink,
  Users,
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  UserCheck
} from 'lucide-react';
import api from '../../api/client';
import { CourseItem, BatchItem, LiveClassItem, StartLiveClassRequest } from '../../types';

interface AdminLiveClassesTabProps {
  courses: CourseItem[];
  batches: BatchItem[];
}

export const AdminLiveClassesTab: React.FC<AdminLiveClassesTabProps> = ({
  courses,
  batches,
}) => {
  const [activeSessions, setActiveSessions] = useState<LiveClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [endingId, setEndingId] = useState<number | null>(null);

  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [instructorName, setInstructorName] = useState('Prof. Lead Instructor');
  const [meetingLink, setMeetingLink] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize selected batch if available
  useEffect(() => {
    if (batches && batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(String(batches[0].id));
    }
  }, [batches]);

  const loadActiveSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/live-classes/active');
      if (res.data?.data) {
        setActiveSessions(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load active live sessions', err);
      setError(err.response?.data?.message || 'Failed to fetch active live sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveSessions();
    const interval = setInterval(loadActiveSessions, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleStartLive = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!selectedBatchId) {
      setError('Please select a student batch/cohort.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a class topic or title.');
      return;
    }
    if (!instructorName.trim()) {
      setError('Please enter the instructor or host name.');
      return;
    }
    if (!meetingLink.trim()) {
      setError('Please enter a valid meeting URL (Google Meet, Zoom, MS Teams).');
      return;
    }

    setStarting(true);
    try {
      const payload: StartLiveClassRequest = {
        batchId: Number(selectedBatchId),
        courseId: selectedCourseId ? Number(selectedCourseId) : undefined,
        title: title.trim(),
        instructorName: instructorName.trim(),
        meetingLink: meetingLink.trim(),
        description: description.trim() || undefined,
      };

      const res = await api.post('/admin/live-classes/start', payload);
      const created: LiveClassItem = res.data?.data;

      // Update state
      setActiveSessions((prev) => [
        created,
        ...prev.filter((s) => s.batchId !== created.batchId),
      ]);

      const batchObj = batches.find((b) => String(b.id) === selectedBatchId);
      setSuccessMsg(
        `🔴 Live session started for ${batchObj ? batchObj.name : 'selected batch'}! Students can now join instantly from their course section.`
      );

      // Reset fields
      setTitle('');
      setMeetingLink('');
      setDescription('');
    } catch (err: any) {
      console.error('Failed to start live class', err);
      setError(err.response?.data?.message || 'Failed to start live class session.');
    } finally {
      setStarting(false);
    }
  };

  const handleEndLive = async (sessionId: number, batchName: string) => {
    setEndingId(sessionId);
    setError(null);
    try {
      await api.post(`/admin/live-classes/${sessionId}/end`);
      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setSuccessMsg(`Session for ${batchName} ended. The join banner has been removed from students' portal.`);
    } catch (err: any) {
      console.error('Failed to end live class', err);
      setError(err.response?.data?.message || 'Failed to end live class session.');
    } finally {
      setEndingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              Live Class Host & Broadcast Console
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                Real-Time
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Host interactive lectures, doubt clearing, or workshops for specific batches. Only students in that batch see the join link.
            </p>
          </div>
        </div>

        <button
          onClick={loadActiveSessions}
          disabled={loading}
          className="self-start md:self-auto px-3 py-1.5 rounded-xl border border-[#1f2430] hover:bg-[#181c26] text-slate-300 text-xs font-bold transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Live Sessions</span>
        </button>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="font-semibold">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Start Live Class */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1f2430]">
              <Play className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-black text-white">Start New Live Session</h3>
            </div>

            <form onSubmit={handleStartLive} className="space-y-4">
              {/* Batch Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  Target Cohort / Batch <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full bg-[#131620] border border-[#1f2430] focus:border-rose-500 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none transition-all"
                  required
                >
                  <option value="" disabled>Select Student Batch</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Only students registered in this batch will see the "Live Now" join link.
                </p>
              </div>

              {/* Course Selector (Optional) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  Associated Course <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-[#131620] border border-[#1f2430] focus:border-rose-500 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none transition-all"
                >
                  <option value="">-- General / Batch-Wide Session --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Session Topic / Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Full Stack Java & Spring Security Workshop"
                  className="w-full bg-[#131620] border border-[#1f2430] focus:border-rose-500 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-600"
                  required
                />
              </div>

              {/* Instructor Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                  Instructor / Host Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  placeholder="e.g., Prof. Sharma"
                  className="w-full bg-[#131620] border border-[#1f2430] focus:border-rose-500 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-600"
                  required
                />
              </div>

              {/* Meeting Link */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-rose-400" />
                  Meeting Link <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  className="w-full bg-[#131620] border border-[#1f2430] focus:border-rose-500 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-600"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Supports Google Meet, Zoom, Microsoft Teams, or YouTube Live stream.
                </p>
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Agenda / Notes <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key concepts covered today, prerequisites, and code repositories to clone before class..."
                  rows={2}
                  className="w-full bg-[#131620] border border-[#1f2430] focus:border-rose-500 text-slate-200 text-xs rounded-xl p-3 outline-none transition-all placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={starting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition-all disabled:opacity-50 cursor-pointer"
              >
                {starting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting Live Session...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>Start Live Session</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Currently Active Sessions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <h3 className="text-sm font-black text-white">Active Live Sessions</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                  {activeSessions.length} Running
                </span>
              </div>
            </div>

            {loading && activeSessions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                <span>Scanning active live broadcasts...</span>
              </div>
            ) : activeSessions.length === 0 ? (
              <div className="py-16 text-center rounded-xl bg-[#131620]/60 border border-[#1f2430] p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                  <Video className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">No Live Classes Currently Active</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When you start a live class, it will appear here in real time. Students in that cohort will immediately see the join link on their course page.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-rose-950/20 via-[#131620] to-[#131620] border border-rose-500/30 space-y-3 relative overflow-hidden shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black tracking-wide border border-rose-500/40">
                          LIVE NOW
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                          Cohort: {session.batchName}
                        </span>
                        {session.courseTitle && (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                            {session.courseTitle}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          Started:{' '}
                          {session.startedAt
                            ? new Date(session.startedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Just now'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {session.title}
                      </h4>
                      <p className="text-xs text-sky-400 font-medium mt-0.5">
                        Host: {session.instructorName}
                      </p>
                      {session.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {session.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#1f2430] flex flex-wrap items-center justify-between gap-3">
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="max-w-[240px] truncate">{session.meetingLink}</span>
                      </a>

                      <button
                        onClick={() => handleEndLive(session.id, session.batchName)}
                        disabled={endingId === session.id}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {endingId === session.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Ending...</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-3.5 h-3.5 fill-rose-300" />
                            <span>End Live Session</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
