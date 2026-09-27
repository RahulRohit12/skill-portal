import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  X,
  CheckCheck,
  Megaphone,
  FileText,
  FileCheck2,
  BookOpen,
  AlertCircle,
  ExternalLink,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import api from '../../api/client';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
}

interface StudentNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshUnreadCount?: () => void;
}

export const StudentNotificationCenter: React.FC<StudentNotificationCenterProps> = ({
  isOpen,
  onClose,
  onRefreshUnreadCount,
}) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ANNOUNCEMENTS' | 'ACADEMIC'>('ALL');
  const [markingAll, setMarkingAll] = useState<boolean>(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const rawList = res.data?.data?.notifications || (Array.isArray(res.data?.data) ? res.data.data : []);
      const normalized = rawList.map((n: any) => ({
        ...n,
        read: Boolean(n.read ?? n.isRead),
      }));
      setNotifications(normalized);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const markSingleAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      window.dispatchEvent(new Event('refresh-notifications'));
      if (onRefreshUnreadCount) onRefreshUnreadCount();
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      window.dispatchEvent(new Event('refresh-notifications'));
      if (onRefreshUnreadCount) onRefreshUnreadCount();
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleLinkClick = (url?: string) => {
    if (!url) return;
    onClose();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank');
    } else {
      navigate(url);
    }
  };

  // Helper to format ISO timestamps relative or cleanly
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const getTypeIcon = (type: string) => {
    const t = (type || '').toUpperCase();
    if (t === 'ANNOUNCEMENT' || t === 'BROADCAST') {
      return <Megaphone className="w-4 h-4 text-cyan-400" />;
    }
    if (t === 'ALERT' || t === 'URGENT') {
      return <AlertCircle className="w-4 h-4 text-rose-400" />;
    }
    if (t === 'ASSIGNMENT') {
      return <FileText className="w-4 h-4 text-sky-400" />;
    }
    if (t === 'TEST' || t === 'EXAM_NOTICE') {
      return <FileCheck2 className="w-4 h-4 text-emerald-400" />;
    }
    if (t === 'COURSE' || t === 'LIVE_CLASS') {
      return <BookOpen className="w-4 h-4 text-purple-400" />;
    }
    return <Bell className="w-4 h-4 text-cyan-300" />;
  };

  const getTypeBadge = (type: string) => {
    const t = (type || '').toUpperCase();
    if (t === 'ANNOUNCEMENT' || t === 'BROADCAST') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 text-[10px] font-black border border-cyan-800/60 uppercase">
          Announcement
        </span>
      );
    }
    if (t === 'ALERT' || t === 'URGENT') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 text-[10px] font-black border border-rose-800/60 uppercase">
          Urgent Alert
        </span>
      );
    }
    if (t === 'ASSIGNMENT') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-400 text-[10px] font-black border border-sky-800/60 uppercase">
          Assignment
        </span>
      );
    }
    if (t === 'TEST' || t === 'EXAM_NOTICE') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 text-[10px] font-black border border-emerald-800/60 uppercase">
          Assessment
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-[#1b2333] text-slate-300 text-[10px] font-black border border-[#263147] uppercase">
        Update
      </span>
    );
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'UNREAD') return !item.read;
    if (filter === 'ANNOUNCEMENTS') {
      const t = (item.type || '').toUpperCase();
      return t === 'ANNOUNCEMENT' || t === 'BROADCAST' || t === 'ALERT';
    }
    if (filter === 'ACADEMIC') {
      const t = (item.type || '').toUpperCase();
      return t === 'ASSIGNMENT' || t === 'TEST' || t === 'COURSE';
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#0a0d14] border-l border-[#1a2233] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1a2233] bg-[#0c101a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-[#00c2ff] shadow-md shadow-cyan-950/40">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Notification Center
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[11px] font-black border border-rose-500/30">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cohort broadcasts, assignment deadlines & announcements
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#151c2c] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Mark All Read Toolbar */}
        <div className="px-4 py-2.5 border-b border-[#161c2a] bg-[#090c12] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'UNREAD', label: `Unread (${unreadCount})` },
              { id: 'ANNOUNCEMENTS', label: 'Broadcasts' },
              { id: 'ACADEMIC', label: 'Academic' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131926]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAll}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-cyan-300 hover:bg-[#131926] rounded-lg transition-colors flex items-center gap-1 shrink-0"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
        </div>

        {/* Notification List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
          {loading && notifications.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Checking your notification feed...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-20 text-center space-y-4 px-6">
              <div className="w-14 h-14 rounded-3xl bg-[#111724] border border-[#1d273a] flex items-center justify-center text-slate-500 mx-auto">
                <Bell className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">All Caught Up!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  {filter === 'UNREAD'
                    ? 'You have zero unread notifications. New broadcast alerts will appear here.'
                    : 'No notifications found matching your filter selection.'}
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 relative group ${
                  !item.read
                    ? 'bg-gradient-to-r from-[#0d1422] to-[#0a101b] border-cyan-500/30 shadow-md shadow-cyan-950/20'
                    : 'bg-[#0e121a]/80 border-[#1a2130] hover:border-[#242f44]'
                }`}
              >
                {/* Unread indicator glow */}
                {!item.read && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#00c2ff] shadow-[0_0_8px_#00c2ff]" />
                )}

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#131a28] border border-[#1d273b] flex items-center justify-center shrink-0 mt-0.5">
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getTypeBadge(item.type)}
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-300/90 mt-1 leading-relaxed break-words whitespace-pre-line">
                      {item.message}
                    </p>

                    {/* Action Bar: Link Button & Mark Read */}
                    <div className="mt-3 pt-2.5 border-t border-[#182030] flex items-center justify-between gap-2">
                      {item.linkUrl ? (
                        <button
                          onClick={() => handleLinkClick(item.linkUrl)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 flex items-center gap-1 transition-colors"
                        >
                          <span>Open Resource</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <div />
                      )}

                      {!item.read && (
                        <button
                          onClick={() => markSingleAsRead(item.id)}
                          className="text-[11px] font-bold text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                          title="Mark this notification as read"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark as read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1a2233] bg-[#0c101a] text-center">
          <button
            onClick={() => {
              onClose();
              navigate('/notifications');
            }}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
          >
            <span>View Full Notification History</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
