import React, { useRef } from 'react';
import {
  Award,
  Download,
  Share2,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Copy,
  Printer
} from 'lucide-react';

interface SkillexCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  studentName: string;
}

export const SkillexCertificateModal: React.FC<SkillexCertificateModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
  studentName,
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const certId = `SKX-${courseTitle.slice(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleLinkedInShare = () => {
    const certUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      courseTitle + ' Professional Certification'
    )}&organizationName=${encodeURIComponent(
      'Skillex Academy'
    )}&issueYear=${new Date().getFullYear()}&issueMonth=${
      new Date().getMonth() + 1
    }&certUrl=${encodeURIComponent(
      window.location.href
    )}&certId=${encodeURIComponent(certId)}`;
    window.open(certUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/verify/${certId}`
    );
    alert('Certificate Verification Link copied to clipboard!');
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0c0e14] border border-[#263147] w-full max-w-3xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2430]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest">
              Verified Course Credential
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#161922] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Canvas Box */}
        <div
          ref={certRef}
          className="relative rounded-2xl bg-gradient-to-b from-[#10141f] to-[#0a0d14] p-8 sm:p-12 border-4 border-amber-500/40 text-center space-y-6 shadow-2xl overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.05) 0%, rgba(10, 13, 20, 0.95) 75%)',
          }}
        >
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Award className="w-96 h-96 text-amber-300" />
          </div>

          {/* Academy Brand Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black tracking-widest uppercase">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>SKILLEX ACADEMY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase pt-2">
              Certificate of Completion
            </h2>
            <p className="text-[11px] text-amber-200/70 tracking-widest uppercase">
              Official Academic Accreditation
            </p>
          </div>

          {/* Recipient Presentation */}
          <div className="space-y-2 py-2">
            <p className="text-xs text-slate-400 italic">This is proudly conferred upon</p>
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 tracking-tight">
              {studentName || 'Prajwal Diggavi'}
            </h1>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
            <p className="text-xs text-slate-300 max-w-lg mx-auto pt-2 leading-relaxed">
              for successfully completing all video lectures, real-world development modules, assignments, and practical laboratory criteria in
            </p>
            <h3 className="text-base sm:text-lg font-black text-sky-300">
              {courseTitle}
            </h3>
          </div>

          {/* Footer Metadata & Signatures */}
          <div className="pt-6 border-t border-amber-500/20 grid grid-cols-3 items-end text-center gap-4">
            {/* Left: Issue Date */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-200">{today}</span>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Date Issued
              </p>
            </div>

            {/* Center: Gold Seal */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-amber-200 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-amber-400 tracking-widest uppercase mt-1">
                VERIFIED
              </span>
            </div>

            {/* Right: Academic Director */}
            <div className="space-y-1">
              <div className="font-serif italic text-sm text-slate-200">
                Prof. K. R. Sharma
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Academic Director, Skillex
              </p>
            </div>
          </div>

          {/* Verification Code */}
          <div className="text-[10px] text-slate-500 font-mono tracking-widest pt-2">
            Credential ID: <span className="text-slate-400 font-bold">{certId}</span>
          </div>
        </div>

        {/* Action Buttons: LinkedIn, Download, Share */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1e2330] border border-[#263147] text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Copy className="w-4 h-4 text-sky-400" />
            <span>Copy Link</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1e2330] border border-[#263147] text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleLinkedInShare}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0077b5] to-[#00a0dc] hover:from-[#006097] hover:to-[#008ec5] text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-sky-950/40 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Add to LinkedIn Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
