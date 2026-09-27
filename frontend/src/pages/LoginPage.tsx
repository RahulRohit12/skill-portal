import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { loginStudent, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [isAdminTab, setIsAdminTab] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isAdminTab) {
        await loginAdmin(identifier, password);
        navigate('/admin');
      } else {
        await loginStudent(identifier, password);
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please verify your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillStudentDemo = () => {
    setIsAdminTab(false);
    setIdentifier('student@skillportal.com');
    setPassword('Student@123');
    setError(null);
  };

  const fillAdminDemo = () => {
    setIsAdminTab(true);
    setIdentifier('admin@skillportal.com');
    setPassword('Admin@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto z-10 space-y-6">
        
        {/* Brand Header with Highlighted X Logo */}
        <div className="text-center space-y-3">
          {/* Glowing Stylized Cyber 'X' Emblem */}
          <div className="inline-flex relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-[#00c2ff] to-blue-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-[#0e1320] via-[#090c14] to-[#06080e] border-2 border-cyan-400/60 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
              <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none">
                <defs>
                  <linearGradient id="cyberXGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#00c2ff" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Stylized Futuristic X */}
                <path
                  d="M6 6L14.5 18L6 30H11L17 21.2L23 30H28L19.5 18L28 6H23L17 14.8L11 6H6Z"
                  fill="url(#cyberXGlow)"
                  filter="url(#neonGlow)"
                />
                <circle cx="17" cy="18" r="2.5" fill="#ffffff" />
                <circle cx="17" cy="18" r="4.5" fill="#00c2ff" opacity="0.4" className="animate-ping" />
              </svg>
            </div>
          </div>

          {/* Typography with Highlighted X */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center">
              <span>SKILL</span>
              <span className="text-[#00c2ff] relative inline-block mx-0.5 scale-110 drop-shadow-[0_0_22px_rgba(0,194,255,1)]">
                X
              </span>
              <span className="ml-2 font-bold tracking-widest text-slate-300 text-xl sm:text-2xl">
                ACADEMY
              </span>
            </h1>
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-400 font-bold mt-1">
              Engineering & Placement Portal
            </p>
          </div>
        </div>

        {/* Clean Tech Logos Strip (Java, Python, SQL, DSA) */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Java */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d111a]/90 border border-orange-500/30 text-xs font-bold text-slate-200 shadow-sm hover:border-orange-500/60 transition-all">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M4 19c4.5 1.5 11.5 1.5 16 0M6 22c3.5 1 8.5 1 12 0" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <path d="M8.5 14.5c2.5.5 5.5.5 8 0 0 0 1-1.5 0-3s-3.5-1-4-2c-.5-1 .5-2 1-3-1.5 0-3 1.5-3 3s2.5 2 2.5 3c0 .5-.5 1-1.5 1.5-1 .5-2 0-3-.5" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 2.5c1 .8 1.5 2 1 3M14 2c1.2 1 1.8 2.2 1.2 3.5" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Java</span>
          </div>

          {/* Python */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d111a]/90 border border-yellow-500/30 text-xs font-bold text-slate-200 shadow-sm hover:border-yellow-500/60 transition-all">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path fill="#38bdf8" d="M11.9 2c-3.1 0-5 .6-5 2.5V7h5.1c1.3 0 2.4 1.1 2.4 2.4v1.7h1.7c1.9 0 3.3-1.4 3.3-3.3V5.4C19.4 3.5 17.6 2 15 2h-3.1zm-1.8 1.8c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z" />
              <path fill="#facc15" d="M12.1 22c3.1 0 5-.6 5-2.5V17H12c-1.3 0-2.4-1.1-2.4-2.4v-1.7H7.9C6 12.9 4.6 14.3 4.6 16.2v2.4C4.6 20.5 6.4 22 9 22h3.1zm1.8-1.8c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" />
            </svg>
            <span>Python</span>
          </div>

          {/* SQL */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d111a]/90 border border-cyan-500/30 text-xs font-bold text-slate-200 shadow-sm hover:border-cyan-500/60 transition-all">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#00c2ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5V12C3 13.66 7.03 15 12 15C16.97 15 21 13.66 21 12V5" />
              <path d="M3 12V19C3 20.66 7.03 22 12 22C16.97 22 21 20.66 21 19V12" />
            </svg>
            <span>MySQL</span>
          </div>

          {/* Data Structures */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d111a]/90 border border-emerald-500/30 text-xs font-bold text-slate-200 shadow-sm hover:border-emerald-500/60 transition-all">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="4" r="2.5" fill="#10b981" />
              <circle cx="6" cy="12" r="2.5" fill="#10b981" />
              <circle cx="18" cy="12" r="2.5" fill="#10b981" />
              <path d="M10.5 5.5L7.5 10.5M13.5 5.5L16.5 10.5" stroke="#34d399" strokeWidth="1.5" />
            </svg>
            <span>Data Structures</span>
          </div>
        </div>

        {/* Sleek Glassmorphic Login Card */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-blue-600/20 rounded-3xl blur-lg opacity-70 pointer-events-none" />

          <div className="relative rounded-3xl bg-[#0a0d14]/95 border border-[#1b2234] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Student vs Admin Tab Switcher */}
            <div className="flex p-1 bg-[#121622] rounded-xl mb-6 border border-[#1f2638]">
              <button
                type="button"
                onClick={() => {
                  setIsAdminTab(false);
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  !isAdminTab
                    ? 'bg-[#1b2234] text-[#00c2ff] shadow-md border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                Student Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdminTab(true);
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  isAdminTab
                    ? 'bg-[#1b2234] text-[#00c2ff] shadow-md border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Portal
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isAdminTab ? 'Admin Email Address' : 'Email or Student ID Number'}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isAdminTab ? 'admin@skillportal.com' : 'student@skillportal.com or STU-2026-001'}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#06080d] border border-[#1b2234] text-slate-100 placeholder-slate-500 focus:border-[#00c2ff] transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl bg-[#06080d] border border-[#1b2234] text-slate-100 placeholder-slate-500 focus:border-[#00c2ff] transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00c2ff] to-[#0284c7] hover:from-[#38bdf8] hover:to-[#0284c7] text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to {isAdminTab ? 'Admin' : 'Student'} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Demo Buttons */}
            <div className="mt-6 pt-5 border-t border-[#161c28]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
                1-Click Demo Login
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={fillStudentDemo}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-[#121622] text-[#00c2ff] border border-[#1f2638] hover:border-cyan-500/50 hover:bg-[#181e2e] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00c2ff]" />
                  Student Demo
                </button>
                <button
                  type="button"
                  onClick={fillAdminDemo}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-[#121622] text-[#38bdf8] border border-[#1f2638] hover:border-sky-500/50 hover:bg-[#181e2e] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                  Admin Demo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Footnote */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-slate-500" />
          <span>SkillX Academy &bull; Enterprise Secure Authentication</span>
        </div>

      </div>
    </div>
  );
};
