import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Megaphone,
  FileText,
  FileCheck2,
  BookOpen,
  AlertCircle,
  ExternalLink,
  Clock,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import { NotificationItem } from '../components/notification/StudentNotificationCenter';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'ANNOUNCEMENT' | 'ACADEMIC'>('ALL');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
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
      console.warn('Failed to load notifications page:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const onRefresh = () => fetchNotifications();
    window.addEventListener('refresh-notifications', onRefresh);
    return () => window.removeEventListener('refresh-notifications', onRefresh);
  }, []);

  const markSingleAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      window.dispatchEvent(new Event('refresh-notifications'));
    } catch (err) {
      console.warn('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      window.dispatchEvent(new Event('refresh-notifications'));
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredList = notifications.filter((item) => {
    if (filterType === 'UNREAD' && item.read) return false;
    if (filterType === 'ANNOUNCEMENT') {
      const t = (item.type || '').toUpperCase();
      if (t !== 'ANNOUNCEMENT' && t !== 'BROADCAST' && t !== 'ALERT') return false;
    }
    if (filterType === 'ACADEMIC') {
      const t = (item.type || '').toUpperCase();
      if (t !== 'ASSIGNMENT' && t !== 'TEST' && t !== 'COURSE') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchMsg = item.message?.toLowerCase().includes(q);
      if (!matchTitle && !matchMsg) return false;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0d1422] via-[#0f172a] to-[#0a101f] border border-cyan-500/25 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 border border-cyan-300/40 shrink-0">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Notification Center
                </h1>
                {unreadCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-500/30 animate-pulse">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Stay updated with official cohort broadcasts, urgent deadline reminders, exam dates, and batch notices.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAll}
              className="px-4 py-2.5 rounded-xl bg-[#141b2a] hover:bg-[#1a253a] text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-md"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All As Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar: Search & Filter Tabs */}
      <div className="p-4 rounded-2xl bg-[#0f131c] border border-[#1d2433] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keywords or title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141824] border border-[#1e2738] focus:border-[#00c2ff] text-slate-100 text-xs outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Notices' },
            { id: 'UNREAD', label: `Unread (${unreadCount})` },
            { id: 'ANNOUNCEMENT', label: 'Broadcasts' },
            { id: 'ACADEMIC', label: 'Academic & Tests' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#151c2c] border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="py-24 text-center space-y-3 bg-[#0c1017] rounded-3xl border border-[#1b2230]">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading your notification stream...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-24 text-center space-y-3 bg-[#0c1017] rounded-3xl border border-[#1b2230] p-6">
            <div className="w-16 h-16 rounded-3xl bg-[#121722] border border-[#1f293d] flex items-center justify-center text-slate-500 mx-auto">
              <Bell className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-white">No Notifications Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No notifications matching "${searchQuery}". Try a different keyword.`
                : 'Your notification inbox is clean. Broadcast updates from faculty and administrators will appear here.'}
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all duration-200 relative ${
                !item.read
                  ? 'bg-gradient-to-r from-[#0d1524] via-[#0e1628] to-[#0a101b] border-cyan-500/35 shadow-lg shadow-cyan-950/20'
                  : 'bg-[#0c1017] border-[#1a2232] hover:border-[#222e44]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#131b2b] border border-[#1f2b44] flex items-center justify-center shrink-0 shadow-md">
                    {item.type === 'ALERT' ? (
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                    ) : item.type === 'ASSIGNMENT' ? (
                      <FileText className="w-5 h-5 text-sky-400" />
                    ) : item.type === 'TEST' ? (
                      <FileCheck2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Megaphone className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 text-[10px] font-black border border-cyan-800/60 uppercase">
                        {item.type || 'NOTICE'}
                      </span>
                      {!item.read && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-[#00c2ff] text-[10px] font-black border border-sky-500/30">
                          NEW
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(item.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line max-w-3xl">
                      {item.message}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {item.linkUrl && (
                    <button
                      onClick={() => {
                        if (item.linkUrl?.startsWith('http')) {
                          window.open(item.linkUrl, '_blank');
                        } else if (item.linkUrl) {
                          navigate(item.linkUrl);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open Link</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!item.read && (
                    <button
                      onClick={() => markSingleAsRead(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#141b29] hover:bg-[#1a2336] text-slate-300 hover:text-white border border-[#222e44] text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
