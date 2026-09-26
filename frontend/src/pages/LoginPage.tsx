import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Zap } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090b0e] text-slate-100">
      <div className="w-full max-w-md">
        {/* Portal Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00b4d8] to-[#38bdf8] text-slate-950 font-black shadow-xl shadow-cyan-500/20 mb-4 text-2xl">
            ⚡
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#00c2ff]">
            SkillX Academy
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Skill Portal & Learning Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0c0e12] rounded-3xl shadow-2xl border border-[#1f2430] p-6 sm:p-8">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-[#141822] rounded-xl mb-6 border border-[#232a3b]">
            <button
              type="button"
              onClick={() => {
                setIsAdminTab(false);
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                !isAdminTab
                  ? 'bg-[#1e2536] text-[#00c2ff] shadow-sm border border-[#2a354c]'
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
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                isAdminTab
                  ? 'bg-[#1e2536] text-[#00c2ff] shadow-sm border border-[#2a354c]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isAdminTab ? 'Admin Email Address' : 'Email or Student ID Number'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isAdminTab ? 'admin@skillportal.com' : 'student@skillportal.com or STU-2026-001'}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#090b0e] border border-[#1f2430] text-slate-100 placeholder-slate-500 focus:border-[#00c2ff] transition-all outline-none"
                  required
                />
              </div>
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
                  className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl bg-[#090b0e] border border-[#1f2430] text-slate-100 placeholder-slate-500 focus:border-[#00c2ff] transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to {isAdminTab ? 'Admin Portal' : 'Student Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fillers */}
          <div className="mt-6 pt-5 border-t border-[#1a1f2c]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center mb-3">
              One-Click Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillStudentDemo}
                className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-[#141822] text-[#00c2ff] border border-[#232a3b] hover:bg-[#1a202c] transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00c2ff]" />
                Student Demo
              </button>
              <button
                type="button"
                onClick={fillAdminDemo}
                className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-[#141822] text-[#38bdf8] border border-[#232a3b] hover:bg-[#1a202c] transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                Admin Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-500">
          SkillX Academy LMS • High Performance Zero-JPA Stack
        </div>
      </div>
    </div>
  );
};

