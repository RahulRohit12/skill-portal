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

  interface NavItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: 'LEARNING',
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/courses', label: 'Courses', icon: BookOpen },
        { to: '/assignments', label: 'Assignments', icon: FileText },
        { to: '/tests', label: 'Tests', icon: FileCheck2 },
      ]
    },
    {
      title: 'CAREER & PLACEMENT',
      items: [
        { to: '/company-questions', label: 'Company Questions', icon: Building2 },
        { to: '/jobs', label: 'Jobs & Drives', icon: Briefcase },
        { to: '/attendance', label: 'Attendance', icon: QrCode },
      ]
    },
    {
      title: 'TOOLS & PROFILE',
      items: [
        { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
        { to: '/coding', label: 'Ask TAI', icon: Bot },
        { to: '/profile', label: 'Profile', icon: User },
      ]
    }
  ];

  if (user?.role === 'ROLE_ADMIN') {
    navSections.push({
      title: 'ADMINISTRATION',
      items: [
        { to: '/admin', label: 'Admin Console', icon: ShieldCheck },
        { to: '/admin/scanner', label: 'QR Scanner', icon: ScanLine },
      ]
    });
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

      {/* Sidebar Container: Collapsed (84px) on desktop, expands to 288px (w-72) on hover */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 bottom-0 left-0 z-40 h-screen bg-[#0c0e12] border-r border-[#191c24] transition-all duration-300 ease-in-out flex flex-col justify-between select-none ${
          isOpen
            ? 'translate-x-0 w-72'
            : '-translate-x-full lg:translate-x-0 ' + (isHovered ? 'lg:w-72 shadow-2xl shadow-black/90 z-50' : 'lg:w-[84px]')
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
          {/* Brand Logo & Notification Header */}
          <div className="pt-4 px-3.5 pb-3 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-3 group overflow-hidden">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0077b6] via-[#0096c7] to-[#00c2ff] flex items-center justify-center text-white shadow-md shadow-cyan-500/30 border border-cyan-300/30">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                {/* Notification Badge 77 */}
                <span className="absolute -top-1 -right-1.5 px-1.5 py-0.2 min-w-[18px] h-4.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-[#0c0e12]">
                  77
                </span>
              </div>

              {isHovered && (
                <div className="flex flex-col overflow-hidden animate-in fade-in duration-200">
                  <span className="font-black text-base sm:text-lg tracking-tight text-white leading-none whitespace-nowrap flex items-center">
                    <span>SKILL</span>
                    <span className="text-[#00c2ff] mx-0.5">X</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">
                      ACADEMY
                    </span>
                  </span>
                  <span className="text-[11px] text-cyan-400 tracking-wider font-extrabold uppercase mt-1 whitespace-nowrap">
                    Engineering Portal
                  </span>
                </div>
              )}
            </NavLink>

            {isHovered && (
              <div className="relative animate-in fade-in duration-200">
                <button
                  onClick={() => navigate('/notifications')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-[#141722] rounded-xl transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Search Bar */}
          <div className="px-3 pb-2">
            {isHovered ? (
              <div className="relative flex items-center animate-in fade-in duration-200">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Search portal, courses, topics..."
                  className="w-full bg-[#141722] border border-[#1e2535] focus:border-[#00c2ff] text-slate-100 text-sm pl-10 pr-3 py-2 rounded-xl outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => setIsHovered(true)}
                  className="w-12 h-12 rounded-xl bg-[#141722] hover:bg-[#1c2232] border border-[#1e2535] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick QR Code / Scanner Action */}
          <div className="px-3 py-1">
            {user?.role === 'ROLE_ADMIN' ? (
              isHovered ? (
                <NavLink
                  to="/admin/scanner"
                  onClick={onCloseMobile}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-bold text-[#00c2ff] hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40 rounded-xl transition-all text-left shadow-sm animate-in fade-in duration-200"
                >
                  <ScanLine className="w-5 h-5 text-[#00c2ff] shrink-0" />
                  <span className="whitespace-nowrap font-black">Admin Scanner</span>
                </NavLink>
              ) : (
                <div className="flex justify-center">
                  <NavLink
                    to="/admin/scanner"
                    className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-[#00c2ff] hover:scale-105 transition-transform"
                    title="Admin Scanner"
                  >
                    <ScanLine className="w-5 h-5" />
                  </NavLink>
                </div>
              )
            ) : isHovered ? (
              <button
                onClick={() => setShowQrModal(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-bold text-slate-200 hover:text-white bg-[#141722] hover:bg-[#1c2232] border border-[#1e2535] rounded-xl transition-all text-left animate-in fade-in duration-200 shadow-sm"
              >
                <QrCode className="w-5 h-5 text-[#00c2ff] shrink-0" />
                <span className="whitespace-nowrap font-bold">My Attendance QR</span>
              </button>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="w-12 h-12 rounded-xl bg-[#141722] hover:bg-[#1c2232] border border-[#1e2535] flex items-center justify-center text-[#00c2ff] hover:scale-105 transition-transform"
                  title="My Attendance QR"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Grouped Navigation Links */}
          <nav className="px-3 flex-1 mt-2 space-y-3">
            {navSections.map((section, sIdx) => (
              <div key={section.title} className="space-y-1">
                {/* Section Title when Hovered / Expanded */}
                {isHovered ? (
                  <div className="px-3 pt-2 pb-1 text-xs font-black tracking-wider text-slate-400 uppercase select-none animate-in fade-in duration-200">
                    {section.title}
                  </div>
                ) : (
                  sIdx > 0 && <div className="w-8 h-px bg-[#1a202c] mx-auto my-2" />
                )}

                {/* Items in section */}
                <div className="space-y-1.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          `flex items-center ${
                            isHovered
                              ? 'gap-3.5 px-3.5 py-2.5 justify-start'
                              : 'justify-center w-12 h-12 mx-auto'
                          } rounded-xl text-sm transition-all font-bold group select-none ${
                            isActive
                              ? 'bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-blue-600/10 text-white font-black border-2 border-[#00c2ff]/40 shadow-lg shadow-cyan-950/40'
                              : 'text-slate-300 hover:text-white hover:bg-[#141722] border border-transparent hover:border-[#1e2535]'
                          }`
                        }
                        title={!isHovered ? item.label : undefined}
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              className={`w-5 h-5 shrink-0 transition-colors ${
                                isActive ? 'text-[#00c2ff]' : 'text-slate-400 group-hover:text-slate-200'
                              }`}
                            />
                            {isHovered && (
                              <span className="truncate whitespace-nowrap text-sm font-bold animate-in fade-in duration-200">
                                {item.label}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Placement Readiness Score, Theme Switcher & Profile Card */}
        <div className="p-3 border-t border-[#191c24] space-y-2.5 bg-[#0a0c10]">
          {/* Placement Readiness Score Widget */}
          {isHovered ? (
            <div
              onClick={() => setShowReadinessModal(true)}
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#12151c] to-[#161c28] border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-sm animate-in fade-in duration-200"
              title="Click to view detailed Placement Readiness breakdown"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-9 h-9 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-xs font-black text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  85
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black text-emerald-400 tracking-wider flex items-center gap-1 uppercase whitespace-nowrap">
                    <span>PLACEMENT READINESS</span>
                  </span>
                  <span className="text-sm font-black text-white flex items-center gap-1">
                    85% <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black shrink-0 border border-emerald-500/30">
                Ready ⭐
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setShowReadinessModal(true)}
                className="w-12 h-12 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-xs font-black text-emerald-400 hover:scale-105 transition-transform shadow-md shadow-emerald-950/30"
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
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-xs ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                onClick={() => theme === 'light' && toggleTheme()}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-xs ${
                  theme === 'dark'
                    ? 'bg-[#000000] text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-4 h-4 text-[#38bdf8]" />
                <span>Dark</span>
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={toggleTheme}
                className="w-12 h-12 rounded-xl bg-[#12151c] hover:bg-[#1a202c] border border-[#1e2330] flex items-center justify-center text-[#38bdf8] hover:scale-105 transition-transform"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Student Profile User Bar */}
          {isHovered ? (
            <div className="pt-1 flex items-center justify-between gap-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-sm font-black shrink-0 border border-sky-400/40">
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-100 uppercase truncate whitespace-nowrap">
                      {user?.fullName || 'PRAJWAL'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 fill-emerald-500/20" />
                  </div>
                  <span className="text-xs text-slate-400 truncate whitespace-nowrap">
                    {user?.email || 'student@skillportal.com'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-[#1a1f2c] rounded-xl transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/profile')}
                className="w-12 h-12 rounded-full bg-[#0284c7] hover:ring-2 hover:ring-[#38bdf8] text-white flex items-center justify-center text-sm font-black shrink-0 transition-all hover:scale-105 border border-sky-400/40"
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

