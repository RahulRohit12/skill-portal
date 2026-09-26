import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  ScanLine,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Users,
  Clock,
  ArrowLeft,
  Keyboard,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Volume2,
  VolumeX,
  Mail
} from 'lucide-react';
import api from '../api/client';
import { QrScanResponse, TodayScanItem } from '../types';

export const AdminScannerPage: React.FC = () => {
  const navigate = useNavigate();

  // Scanner state
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Scan result state
  const [lastResult, setLastResult] = useState<QrScanResponse | null>(null);

  // Today's scans state
  const [todayScans, setTodayScans] = useState<TodayScanItem[]>([]);
  const [loadingScans, setLoadingScans] = useState<boolean>(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Beep sound generator using Web Audio API
  const playBeep = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch {
      // AudioContext not allowed or not supported; ignore gracefully
    }
  };

  const fetchTodayScans = async () => {
    setLoadingScans(true);
    try {
      const res = await api.get('/attendance/scans/today');
      setTodayScans(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch today scans', err);
    } finally {
      setLoadingScans(false);
    }
  };

  useEffect(() => {
    fetchTodayScans();
  }, []);

  const handleProcessScan = async (token: string) => {
    if (!token || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsSubmitting(true);

    try {
      const res = await api.post('/attendance/qr/scan', {
        qrToken: token.trim(),
        deviceInfo: navigator.userAgent.slice(0, 100),
      });

      const data: QrScanResponse = res.data?.data;
      setLastResult(data);

      if (data.attendanceStatus === 'PRESENT') {
        playBeep('success');
      } else if (data.attendanceStatus === 'ALREADY_MARKED') {
        playBeep('warning');
      } else {
        playBeep('error');
      }

      // Refresh today's scans log
      fetchTodayScans();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Error communicating with attendance server.';
      const fallbackResult: QrScanResponse = {
        attendanceStatus: 'INVALID_QR',
        message: errMsg,
      };
      setLastResult(fallbackResult);
      playBeep('error');
    } finally {
      setIsSubmitting(false);
      // Wait before unlocking to prevent immediate double reads of the exact same code
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1500);
    }
  };

  const startScanner = async () => {
    setScannerError(null);
    try {
      const elementId = 'admin-qr-reader';
      const element = document.getElementById(elementId);
      if (!element) return;

      const html5QrCode = new Html5Qrcode(elementId);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' }, // Prefer rear smartphone camera
        config,
        (decodedText) => {
          handleProcessScan(decodedText);
        },
        () => {
          // Frame error; ignore scanning noise
        }
      );
      setScannerActive(true);
    } catch (err: any) {
      console.error('Camera initialization failed', err);
      setScannerError(
        err.message || 'Unable to access camera. Please grant camera permissions or use manual entry.'
      );
      setScannerActive(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Failed to stop camera scanner', err);
      }
      html5QrCodeRef.current = null;
    }
    setScannerActive(false);
  };

  useEffect(() => {
    // Start camera on mount
    startScanner();

    return () => {
      // Clean up camera on unmount
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleProcessScan(manualToken.trim());
    setManualToken('');
  };

  const handleNextStudent = () => {
    setLastResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-xl bg-[#141720] border border-[#1e2330] text-slate-400 hover:text-white transition-colors"
            title="Back to Admin Console"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-[#00c2ff]" />
              <span>Admin Attendance Scanner</span>
            </h1>
            <p className="text-xs text-slate-400">
              High-speed QR scanner for real-time classroom check-ins
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-cyan-950/40 border-cyan-800/40 text-[#00c2ff]'
                : 'bg-[#141720] border-[#1e2330] text-slate-500'
            }`}
            title={soundEnabled ? 'Mute Audio Beep' : 'Enable Audio Beep'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Camera Toggle */}
          {scannerActive ? (
            <button
              onClick={stopScanner}
              className="px-3.5 py-2 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 hover:bg-rose-900/60 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          ) : (
            <button
              onClick={startScanner}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/60 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Start Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Camera Viewport (7 Cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="relative bg-[#0c0e12] border border-[#1f2430] rounded-3xl p-4 overflow-hidden shadow-2xl">
            {/* Camera Viewfinder Container */}
            <div className="relative w-full aspect-square max-h-[380px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              <div id="admin-qr-reader" className="w-full h-full object-cover" />

              {!scannerActive && !scannerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center">
                  <CameraOff className="w-10 h-10 text-slate-500" />
                  <p className="text-xs text-slate-400">Camera scanner is inactive.</p>
                  <button
                    onClick={startScanner}
                    className="px-4 py-2 rounded-xl bg-[#00b4d8] text-slate-950 text-xs font-black shadow-md hover:bg-[#00c2ff]"
                  >
                    Activate Camera
                  </button>
                </div>
              )}

              {scannerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 p-6 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-400" />
                  <p className="text-xs text-amber-200 font-medium max-w-xs">{scannerError}</p>
                  <button
                    onClick={startScanner}
                    className="px-4 py-2 rounded-xl bg-[#1e2430] hover:bg-[#2a3243] text-white text-xs font-bold transition-all"
                  >
                    Retry Access
                  </button>
                </div>
              )}

              {/* Aiming Reticle Overlay when active */}
              {scannerActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-[#00c2ff]/60 rounded-2xl relative">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#00c2ff] rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#00c2ff] rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#00c2ff] rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#00c2ff] rounded-br-lg" />
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#00c2ff]/40 animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {/* Manual Token Input Fallback */}
            <form onSubmit={handleManualSubmit} className="mt-4 pt-4 border-t border-[#1a1f2b] flex gap-2">
              <div className="relative flex-1">
                <Keyboard className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste or enter student QR token (QR-...)"
                  className="w-full bg-[#121620] border border-[#1e2533] focus:border-[#00b4d8] text-white text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none transition-all placeholder:text-slate-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={!manualToken.trim() || isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-[#00b4d8] hover:bg-[#00c2ff] disabled:opacity-50 text-slate-950 text-xs font-black transition-all shrink-0"
              >
                {isSubmitting ? 'Verifying...' : 'Check In'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Scan Result Card & Quick Actions (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          {/* Scan Result Feedback Card */}
          {lastResult ? (
            <div
              className={`p-6 rounded-3xl border shadow-xl space-y-4 animate-fade-in ${
                lastResult.attendanceStatus === 'PRESENT'
                  ? 'bg-emerald-950/20 border-emerald-800/60 shadow-emerald-950/30'
                  : lastResult.attendanceStatus === 'ALREADY_MARKED'
                  ? 'bg-amber-950/20 border-amber-800/60 shadow-amber-950/30'
                  : 'bg-rose-950/20 border-rose-800/60 shadow-rose-950/30'
              }`}
            >
              {/* Status Header Badge */}
              <div className="flex items-center justify-between">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                    lastResult.attendanceStatus === 'PRESENT'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : lastResult.attendanceStatus === 'ALREADY_MARKED'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {lastResult.attendanceStatus === 'PRESENT' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : lastResult.attendanceStatus === 'ALREADY_MARKED' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>
                    {lastResult.attendanceStatus === 'PRESENT'
                      ? 'ATTENDANCE MARKED'
                      : lastResult.attendanceStatus === 'ALREADY_MARKED'
                      ? 'ALREADY MARKED TODAY'
                      : 'VERIFICATION FAILED'}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-slate-400">
                  {lastResult.attendanceTime || new Date().toLocaleTimeString()}
                </span>
              </div>

              {/* Student Metadata */}
              {lastResult.student ? (
                <div className="space-y-3 pt-2">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {lastResult.student.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00c2ff] mt-0.5">
                      <span>{lastResult.student.studentIdNumber}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-sans">{lastResult.student.batchName}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0e121a] border border-[#1b2230] text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Session Topic:</span>
                      <span className="text-white font-semibold truncate max-w-[180px]">
                        {lastResult.sessionTitle || 'Daily Lecture'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Check-In Method:</span>
                      <span className="font-mono text-[#00c2ff] font-bold">
                        {lastResult.source || 'QR_SCAN'}
                      </span>
                    </div>
                    {lastResult.attendanceStatus === 'PRESENT' && (
                      <div className="flex items-center justify-between text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Student Email Notice:</span>
                        </span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span>Dispatched Realtime</span>
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                    {lastResult.existingMarkedAt && (
                      <div className="flex items-center justify-between text-amber-400 font-medium">
                        <span>Original Scan:</span>
                        <span className="font-mono font-bold">
                          {lastResult.existingMarkedAt}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-rose-300 font-medium pt-2">
                  {lastResult.message || 'Invalid or revoked QR token.'}
                </p>
              )}

              {/* Action Button: Scan Next Student */}
              <button
                onClick={handleNextStudent}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#0096c7] hover:from-[#00c2ff] hover:to-[#00b4d8] text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <span>Scan Next Student</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-[#0c0e12] border border-[#1f2430] text-center space-y-3 py-14">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 text-[#00c2ff] mx-auto flex items-center justify-center">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Ready for Scanning</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Hold the student's personal QR code up to the camera view finder. Attendance will be recorded instantly.
              </p>
            </div>
          )}

          {/* Today's Scan Counter Card */}
          <div className="p-4 rounded-2xl bg-[#0c0e12] border border-[#1f2430] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Today's Verified Scans
                </span>
                <span className="text-base font-black text-white">
                  {todayScans.length} Students Checked In
                </span>
              </div>
            </div>
            <button
              onClick={fetchTodayScans}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#181d28] transition-colors"
              title="Refresh Scans"
            >
              <RefreshCw className={`w-4 h-4 ${loadingScans ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Today's Live Attendance Feed */}
      <div className="p-6 rounded-3xl bg-[#0c0e12] border border-[#1f2430] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00c2ff]" />
            <h3 className="font-extrabold text-sm text-white">
              Live Classroom Scan Activity (Today)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {todayScans.length} verified check-ins
          </span>
        </div>

        {loadingScans ? (
          <div className="py-8 text-center text-xs text-slate-400">Updating scan records...</div>
        ) : todayScans.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No QR scans recorded today yet. Start scanning above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1b2230] text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">Student Name</th>
                  <th className="pb-3 font-bold">Roll / ID</th>
                  <th className="pb-3 font-bold">Cohort</th>
                  <th className="pb-3 font-bold">Scan Time</th>
                  <th className="pb-3 font-bold">Source</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161c28]">
                {todayScans.map((scan) => (
                  <tr key={scan.recordId} className="hover:bg-[#121620] transition-colors">
                    <td className="py-3 font-bold text-white">
                      {scan.studentName}
                    </td>
                    <td className="py-3 font-mono text-[#00c2ff]">
                      {scan.studentIdNumber}
                    </td>
                    <td className="py-3 text-slate-300">
                      {scan.batchName}
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {scan.scanTime}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-cyan-950/60 text-[#00c2ff] border border-cyan-800/50">
                        {scan.source}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" />
                        {scan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
