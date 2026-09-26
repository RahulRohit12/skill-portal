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
  Layers
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
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/tests', label: 'Tests', icon: FileCheck2 },
    { to: '/assignments', label: 'Assignments', icon: FileText },
    { to: '/company-questions', label: 'Company Questions', icon: Building2 },
    { to: '/jobs', label: 'Jobs & Drives', icon: Briefcase },
    { to: '/attendance', label: 'Attendance', icon: QrCode },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { to: '/coding', label: 'Ask TAI Assistant', icon: Bot },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  if (user?.role === 'ROLE_ADMIN') {
    navItems.push(
      {
        to: '/admin',
        label: 'Admin Console',
        icon: ShieldCheck,
      },
      {
        to: '/admin/scanner',
        label: 'QR Scanner',
        icon: ScanLine,
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
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Modern Executive Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 h-screen w-64 bg-[#0a0d14] border-r border-slate-800/80 transition-all duration-200 ease-out flex flex-col justify-between select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation Body */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Header Brand */}
          <div className="pt-4 px-4 pb-3.5 flex items-center justify-between border-b border-slate-800/60">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/10">
                <Layers className="w-4 h-4 text-white" />
              </div>

              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  SkillX Academy
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Learning Portal
                </span>
              </div>
            </NavLink>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-400" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="px-3 pt-3 pb-1">
            <div
              className={`relative flex items-center rounded-lg transition-all ${
                searchFocused
                  ? 'bg-slate-900 border border-sky-500/50 ring-1 ring-sky-500/20'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-transparent text-slate-200 text-xs pl-8 pr-10 py-1.5 rounded-lg outline-none placeholder:text-slate-500 font-medium"
              />
              <kbd className="absolute right-2 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 pointer-events-none">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Student QR Action */}
          <div className="px-3 py-1.5">
            {user?.role === 'ROLE_ADMIN' ? (
              <NavLink
                to="/admin/scanner"
                onClick={onCloseMobile}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-sky-400 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/40 rounded-lg transition-colors"
              >
                <ScanLine className="w-4 h-4 text-sky-400" />
                <span>Instructor QR Scanner</span>
              </NavLink>
            ) : (
              <button
                onClick={() => setShowQrModal(true)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-sky-400" />
                  <span>Student Attendance QR</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">ID Pass</span>
              </button>
            )}
          </div>

          {/* Menu Section Header */}
          <div className="px-3.5 pt-3 pb-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Navigation
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="px-2 space-y-0.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors font-medium relative ${
                      isActive
                        ? 'bg-slate-850 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-sm bg-sky-400" />
                      )}
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-sky-400' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer: Employability, Theme & User */}
        <div className="p-3 border-t border-slate-800/80 space-y-2 bg-[#090b10]">
          {/* Employability Metric Card */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Employability Score
              </span>
              <span className="text-xs font-bold text-white">0 / 100</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-sky-400 h-full rounded-full w-[4%]" />
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`flex-1 py-1 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 text-[11px] transition-colors ${
                theme === 'light'
                  ? 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`flex-1 py-1 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 text-[11px] transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
          </div>

          {/* User Profile Bar */}
          <div className="pt-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-white truncate">
                    {user?.fullName || 'Prajwal'}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'student@skillportal.com'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-850 transition-colors shrink-0"
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
