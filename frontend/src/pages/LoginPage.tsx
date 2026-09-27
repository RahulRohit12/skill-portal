import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Lock,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Radio,
  Award
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
    <div className="min-h-screen bg-[#06080c] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden font-sans">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-0 left-1/4 -mt-32 w-[600px] h-[600px] bg-gradient-to-br from-cyan-600/15 via-blue-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-32 w-[550px] h-[550px] bg-gradient-to-tl from-indigo-600/15 via-purple-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-900/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-[#141824] bg-[#080b10]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00c2ff] to-[#38bdf8] flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/25 text-xl">
              ⚡
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                SKILLEX <span className="text-[#00c2ff]">ACADEMY</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 pl-2 border-l border-slate-700">
                Placement & Engineering Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Batch 2026 Admissions Open
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 lg:py-12 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Grand Skillex Branding & Tech Pillars Showcase */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Grand Headline & Electric Logo */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111624] border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#00c2ff]" />
                Top 1% Software Engineering Ecosystem
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#00b4d8] via-[#00c2ff] to-[#38bdf8] flex items-center justify-center text-slate-950 text-4xl sm:text-5xl font-black shadow-2xl shadow-cyan-500/30 ring-4 ring-cyan-500/20">
                  ⚡
                </div>
                <div>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
                    SKILLEX <span className="bg-gradient-to-r from-[#00c2ff] via-[#38bdf8] to-blue-400 bg-clip-text text-transparent">ACADEMY</span>
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
                    Master Enterprise Engineering • Dominate Technical Interviews
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Join high-performance cohort training with daily coding streaks, real-time Gemini AI voice mentorship, in-app live lectures, and rigorous interview drills.
              </p>
            </div>

            {/* 4 Flagship Tech Logos Grid (Java, Python, SQL, DSA) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#00c2ff]" />
                  Flagship Technology Stacks
                </span>
                <span className="text-[11px] text-cyan-400 font-semibold">
                  Industry-Grade Curriculum
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* 1. JAVA CARD */}
                <div className="p-4 rounded-2xl bg-[#0b0e14]/90 border border-amber-500/30 hover:border-amber-500/60 transition-all group shadow-lg shadow-amber-950/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600/20 to-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {/* Java Coffee Cup SVG */}
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                          <path d="M4 19c4.5 1.5 11.5 1.5 16 0M6 22c3.5 1 8.5 1 12 0" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                          <path d="M8.5 14.5c2.5.5 5.5.5 8 0 0 0 1-1.5 0-3s-3.5-1-4-2c-.5-1 .5-2 1-3-1.5 0-3 1.5-3 3s2.5 2 2.5 3c0 .5-.5 1-1.5 1.5-1 .5-2 0-3-.5" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M11 2.5c1 .8 1.5 2 1 3M14 2c1.2 1 1.8 2.2 1.2 3.5" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                          Java Enterprise
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Spring Boot • Microservices • OOP
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                      Enterprise
                    </span>
                  </div>
                </div>

                {/* 2. PYTHON CARD */}
                <div className="p-4 rounded-2xl bg-[#0b0e14]/90 border border-sky-500/30 hover:border-sky-500/60 transition-all group shadow-lg shadow-sky-950/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600/20 to-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {/* Python Dual Snake SVG */}
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                          <path fill="#38bdf8" d="M11.9 2c-3.1 0-5 .6-5 2.5V7h5.1c1.3 0 2.4 1.1 2.4 2.4v1.7h1.7c1.9 0 3.3-1.4 3.3-3.3V5.4C19.4 3.5 17.6 2 15 2h-3.1zm-1.8 1.8c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z" />
                          <path fill="#facc15" d="M12.1 22c3.1 0 5-.6 5-2.5V17H12c-1.3 0-2.4-1.1-2.4-2.4v-1.7H7.9C6 12.9 4.6 14.3 4.6 16.2v2.4C4.6 20.5 6.4 22 9 22h3.1zm1.8-1.8c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white group-hover:text-yellow-300 transition-colors">
                          Python Mastery
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          DSA • Automation • AI & Scripts
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-[10px] font-bold">
                      DSA & AI
                    </span>
                  </div>
                </div>

                {/* 3. SQL / MYSQL CARD */}
                <div className="p-4 rounded-2xl bg-[#0b0e14]/90 border border-cyan-500/30 hover:border-cyan-500/60 transition-all group shadow-lg shadow-cyan-950/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {/* SQL Database Cylinder SVG */}
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#00c2ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <ellipse cx="12" cy="5" rx="9" ry="3" />
                          <path d="M3 5V12C3 13.66 7.03 15 12 15C16.97 15 21 13.66 21 12V5" />
                          <path d="M3 12V19C3 20.66 7.03 22 12 22C16.97 22 21 20.66 21 19V12" />
                          <path d="M12 8.5v7" stroke="#38bdf8" strokeDasharray="2 2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                          MySQL & SQL
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Indexing • Relational Schemas • ACID
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                      RDBMS
                    </span>
                  </div>
                </div>

                {/* 4. DATA STRUCTURES & ALGORITHMS CARD */}
                <div className="p-4 rounded-2xl bg-[#0b0e14]/90 border border-emerald-500/30 hover:border-emerald-500/60 transition-all group shadow-lg shadow-emerald-950/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {/* Algorithmic Tree & Graph Nodes SVG */}
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="4" r="2.5" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
                          <circle cx="6" cy="12" r="2.5" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
                          <circle cx="18" cy="12" r="2.5" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
                          <circle cx="4" cy="20" r="2" fill="#059669" stroke="#34d399" strokeWidth="1.5" />
                          <circle cx="9" cy="20" r="2" fill="#059669" stroke="#34d399" strokeWidth="1.5" />
                          <circle cx="15" cy="20" r="2" fill="#059669" stroke="#34d399" strokeWidth="1.5" />
                          <circle cx="20" cy="20" r="2" fill="#059669" stroke="#34d399" strokeWidth="1.5" />
                          <path d="M10.5 5.5L7.5 10.5M13.5 5.5L16.5 10.5M5.5 14L4.5 18M7 14L8 18M17 14L16 18M18.5 14L19.5 18" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                          Data Structures & Algorithms
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Trees • Graphs • Dynamic Prog
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                      450+ Solved
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Academy Features Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#0a0d14] border border-[#161c28] text-center space-y-1">
                <span className="text-[#00c2ff] font-black text-base">🔥 52-Week</span>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Coding Streak
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0d14] border border-[#161c28] text-center space-y-1">
                <span className="text-emerald-400 font-black text-base">🤖 Gemini AI</span>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Voice Mentor
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0d14] border border-[#161c28] text-center space-y-1">
                <span className="text-rose-400 font-black text-base">🔴 In-App Live</span>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Daily Lectures
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0d14] border border-[#161c28] text-center space-y-1">
                <span className="text-amber-400 font-black text-base">💼 94.8%</span>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Placement Rate
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Futuristic Login Terminal Card */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Outer Neon Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-sky-500/20 to-blue-600/30 rounded-3xl blur-xl opacity-75 pointer-events-none" />

              <div className="relative rounded-3xl bg-[#0b0e14]/95 border-2 border-cyan-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                
                {/* Card Title & Icon */}
                <div className="text-center pb-5 mb-5 border-b border-[#171d2b]">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00c2ff] to-[#38bdf8] text-slate-950 font-black text-2xl shadow-lg shadow-cyan-500/20 mb-3">
                    ⚡
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Sign In to Portal
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select your portal account or use one-click demo
                  </p>
                </div>

                {/* Tab Switcher: Student vs Admin */}
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

                {/* Error Banner */}
                {error && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>{isAdminTab ? 'Admin Email Address' : 'Email or Student ID Number'}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {isAdminTab ? 'Admin Access' : 'e.g. STU-2026-001'}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={isAdminTab ? 'admin@skillportal.com' : 'student@skillportal.com or STU-2026-001'}
                        className="w-full px-4 py-3 text-xs rounded-xl bg-[#080a0f] border border-[#1e2638] text-slate-100 placeholder-slate-500 focus:border-[#00c2ff] focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Password</span>
                      <span className="text-[10px] text-cyan-400 hover:underline cursor-pointer">
                        Forgot Password?
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-4 pr-10 py-3 text-xs rounded-xl bg-[#080a0f] border border-[#1e2638] text-slate-100 placeholder-slate-500 focus:border-[#00c2ff] focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00c2ff] via-[#38bdf8] to-blue-500 hover:from-[#38bdf8] hover:to-blue-400 text-slate-950 text-xs font-black shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.01] active:scale-95 group"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Authenticating Credentials...
                      </span>
                    ) : (
                      <>
                        <span>Sign In to {isAdminTab ? 'Admin Portal' : 'Student Portal'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* 1-Click Demo Fillers */}
                <div className="mt-6 pt-5 border-t border-[#171d2b]">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-center mb-3">
                    Instant 1-Click Demo Accounts
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={fillStudentDemo}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#121622] text-[#00c2ff] border border-cyan-500/30 hover:bg-[#1a2134] hover:border-cyan-500/60 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#00c2ff]" />
                      <span>Student Demo</span>
                    </button>
                    <button
                      type="button"
                      onClick={fillAdminDemo}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#121622] text-[#38bdf8] border border-sky-500/30 hover:bg-[#1a2134] hover:border-sky-500/60 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Admin Demo</span>
                    </button>
                  </div>
                </div>

                {/* Security Footnote */}
                <div className="mt-5 text-center text-[10px] text-slate-500 flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>AES-256 Encrypted • Zero-JPA High Performance Stack</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#141824] bg-[#080b10]/80 backdrop-blur-md px-6 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} SKILLEX ACADEMY. All rights reserved.</span>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Java</span>
            <span>&bull;</span>
            <span>Python</span>
            <span>&bull;</span>
            <span>MySQL</span>
            <span>&bull;</span>
            <span>Data Structures</span>
            <span>&bull;</span>
            <span className="text-[#00c2ff]">Gemini AI 1.5</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
