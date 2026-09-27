import React, { useState } from 'react';
import {
  Megaphone,
  Send,
  CheckCircle2,
  AlertCircle,
  Bell,
  Link as LinkIcon,
  Users,
  GraduationCap,
  Globe,
  Radio,
  FileText,
  FileCheck2,
  Clock,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import api from '../../api/client';
import { BatchItem, AnnouncementCreateRequest } from '../../types';

interface AdminAnnouncementsTabProps {
  batches: BatchItem[];
}

type BroadcastTarget = 'BATCH' | 'GENERAL' | 'ALL';

export const AdminAnnouncementsTab: React.FC<AdminAnnouncementsTabProps> = ({ batches }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('ANNOUNCEMENT');
  const [target, setTarget] = useState<BroadcastTarget>('ALL');
  const [targetBatchId, setTargetBatchId] = useState<string>(
    batches.length > 0 ? String(batches[0].id) : ''
  );
  const [linkUrl, setLinkUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    msg: string;
    recipientCount: number;
    audienceLabel: string;
  } | null>(null);

  // Local log of sent broadcasts during this session
  const [recentBroadcasts, setRecentBroadcasts] = useState<Array<{
    title: string;
    message: string;
    type: string;
    target: BroadcastTarget;
    audienceLabel: string;
    timestamp: string;
    recipientCount?: number;
  }>>([]);

  const getAudienceLabel = (tgt: BroadcastTarget, bId?: string) => {
    if (tgt === 'BATCH') {
      const b = batches.find((item) => String(item.id) === bId);
      return b ? `Particular Batch: ${b.name} (${b.code})` : 'Particular Batch';
    }
    if (tgt === 'GENERAL') {
      return 'General Students (All Enrolled Cohorts)';
    }
    return 'All Platform Users (System-Wide)';
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !message.trim()) {
      setError('Announcement headline and message content are required.');
      return;
    }

    if (target === 'BATCH' && !targetBatchId) {
      setError('Please select a target batch for this cohort broadcast.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: AnnouncementCreateRequest = {
        title: title.trim(),
        message: message.trim(),
        type,
        target,
        targetBatchId: target === 'BATCH' && targetBatchId ? Number(targetBatchId) : undefined,
        linkUrl: linkUrl.trim() || undefined,
      };

      const res = await api.post('/admin/announcements', payload);
      const recipientCount = res.data?.data?.recipientCount ?? 0;
      const audienceLabel = getAudienceLabel(target, targetBatchId);

      setRecentBroadcasts([
        {
          title: title.trim(),
          message: message.trim(),
          type,
          target,
          audienceLabel,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recipientCount,
        },
        ...recentBroadcasts,
      ]);

      setTitle('');
      setMessage('');
      setLinkUrl('');
      setSuccessInfo({
        msg: `Broadcast dispatched successfully to ${recipientCount} user(s)!`,
        recipientCount,
        audienceLabel,
      });

      window.dispatchEvent(new Event('refresh-notifications'));
      setTimeout(() => setSuccessInfo(null), 7000);
    } catch (err: any) {
      console.error('Failed to broadcast announcement', err);
      setError(err.response?.data?.message || 'Failed to dispatch broadcast notification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successInfo && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg shadow-emerald-950/20 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-emerald-200 font-extrabold text-sm">{successInfo.msg}</p>
              <p className="text-emerald-400/80 text-[11px] font-medium mt-0.5">
                Target Audience: <span className="underline font-semibold">{successInfo.audienceLabel}</span> &bull; {successInfo.recipientCount} recipient notifications queued
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessInfo(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-semibold px-2 py-1 rounded-lg"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Megaphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Notification Broadcast Control Center
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Targeted Push
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Broadcast instant push alerts, batch notices, and system announcements. Target a <strong className="text-cyan-300">Particular Batch</strong>, <strong className="text-blue-300">General Students</strong>, or <strong className="text-purple-300">Entire Platform</strong>. Delivered immediately to student bell drawers and top dashboard marquees.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Compose Broadcast Notification</span>
            </h3>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-5 text-xs">
              {/* STEP 1: AUDIENCE TARGETING SELECTOR */}
              <div className="space-y-2">
                <label className="block font-black text-slate-200 text-xs uppercase tracking-wider">
                  1. Select Recipient Audience (Targeting) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Particular Batch */}
                  <button
                    type="button"
                    onClick={() => setTarget('BATCH')}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      target === 'BATCH'
                        ? 'bg-cyan-500/10 border-cyan-500 text-white ring-2 ring-cyan-500/30'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        target === 'BATCH' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700/60 text-slate-400'
                      }`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        target === 'BATCH' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                      }`}>
                        {target === 'BATCH' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </span>
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block text-slate-100">Particular Batch</span>
                      <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                        Specific cohort students only
                      </span>
                    </div>
                  </button>

                  {/* Option 2: General Students */}
                  <button
                    type="button"
                    onClick={() => setTarget('GENERAL')}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      target === 'GENERAL'
                        ? 'bg-blue-500/10 border-blue-500 text-white ring-2 ring-blue-500/30'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        target === 'GENERAL' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/60 text-slate-400'
                      }`}>
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        target === 'GENERAL' ? 'border-blue-400 bg-blue-400' : 'border-slate-600'
                      }`}>
                        {target === 'GENERAL' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </span>
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block text-slate-100">General Students</span>
                      <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                        All registered academy students
                      </span>
                    </div>
                  </button>

                  {/* Option 3: All Platform */}
                  <button
                    type="button"
                    onClick={() => setTarget('ALL')}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      target === 'ALL'
                        ? 'bg-purple-500/10 border-purple-500 text-white ring-2 ring-purple-500/30'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        target === 'ALL' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/60 text-slate-400'
                      }`}>
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        target === 'ALL' ? 'border-purple-400 bg-purple-400' : 'border-slate-600'
                      }`}>
                        {target === 'ALL' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </span>
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block text-slate-100">All (Platform-Wide)</span>
                      <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                        All active students & accounts
                      </span>
                    </div>
                  </button>
                </div>

                {/* Sub-dropdown when "Particular Batch" is chosen */}
                {target === 'BATCH' && (
                  <div className="p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-2 mt-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Select Cohort / Batch:</span>
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {batches.length} available batch{batches.length === 1 ? '' : 'es'}
                      </span>
                    </div>
                    <select
                      value={targetBatchId}
                      onChange={(e) => setTargetBatchId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-white font-semibold outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
                    >
                      {batches.length === 0 ? (
                        <option value="">No active batches configured</option>
                      ) : (
                        batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.code})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* STEP 2: CATEGORY & TITLE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <label className="block font-bold text-slate-300 mb-1">
                    Notification Category *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
                  >
                    <option value="ANNOUNCEMENT">📢 Announcement (Standard)</option>
                    <option value="ALERT">🚨 Urgent Deadline / Alert</option>
                    <option value="UPDATE">🚀 Curriculum / Update</option>
                    <option value="ASSIGNMENT">📝 Assignment / Lab</option>
                    <option value="TEST">🎯 Test / Assessment</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">
                    Announcement Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Schedule Update: Midterm Assessment Window Extended"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold outline-none focus:ring-2 focus:ring-cyan-500 text-xs placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* STEP 3: MESSAGE BODY */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Notification Body / Message Content *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Compose detailed message instructions, deadlines, or action items for learners..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium outline-none focus:ring-2 focus:ring-cyan-500 text-xs placeholder:text-slate-500 leading-relaxed"
                />
              </div>

              {/* STEP 4: ACTION LINK */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Action Link URL / Destination (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="e.g. /assignments/14 or https://meet.google.com/..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none font-mono text-[11px] placeholder:text-slate-500"
                  />
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Learners can click this link directly from their notification drawer or marquee to open the assignment, test, class, or external URL.
                </p>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>
                    Will dispatch to: <strong className="text-white">{getAudienceLabel(target, targetBatchId)}</strong>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-950/40 flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Dispatching Broadcast...' : 'Broadcast Notification'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Student Notification Preview & Stream */}
        <div className="space-y-6">
          {/* Live Notification Preview Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Student Bell Preview</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Interactive Preview
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Here is how this notification will appear in the learner's slide-over Notification Drawer:
            </p>

            {/* Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative space-y-2.5 shadow-inner">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    {type === 'ALERT' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    ) : type === 'ASSIGNMENT' ? (
                      <FileText className="w-3.5 h-3.5 text-sky-400" />
                    ) : type === 'TEST' ? (
                      <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300">
                    {type}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Just now</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">
                  {title.trim() || 'Notification Title Preview'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {message.trim() || 'Compose message body in the form on the left to see the instant live preview of the learner notification card.'}
                </p>
              </div>

              {linkUrl.trim() && (
                <div className="pt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 hover:text-cyan-300">
                  <span>Open Resource / Action</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                <span>Audience: {target}</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
            </div>
          </div>

          {/* Session Dispatches Log */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-extrabold text-sm text-white flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Session Broadcasts Log</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {recentBroadcasts.length} sent
              </span>
            </h3>

            {recentBroadcasts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <Megaphone className="w-7 h-7 text-slate-700 mx-auto" />
                <p>No broadcast dispatches sent during this session.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {recentBroadcasts.map((b, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white text-xs line-clamp-1">
                        {b.title}
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">{b.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {b.message}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-cyan-400 font-medium">
                        {b.audienceLabel}
                      </span>
                      {b.recipientCount !== undefined && (
                        <span className="text-emerald-400 font-bold">
                          {b.recipientCount} student{b.recipientCount === 1 ? '' : 's'}
                        </span>
                      )}
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
