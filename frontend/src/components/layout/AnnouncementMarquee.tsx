import React, { useEffect, useState } from 'react';
import { Megaphone, AlertCircle, X } from 'lucide-react';
import api from '../../api/client';
import { NotificationItem } from '../../types';

export const AnnouncementMarquee: React.FC = () => {
  const [announcements, setAnnouncements] = useState<NotificationItem[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api.get('/notifications?unreadOnly=false')
      .then((res) => {
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setAnnouncements(res.data.data);
        }
      })
      .catch(() => {
        // Fallback default announcement
        setAnnouncements([
          {
            id: 1,
            title: 'Welcome to SkillX Academy',
            message: 'Mid-term assessments are scheduled. Practice coding in the Lab and maintain your daily streak!',
            type: 'ANNOUNCEMENT',
            linkUrl: '/tests',
            isRead: false,
            createdAt: new Date().toISOString()
          }
        ]);
      });
  }, []);

  if (dismissed || announcements.length === 0) return null;

  return (
    <div className="bg-[#0c141d] border-b border-cyan-500/20 text-slate-200 text-xs font-medium py-1.5 px-4 flex items-center justify-between shadow-sm relative z-30 overflow-hidden">
      <div className="flex items-center gap-2 shrink-0 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px] font-bold">
        <Megaphone className="w-3.5 h-3.5 animate-pulse" />
        <span>Updates</span>
      </div>

      <div className="marquee-container flex-1 overflow-hidden mx-4 whitespace-nowrap">
        <div className="inline-block animate-marquee hover:pause">
          {announcements.map((a, idx) => (
            <span key={a.id || idx} className="inline-flex items-center mx-8">
              <span className="font-semibold mr-1.5">{a.title}:</span>
              <span className="text-white/90">{a.message}</span>
              {idx < announcements.length - 1 && (
                <span className="mx-4 text-white/40">•</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
        title="Dismiss announcement banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
