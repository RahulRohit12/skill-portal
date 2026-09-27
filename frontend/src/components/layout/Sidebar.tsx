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
  AlertCircle,
  ScanLine,
  TrendingUp,
  Award,
  Target,
  GraduationCap,
  X
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
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Student Initials
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PD';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/tests', label: 'Tests', icon: FileCheck2 },
    { to: '/assignments', label: 'Assignments', icon: FileText },
    { to: '/company-questions', label: 'Company Questions', icon: Building2 },
    { to: '/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/attendance', label: 'Attendance', icon: QrCode },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { to: '/coding', label: 'Ask TAI', icon: Bot },
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container: Collapsed by default (70px) on desktop, expands to 256px on hover */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 bottom-0 left-0 z-40 h-screen bg-[#0c0e12] border-r border-[#191c24] transition-all duration-300 ease-in-out flex flex-col justify-between select-none ${
          isOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full lg:translate-x-0 ' + (isHovered ? 'lg:w-64 shadow-2xl shadow-black/80 z-50' : 'lg:w-[70px]')
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
          {/* Brand Logo & Notification Header */}
          <div className="pt-4 px-3.5 pb-3 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2.5 group overflow-hidden">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0077b6] via-[#0096c7] to-[#00c2ff] flex items-center justify-center text-white shadow-md shadow-cyan-500/25">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                {/* Notification Badge 77 as in user's image */}
                <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 min-w-[16px] h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-[#0c0e12]">
                  77
                </span>
              </div>

              {isHovered && (
                <div className="flex flex-col overflow-hidden animate-in fade-in duration-200">
                  <span className="font-black text-sm tracking-tight text-white leading-none whitespace-nowrap">
                    SKILL<span className="text-[#00c2ff]">X</span> ACADEMY
                  </span>
                  <span className="text-[9px] text-slate-400 tracking-wider font-semibold uppercase mt-0.5 whitespace-nowrap">
                    Engineering Portal
                  </span>
                </div>
              )}
            </NavLink>

            {isHovered && (
              <div className="relative animate-in fade-in duration-200">
                <button
                  onClick={() => navigate('/notifications')}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Search Bar */}
          <div className="px-2.5 pb-2">
            {isHovered ? (
              <div className="relative flex items-center animate-in fade-in duration-200">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-[#14171f] border border-[#1e2330] focus:border-[#00b4d8] text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => setIsHovered(true)}
                  className="w-9 h-9 rounded-xl bg-[#14171f] hover:bg-[#1a202c] border border-[#1e2330] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick QR Code / Scanner Action */}
          <div className="px-2.5 py-1">
            {user?.role === 'ROLE_ADMIN' ? (
              isHovered ? (
                <NavLink
                  to="/admin/scanner"
                  onClick={onCloseMobile}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#00c2ff] hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40 rounded-xl transition-all text-left shadow-sm animate-in fade-in duration-200"
                >
                  <ScanLine className="w-4 h-4 text-[#00c2ff] shrink-0" />
                  <span className="font-bold whitespace-nowrap">Admin Scanner</span>
                </NavLink>
              ) : (
                <div className="flex justify-center">
                  <NavLink
                    to="/admin/scanner"
                    className="w-9 h-9 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-[#00c2ff]"
                    title="Admin Scanner"
                  >
                    <ScanLine className="w-4 h-4" />
                  </NavLink>
                </div>
              )
            ) : isHovered ? (
              <button
                onClick={() => setShowQrModal(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#14171f] rounded-xl transition-all text-left animate-in fade-in duration-200"
              >
                <QrCode className="w-4 h-4 text-[#00c2ff] shrink-0" />
                <span className="whitespace-nowrap">My Attendance QR</span>
              </button>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="w-9 h-9 rounded-xl bg-[#14171f] hover:bg-[#1a202c] border border-[#1e2330] flex items-center justify-center text-[#00c2ff]"
                  title="My Attendance QR"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* MENU Category Label */}
          {isHovered && (
            <div className="px-4 pt-3 pb-1 animate-in fade-in duration-200">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                MENU
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-2 space-y-1 flex-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center ${
                      isHovered ? 'gap-3 px-3 py-2 justify-start' : 'justify-center p-2.5'
                    } rounded-xl text-xs transition-all font-medium group ${
                      isActive
                        ? 'bg-[#131b2e] text-[#38bdf8] font-semibold border border-[#00c2ff]/30 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#14171f]'
                    }`
                  }
                  title={!isHovered ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#38bdf8]' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      {isHovered && (
                        <span className="truncate whitespace-nowrap animate-in fade-in duration-200">
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Placement Readiness Score, Theme Switcher & Profile Card */}
        <div className="p-2.5 border-t border-[#191c24] space-y-2 bg-[#0a0c10]">
          {/* Placement Readiness Score Widget */}
          {isHovered ? (
            <div
              onClick={() => setShowReadinessModal(true)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#12151c] to-[#161c28] border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-sm animate-in fade-in duration-200"
              title="Click to view detailed Placement Readiness breakdown"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-8 h-8 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-[11px] font-black text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  85
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-extrabold text-emerald-400 tracking-wider flex items-center gap-1 uppercase whitespace-nowrap">
                    <span>PLACEMENT READINESS</span>
                  </span>
                  <span className="text-xs font-black text-white flex items-center gap-1">
                    85% <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                  </span>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-bold shrink-0 border border-emerald-500/30">
                Ready ⭐
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setShowReadinessModal(true)}
                className="w-10 h-10 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-[11px] font-black text-emerald-400 hover:scale-105 transition-transform"
                title="Placement Readiness: 85/100"
              >
                85
              </button>
            </div>
          )}

          {/* Light / Dark Mode Pill Toggle */}
          {isHovered ? (
            <div className="p-1 rounded-xl bg-[#12151c] border border-[#1e2330] flex items-center justify-between text-xs animate-in fade-in duration-200">
              <button
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all text-[11px] ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => theme === 'light' && toggleTheme()}
                className={`flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all text-[11px] ${
                  theme === 'dark'
                    ? 'bg-[#000000] text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Dark</span>
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl bg-[#12151c] hover:bg-[#1a202c] border border-[#1e2330] flex items-center justify-center text-[#38bdf8]"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Student Profile User Bar */}
          {isHovered ? (
            <div className="pt-1 flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-xs font-black shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-slate-100 uppercase truncate whitespace-nowrap">
                      {user?.fullName || 'PRAJWAL'}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 fill-emerald-500/20" />
                  </div>
                  <span className="text-[10px] text-slate-400 truncate whitespace-nowrap">
                    {user?.email || 'student@skillportal.com'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full bg-[#0284c7] hover:ring-2 hover:ring-[#38bdf8] text-white flex items-center justify-center text-xs font-black shrink-0 transition-all"
                title={user?.fullName || 'Prajwal'}
              >
                {initials}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Official Student QR Identity Modal */}
      <StudentQrModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />

      {/* Placement Readiness Score Breakdown Modal */}
      {showReadinessModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowReadinessModal(false)}
        >
          <div
            className="bg-[#0e1118] border border-[#1f2430] w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2430]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Placement Readiness Score</h3>
                  <p className="text-[11px] text-slate-400">Official Campus & Off-Campus Hiring Index</p>
                </div>
              </div>
              <button
                onClick={() => setShowReadinessModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#181c26]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Big Score Gauge Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-[#12151c] to-[#12151c] border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-emerald-400 flex items-baseline gap-1">
                  85 <span className="text-sm font-semibold text-slate-400">/ 100</span>
                </div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">
                  Tier-1 Placement Ready ⭐
                </div>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                  Eligible for top product company drives & interview shortlists.
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-4 border-emerald-500/50 flex flex-col items-center justify-center shadow-lg shadow-emerald-950/40">
                <span className="text-base font-black text-emerald-400">85%</span>
                <span className="text-[8px] font-bold text-slate-400">INDEX</span>
              </div>
            </div>

            {/* Score Breakdown Factors */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Evaluation Factors & Weights
              </h4>

              {/* Attendance */}
              <div className="p-3 rounded-xl bg-[#131620] border border-[#1f2430] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <span>📅</span> Lecture & Live Class Attendance
                  </span>
                  <span className="font-black text-emerald-400">92%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                </div>
                <span className="text-[10px] text-slate-500">Weight: 35% • Consistent daily attendance</span>
              </div>

              {/* Coding & Assignments */}
              <div className="p-3 rounded-xl bg-[#131620] border border-[#1f2430] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <span>💻</span> Coding Labs & Assignments
                  </span>
                  <span className="font-black text-sky-400">84%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: '84%' }} />
                </div>
                <span className="text-[10px] text-slate-500">Weight: 35% • High test case pass rate</span>
              </div>

              {/* Assessments */}
              <div className="p-3 rounded-xl bg-[#131620] border border-[#1f2430] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <span>📝</span> Assessments & MCQ Quizzes
                  </span>
                  <span className="font-black text-purple-400">78%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '78%' }} />
                </div>
                <span className="text-[10px] text-slate-500">Weight: 30% • Above cohort benchmark</span>
              </div>
            </div>

            {/* Recruiter Badge */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Student profile is actively tagged as <strong>Placement Ready</strong> for 2026 hiring recruiters.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

