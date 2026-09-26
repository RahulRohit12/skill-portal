import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  FileText,
  Building2,
  Briefcase,
  Bookmark,
  Bot,
  User,
  ShieldCheck,
  QrCode,
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  CheckCircle2,
  ScanLine,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StudentQrModal } from '../attendance/StudentQrModal';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showQrModal, setShowQrModal] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Student Initials
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SX';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { to: '/courses', label: 'Courses', icon: BookOpen, badge: null },
    { to: '/tests', label: 'Tests', icon: FileCheck2, badge: 'Active' },
    { to: '/assignments', label: 'Assignments', icon: FileText, badge: 'Live' },
    { to: '/company-questions', label: 'Company Questions', icon: Building2, badge: null },
    { to: '/jobs', label: 'Jobs', icon: Briefcase, badge: 'Hot' },
    { to: '/attendance', label: 'Attendance', icon: QrCode, badge: null },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark, badge: null },
    { to: '/coding', label: 'Ask TAI', icon: Bot, badge: 'AI 2.0' },
    { to: '/profile', label: 'Profile', icon: User, badge: null },
  ];

  if (user?.role === 'ROLE_ADMIN') {
    navItems.push(
      {
        to: '/admin',
        label: 'Admin Console',
        icon: ShieldCheck,
        badge: 'Admin',
      },
      {
        to: '/admin/scanner',
        label: 'QR Scanner',
        icon: ScanLine,
        badge: 'Live',
      }
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Mobile Backdrop with Blur */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* 3D Glassmorphic Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 h-screen w-64 bg-gradient-to-b from-[#0b0e15]/95 via-[#0e121b]/95 to-[#080b11]/98 backdrop-blur-2xl border-r border-white/[0.08] transition-all duration-300 ease-in-out flex flex-col justify-between select-none shadow-[10px_0_35px_-5px_rgba(0,0,0,0.7)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Navigation Scroll Body */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
          {/* Brand Logo Header with 3D Holographic Badge */}
          <div className="pt-4 px-4 pb-3.5 flex items-center justify-between border-b border-white/[0.05]">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              {/* 3D Glowing Brand Crest */}
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00b4d8] via-[#00c2ff] to-[#38bdf8] flex items-center justify-center text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(0,194,255,0.45)] border border-white/40 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0c0e12] animate-pulse" />
              </div>

              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent group-hover:to-cyan-200 transition-all leading-tight">
                  SkillX Academy
                </span>
                <span className="text-[9px] text-[#00c2ff] tracking-widest font-bold uppercase mt-0.5 flex items-center gap-1">
                  <span>Pro Portal</span>
                  <Sparkles className="w-2.5 h-2.5 text-[#00c2ff]" />
                </span>
              </div>
            </NavLink>

            {/* Notification Bell with 3D Hologram Badge */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all duration-200 group"
              title="Notifications"
            >
              <Bell className="w-4 h-4 group-hover:text-cyan-300 transition-colors" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-[#00b4d8] to-[#38bdf8] text-slate-950 text-[9px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(0,194,255,0.5)]">
                2
              </span>
            </button>
          </div>

          {/* Quick Search Input with Inset 3D Styling */}
          <div className="px-3.5 pt-3.5 pb-2">
            <div
              className={`relative flex items-center rounded-xl transition-all duration-200 ${
                searchFocused
                  ? 'bg-[#141824] border border-[#00c2ff]/60 shadow-[0_0_16px_rgba(0,194,255,0.2)]'
                  : 'bg-[#10141f] border border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search portal..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-transparent text-slate-100 text-xs pl-8 pr-12 py-2 rounded-xl outline-none placeholder:text-slate-500 font-medium"
              />
              <kbd className="absolute right-2 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-slate-400 pointer-events-none">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Quick QR Attendance Action Button */}
          <div className="px-3.5 py-1.5">
            {user?.role === 'ROLE_ADMIN' ? (
              <NavLink
                to="/admin/scanner"
                onClick={onCloseMobile}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600/30 via-sky-600/20 to-transparent hover:from-cyan-600/40 hover:via-sky-600/30 border border-cyan-500/40 rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(0,194,255,0.15)] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <ScanLine className="w-3.5 h-3.5" />
                  </div>
                  <span className="tracking-wide">Admin Scanner</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </NavLink>
            ) : (
              <button
                onClick={() => setShowQrModal(true)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-gradient-to-r from-[#121622] to-[#151a29] hover:from-[#171d2c] hover:to-[#1a2133] border border-white/[0.08] hover:border-cyan-500/40 rounded-xl transition-all duration-200 shadow-sm group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#00c2ff]/15 border border-[#00c2ff]/30 flex items-center justify-center text-[#00c2ff] group-hover:scale-110 transition-transform">
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-xs text-slate-200 group-hover:text-white">
                    My Attendance QR
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400 font-bold tracking-tight bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded-full">
                  ID
                </span>
              </button>
            )}
          </div>

          {/* Navigation Category Label */}
          <div className="px-4.5 pt-3 pb-1 flex items-center justify-between">
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Main Menu
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.06] to-transparent ml-3" />
          </div>

          {/* 3D Interactive Navigation Links */}
          <nav className="px-2.5 space-y-1 flex-1 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-transparent border border-cyan-500/30 text-white font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_6px_18px_rgba(0,194,255,0.15)] translate-x-1'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.04] hover:translate-x-1'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        {/* 3D Indicator Strip for Active Item */}
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#00c2ff] shadow-[0_0_10px_#00c2ff]" />
                        )}

                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-cyan-500/20 text-[#38bdf8] border border-cyan-500/30 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
                              : 'text-slate-400 group-hover:text-slate-100 group-hover:bg-white/[0.06]'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="truncate text-xs tracking-tight">{item.label}</span>
                      </div>

                      {/* Pill Badge */}
                      {item.badge && (
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wide uppercase ${
                            isActive
                              ? 'bg-cyan-400 text-slate-950 shadow-sm'
                              : 'bg-white/[0.06] text-slate-400 group-hover:text-cyan-300 group-hover:bg-cyan-950/60 border border-transparent group-hover:border-cyan-800/40'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: 3D Employability Gauge, Theme Switcher & Profile Card */}
        <div className="p-3 border-t border-white/[0.08] space-y-2.5 bg-[#07090e]/95 backdrop-blur-xl">
          {/* 3D Employability Score Hologram Widget */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#111622] to-[#141b2a] border border-white/[0.08] shadow-[0_8px_20px_-4px_rgba(0,0,0,0.5)] flex items-center gap-3 relative overflow-hidden group">
            {/* Top highlight specular line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

            {/* Circular Gauge */}
            <div className="relative w-9 h-9 rounded-full bg-[#182030] border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,194,255,0.2)]">
              <svg className="w-full h-full -rotate-90 p-0.5" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#222b3d" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="url(#gauge-grad)"
                  strokeWidth="3"
                  strokeDasharray="94.2"
                  strokeDashoffset="75"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00c2ff" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-[10px] font-black text-cyan-300">0</span>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">
                  Employability
                </span>
                <span className="text-[8px] font-black text-cyan-400 bg-cyan-950/80 border border-cyan-800/40 px-1.5 py-0.2 rounded-full uppercase">
                  Tier 1
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xs font-black text-white">0</span>
                <span className="text-[10px] text-slate-500 font-medium">/ 100 PTS</span>
              </div>
            </div>
          </div>

          {/* 3D Modern Light/Dark Mode Toggle Pill */}
          <div className="p-1 rounded-xl bg-[#0f131c] border border-white/[0.08] flex items-center justify-between text-xs shadow-inner">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`flex-1 py-1 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all duration-200 text-[11px] ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`flex-1 py-1 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all duration-200 text-[11px] ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#171d2b] to-[#1f273a] text-cyan-300 shadow-md border border-cyan-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dark</span>
            </button>
          </div>

          {/* Student Profile User Bar with 3D Layered Look */}
          <div className="p-2 rounded-2xl bg-gradient-to-r from-[#0f131c] to-[#131824] border border-white/[0.06] flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-[0_0_12px_rgba(14,165,233,0.35)] border border-white/20">
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0f131c]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-extrabold text-white truncate tracking-tight">
                    {user?.fullName || 'PRAJWAL'}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 fill-emerald-500/20" />
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'student@skillportal.com'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Official Student QR Identity Modal */}
      <StudentQrModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />
    </>
  );
};
