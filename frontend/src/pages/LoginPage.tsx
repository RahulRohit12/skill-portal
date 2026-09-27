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
  CheckCircle2,
  GraduationCap
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-0 left-1/4 -mt-20 w-[550px] h-[550px] bg-cyan-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-20 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-600/10 rounded-full blur-[170px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00c2ff] to-[#38bdf8] flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/25 text-xl">
            ⚡
          </div>
          <div>
            <span className="text-base sm:text-lg font-black tracking-tight text-white flex items-center">
              SKILL<span className="text-[#00c2ff] mx-0.5">X</span> ACADEMY
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Placement & Engineering Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Admissions 2026 Open
          </span>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="relative z-10 max-w-7xl mx-auto w-full my-auto py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* LEFT COLUMN: Big Skillex Academy Typography + 3D Student Mascot + Tech Badges */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Big Headline with Highlighted X */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#00c2ff]" />
                Top 1% Software Engineering Cohort
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
                SKILL<span className="text-[#00c2ff] relative inline-block drop-shadow-[0_0_30px_rgba(0,194,255,1)]">X</span>
              </h1>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-[#00c2ff] to-blue-500 uppercase">
                ACADEMY
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-300 max-w-lg leading-relaxed pt-1">
                Accelerate your coding journey with daily practice streaks, real Gemini AI voice mentor, live faculty classes, and comprehensive tech interview preparation.
              </p>
            </div>

            {/* Student Mascot Feature Box + Floating Tech Pillars */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 sm:p-6 rounded-3xl bg-[#0a0d16]/90 border border-cyan-500/25 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* 3D Student Mascot Image */}
              <div className="relative shrink-0 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-36 h-48 sm:w-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-cyan-400/50 bg-[#070a12] shadow-xl">
                  <img
                    src="/student-mascot.png"
                    alt="SkillX Student in X Hoodie"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-center py-1 rounded-lg bg-black/60 backdrop-blur-md border border-cyan-500/40">
                    <span className="text-[10px] font-black text-cyan-300 tracking-wider uppercase flex items-center justify-center gap-1">
                      <GraduationCap className="w-3 h-3 text-cyan-400" />
                      SkillX Student
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Mascot Pitch & 4 Tech Badges */}
              <div className="space-y-3.5 text-center sm:text-left">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Master the Core Engineering Stack
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Curated curriculum designed by top tech mentors & FAANG alumni
                  </p>
                </div>

                {/* The 4 Tech Badges: Java, Python, SQL, DSA */}
                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto sm:mx-0">
                  {/* Java */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-[#111624] border border-orange-500/30 text-xs font-bold text-slate-200 hover:border-orange-500/60 transition-all shadow-sm">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M4 19c4.5 1.5 11.5 1.5 16 0M6 22c3.5 1 8.5 1 12 0" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                      <path d="M8.5 14.5c2.5.5 5.5.5 8 0 0 0 1-1.5 0-3s-3.5-1-4-2c-.5-1 .5-2 1-3-1.5 0-3 1.5-3 3s2.5 2 2.5 3c0 .5-.5 1-1.5 1.5-1 .5-2 0-3-.5" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M11 2.5c1 .8 1.5 2 1 3M14 2c1.2 1 1.8 2.2 1.2 3.5" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>Java</span>
                  </div>

                  {/* Python */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-[#111624] border border-yellow-500/30 text-xs font-bold text-slate-200 hover:border-yellow-500/60 transition-all shadow-sm">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path fill="#38bdf8" d="M11.9 2c-3.1 0-5 .6-5 2.5V7h5.1c1.3 0 2.4 1.1 2.4 2.4v1.7h1.7c1.9 0 3.3-1.4 3.3-3.3V5.4C19.4 3.5 17.6 2 15 2h-3.1zm-1.8 1.8c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z" />
                      <path fill="#facc15" d="M12.1 22c3.1 0 5-.6 5-2.5V17H12c-1.3 0-2.4-1.1-2.4-2.4v-1.7H7.9C6 12.9 4.6 14.3 4.6 16.2v2.4C4.6 20.5 6.4 22 9 22h3.1zm1.8-1.8c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" />
                    </svg>
                    <span>Python</span>
                  </div>

                  {/* SQL */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-[#111624] border border-cyan-500/30 text-xs font-bold text-slate-200 hover:border-cyan-500/60 transition-all shadow-sm">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#00c2ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M3 5V12C3 13.66 7.03 15 12 15C16.97 15 21 13.66 21 12V5" />
                      <path d="M3 12V19C3 20.66 7.03 22 12 22C16.97 22 21 20.66 21 19V12" />
                    </svg>
                    <span>MySQL</span>
                  </div>

                  {/* DSA */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-[#111624] border border-emerald-500/30 text-xs font-bold text-slate-200 hover:border-emerald-500/60 transition-all shadow-sm">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="4" r="2.5" fill="#10b981" />
                      <circle cx="6" cy="12" r="2.5" fill="#10b981" />
                      <circle cx="18" cy="12" r="2.5" fill="#10b981" />
                      <path d="M10.5 5.5L7.5 10.5M13.5 5.5L16.5 10.5" stroke="#34d399" strokeWidth="1.5" />
                    </svg>
                    <span>Data Structures</span>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-3 text-[11px] text-slate-400 font-semibold pt-1">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Placement Focus
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5" /> Gemini 1.5 Active
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sleek Glassmorphic Login Card */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-blue-600/20 rounded-3xl blur-xl opacity-75 pointer-events-none" />

              <div className="relative rounded-3xl bg-[#0a0d14]/95 border-2 border-cyan-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                
                {/* Card Title */}
                <div className="text-center pb-4 mb-5 border-b border-[#192030]">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Sign In to Portal
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select your portal account or use one-click demo
                  </p>
                </div>

                {/* Student vs Admin Tab Switcher */}
                <div className="flex p-1 bg-[#121622] rounded-xl mb-5 border border-[#1f2638]">
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
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
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
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#06080d] border border-[#1b2234] text-slate-100 placeholder-slate-500 focus:border-[#00c2ff] focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
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
                        className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl bg-[#06080d] border border-[#1b2234] text-slate-100 placeholder-slate-500 focus:border-[#00c2ff] focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
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
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00c2ff] via-[#38bdf8] to-blue-500 hover:from-[#38bdf8] hover:to-blue-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.01] active:scale-95"
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
                <div className="mt-5 pt-4 border-t border-[#161c28]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
                    1-Click Demo Login
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={fillStudentDemo}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[#121622] text-[#00c2ff] border border-cyan-500/30 hover:border-cyan-500/60 hover:bg-[#181e2e] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#00c2ff]" />
                      Student Demo
                    </button>
                    <button
                      type="button"
                      onClick={fillAdminDemo}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[#121622] text-[#38bdf8] border border-sky-500/30 hover:border-sky-500/60 hover:bg-[#181e2e] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                      Admin Demo
                    </button>
                  </div>
                </div>

                {/* Security Tag */}
                <div className="mt-4 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Enterprise Secure Authentication &bull; AES-256</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full py-3 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#121722]">
        <span>&copy; {new Date().getFullYear()} SKILLEX ACADEMY. All rights reserved.</span>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Java</span>
          <span>&bull;</span>
          <span>Python</span>
          <span>&bull;</span>
          <span>MySQL</span>
          <span>&bull;</span>
          <span>Data Structures</span>
        </div>
      </footer>
    </div>
  );
};
