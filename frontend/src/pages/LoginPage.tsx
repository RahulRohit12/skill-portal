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
  const [rememberMe, setRememberMe] = useState(true);
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
      {/* Background Cyber Ambient Lights (Preserving Dark Theme) */}
      <div className="absolute top-0 left-1/3 -mt-24 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-24 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header Branding: Big SKILLEX ACADEMY Name + Graduation Cap with X Logo */}
      <header className="relative z-10 max-w-4xl mx-auto w-full text-center py-2 sm:py-4">
        {/* Academic Mortarboard with Cyber 'X' Emblem (No electric symbol) */}
        <div className="inline-flex relative mb-3 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity" />
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-[#0e1424] to-[#070a12] border-2 border-cyan-400/50 flex items-center justify-center shadow-2xl">
            <svg className="w-10 h-10 sm:w-11 sm:h-11" viewBox="0 0 48 48" fill="none">
              {/* Cap Diamond Top */}
              <path d="M24 6L6 16L24 26L42 16L24 6Z" fill="url(#capGrad)" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Cap Base */}
              <path d="M12 21V30C12 34 17 38 24 38C31 38 36 34 36 30V21" stroke="#00c2ff" strokeWidth="2" strokeLinecap="round" />
              {/* Tassel */}
              <path d="M38 18V32C38 33 37 34 36 34" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
              <circle cx="36" cy="34" r="2" fill="#facc15" />
              {/* Stylized White 'X' on Cap */}
              <path d="M20 12L28 20M28 12L20 20" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="capGrad" x1="6" y1="6" x2="42" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0284c7" />
                  <stop offset="0.5" stopColor="#0ea5e9" />
                  <stop offset="1" stopColor="#00c2ff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Big SKILLEX ACADEMY Name with Highlighted X */}
        <div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white flex items-center justify-center">
            <span>SKILL</span>
            <span className="text-[#00c2ff] text-4xl sm:text-6xl font-black drop-shadow-[0_0_25px_rgba(0,194,255,1)] mx-0.5">
              X
            </span>
            <span className="ml-2 font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400 text-2xl sm:text-4xl">
              ACADEMY
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 tracking-wider uppercase mt-1">
            Learning Today, Leading Tomorrow
          </p>
        </div>
      </header>

      {/* Main Container: Login Card on Left, Student Boy on Right (Matching Image Layout) */}
      <main className="relative z-10 max-w-4xl mx-auto w-full my-auto py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* LEFT: Clean Login Card (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-blue-600/20 rounded-3xl blur-xl opacity-75 pointer-events-none" />

              <div className="relative rounded-3xl bg-[#0a0d14]/95 border-2 border-cyan-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                
                {/* Welcome Back Header */}
                <div className="mb-5">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Welcome Back!
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Sign in to your account
                  </p>
                </div>

                {/* Pill Tab Switcher: Student vs Admin */}
                <div className="flex p-1 bg-[#121622] rounded-xl mb-5 border border-[#1f2638]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminTab(false);
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      !isAdminTab
                        ? 'bg-[#0077b6] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminTab(true);
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      isAdminTab
                        ? 'bg-[#0077b6] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Admin
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Email / Student ID Input with User Icon */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={isAdminTab ? 'Admin Email Address' : 'Email or Student ID'}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#06080d] border border-[#1b2234] text-slate-100 placeholder-slate-500 focus:border-[#00c2ff] focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
                      required
                    />
                  </div>

                  {/* Password Input with Lock Icon & Eye Toggle */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#06080d] border border-[#1b2234] text-slate-100 placeholder-slate-500 focus:border-[#00c2ff] focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
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

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-[#06080d] border-slate-700 text-[#00c2ff] focus:ring-0"
                      />
                      <span>Remember me</span>
                    </label>
                    <span
                      onClick={() => alert('Password reset link has been dispatched to your registered email.')}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </span>
                  </div>

                  {/* Big Blue Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0077b6] via-[#0096c7] to-[#00b4d8] hover:from-[#0096c7] hover:to-[#00b4d8] text-white text-xs font-black shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.01] active:scale-95"
                  >
                    {loading ? (
                      <span>Signing In...</span>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </form>

                {/* 1-Click Demo Login Buttons */}
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

                {/* Contact Admin Link */}
                <div className="text-center mt-4 text-xs text-slate-400">
                  New here?{' '}
                  <span
                    onClick={() => alert('Please contact academy administration at admissions@skillex.edu for registration credentials.')}
                    className="text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Contact Admin
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT: 3D Student Boy Standing Beside the Card (5 Cols, Matching Mockup) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/25 via-sky-500/20 to-blue-600/25 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative w-64 sm:w-72 h-[380px] sm:h-[420px] rounded-3xl overflow-hidden border-2 border-cyan-400/40 bg-gradient-to-b from-[#0b101c] to-[#07090e] shadow-2xl flex items-center justify-center">
                <img
                  src="/student-mascot.png"
                  alt="SkillX Academy Student Mascot in X Hoodie"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                />
                
                {/* Floating Bottom Status Pill */}
                <div className="absolute bottom-3 left-3 right-3 py-1.5 px-3 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500/40 text-center flex items-center justify-between text-[11px] font-bold text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Active Learner
                  </span>
                  <span className="text-white font-black tracking-wide">Batch 2026</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Tech Stack Logos Bar: Java, Python, SQL, DSA, Spring Boot, HTML5 */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full pt-4 pb-2 border-t border-[#141824] flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-slate-500 text-center sm:text-left">
          &copy; {new Date().getFullYear()} SKILLEX ACADEMY &bull; All rights reserved.
        </span>

        {/* Clean Tech Logos (Java, Python, SQL, Data Structures, Spring, HTML) */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Java */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e1320] border border-orange-500/30 text-[11px] font-bold text-slate-200 shadow-sm" title="Java Enterprise">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M4 19c4.5 1.5 11.5 1.5 16 0M6 22c3.5 1 8.5 1 12 0" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <path d="M8.5 14.5c2.5.5 5.5.5 8 0 0 0 1-1.5 0-3s-3.5-1-4-2c-.5-1 .5-2 1-3-1.5 0-3 1.5-3 3s2.5 2 2.5 3c0 .5-.5 1-1.5 1.5-1 .5-2 0-3-.5" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 2.5c1 .8 1.5 2 1 3M14 2c1.2 1 1.8 2.2 1.2 3.5" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Java</span>
          </div>

          {/* Python */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e1320] border border-yellow-500/30 text-[11px] font-bold text-slate-200 shadow-sm" title="Python Mastery">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path fill="#38bdf8" d="M11.9 2c-3.1 0-5 .6-5 2.5V7h5.1c1.3 0 2.4 1.1 2.4 2.4v1.7h1.7c1.9 0 3.3-1.4 3.3-3.3V5.4C19.4 3.5 17.6 2 15 2h-3.1zm-1.8 1.8c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z" />
              <path fill="#facc15" d="M12.1 22c3.1 0 5-.6 5-2.5V17H12c-1.3 0-2.4-1.1-2.4-2.4v-1.7H7.9C6 12.9 4.6 14.3 4.6 16.2v2.4C4.6 20.5 6.4 22 9 22h3.1zm1.8-1.8c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" />
            </svg>
            <span>Python</span>
          </div>

          {/* SQL */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e1320] border border-cyan-500/30 text-[11px] font-bold text-slate-200 shadow-sm" title="MySQL Database">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#00c2ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5V12C3 13.66 7.03 15 12 15C16.97 15 21 13.66 21 12V5" />
              <path d="M3 12V19C3 20.66 7.03 22 12 22C16.97 22 21 20.66 21 19V12" />
            </svg>
            <span>SQL</span>
          </div>

          {/* Data Structures */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e1320] border border-emerald-500/30 text-[11px] font-bold text-slate-200 shadow-sm" title="Data Structures & Algorithms">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="4" r="2.5" fill="#10b981" />
              <circle cx="6" cy="12" r="2.5" fill="#10b981" />
              <circle cx="18" cy="12" r="2.5" fill="#10b981" />
              <path d="M10.5 5.5L7.5 10.5M13.5 5.5L16.5 10.5" stroke="#34d399" strokeWidth="1.5" />
            </svg>
            <span>DSA</span>
          </div>

          {/* Spring Boot */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e1320] border border-green-500/30 text-[11px] font-bold text-slate-200 shadow-sm" title="Spring Boot Microservices">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="1.5" />
              <path d="M12 6c-3 0-5 2.5-5 5.5 0 2.5 2 4.5 5 6.5 3-2 5-4 5-6.5 0-3-2-5.5-5-5.5z" fill="#4ade80" />
            </svg>
            <span>Spring</span>
          </div>

          {/* HTML5 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e1320] border border-red-500/30 text-[11px] font-bold text-slate-200 shadow-sm" title="HTML5 & Web">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M4 3l1.8 17.5L12 22l6.2-1.5L20 3H4z" fill="#e34f26" fillOpacity="0.2" stroke="#f97316" strokeWidth="1.5" />
              <path d="M8 8h8M8 12h7.5l-.5 4.5L12 17.5l-3-.9-.2-2" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>HTML</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
