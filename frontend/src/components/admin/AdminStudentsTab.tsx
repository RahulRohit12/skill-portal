import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Key,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  GraduationCap,
  CalendarCheck,
  FileCheck2,
  FileSpreadsheet,
  Code2,
  History,
  X,
  RefreshCw,
  Filter,
  QrCode,
  ShieldCheck,
  CreditCard,
  Copy,
  ExternalLink,
  Check,
  Mail,
  MessageSquare,
  Send,
  Phone
} from 'lucide-react';
import api from '../../api/client';
import {
  StudentAdminItem,
  StudentDetailResponse,
  BatchItem,
  CourseItem,
  StudentCreateRequest,
  StudentUpdateRequest,
  EnrollmentAdminItem
} from '../../types';

interface AdminStudentsTabProps {
  batches: BatchItem[];
  courses?: CourseItem[];
}

export const AdminStudentsTab: React.FC<AdminStudentsTabProps> = ({ batches, courses = [] }) => {
  const [students, setStudents] = useState<StudentAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sub-view switch: 'students' vs 'enrollments'
  const [activeSubView, setActiveSubView] = useState<'students' | 'enrollments'>('students');
  const [enrollments, setEnrollments] = useState<EnrollmentAdminItem[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<string>('ALL');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [sendingEmailToken, setSendingEmailToken] = useState<string | null>(null);
  const [emailSentTokens, setEmailSentTokens] = useState<Set<string>>(new Set());
  const [copiedMessageToken, setCopiedMessageToken] = useState<string | null>(null);
  const [generatedLinkData, setGeneratedLinkData] = useState<{
    enrollmentToken: string;
    paymentUrl: string;
    studentName: string;
    email: string;
    phone?: string;
    amountInRupees: number;
    courseTitle: string;
    batchName: string;
  } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [directCreationMode, setDirectCreationMode] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentAdminItem | null>(null);
  const [resetPwdStudent, setResetPwdStudent] = useState<StudentAdminItem | null>(null);
  const [viewingDetail, setViewingDetail] = useState<StudentDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<'profile' | 'attendance' | 'assignments' | 'tests' | 'coding' | 'activity' | 'qr'>('profile');
  const [regeneratingQr, setRegeneratingQr] = useState(false);

  // Form states for Add Student
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentIdNumber: '',
    phone: '',
    college: '',
    batchId: batches.length > 0 ? batches[0].id : 1,
    courseId: courses && courses.length > 0 ? courses[0].id : (batches[0]?.courseId || 1),
    amountInRupees: 4999,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states for Reset Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { size: 100 };
      if (search.trim()) params.search = search.trim();
      if (selectedBatch !== 'ALL') params.batchId = Number(selectedBatch);
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const res = await api.get('/admin/students', { params });
      setStudents(res.data?.data || []);
    } catch (err: any) {
      console.error('Failed to fetch students', err);
      setError(err.response?.data?.message || 'Failed to fetch students roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedBatch, selectedStatus]);

  const fetchEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const res = await api.get('/admin/enrollments/list');
      setEnrollments(res.data?.data || []);
    } catch (err: any) {
      console.error('Failed to fetch enrollments', err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    if (activeSubView === 'enrollments') {
      fetchEnrollments();
    }
  }, [activeSubView]);

  const handleCopyLink = (token: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/enroll/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    showNotification('Enrollment payment link copied to clipboard!');
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const handleGenerateEnrollmentLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!addForm.fullName.trim() || addForm.fullName.trim().length < 3) {
      setFormError('Full name must be at least 3 characters.');
      return;
    }
    if (!addForm.email.trim() || !addForm.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!addForm.studentIdNumber.trim()) {
      setFormError('Student ID Number is required (e.g. STU-2026-005).');
      return;
    }
    if (!addForm.amountInRupees || Number(addForm.amountInRupees) < 1) {
      setFormError('Course fee must be greater than ₹0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim().toLowerCase(),
        studentIdNumber: addForm.studentIdNumber.trim().toUpperCase(),
        phone: addForm.phone.trim(),
        college: addForm.college.trim(),
        batchId: Number(addForm.batchId),
        courseId: addForm.courseId ? Number(addForm.courseId) : undefined,
        amountInRupees: Number(addForm.amountInRupees),
      };

      const res = await api.post('/admin/enrollments/generate', payload);
      const data = res.data?.data;
      
      const fullPaymentUrl = `${window.location.origin}/enroll/${data.enrollmentToken}`;
      const selectedBatchObj = batches.find(b => b.id === Number(addForm.batchId));
      const selectedCourseObj = courses?.find(c => c.id === Number(addForm.courseId));

      setGeneratedLinkData({
        enrollmentToken: data.enrollmentToken,
        paymentUrl: fullPaymentUrl,
        studentName: data.studentName,
        email: data.email,
        phone: addForm.phone?.trim() || undefined,
        amountInRupees: Number(addForm.amountInRupees),
        courseTitle: selectedCourseObj?.title || data.courseTitle || 'Course Curriculum',
        batchName: selectedBatchObj?.name || data.batchName || 'General Batch',
      });

      if (data.enrollmentToken) {
        setEmailSentTokens((prev) => new Set(prev).add(data.enrollmentToken));
      }

      setShowAddModal(false);
      showNotification("Secure enrollment form generated & dispatched to student's Gmail!");
      fetchEnrollments();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to generate enrollment link.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendEmail = async (token: string, studentEmail?: string) => {
    setSendingEmailToken(token);
    try {
      await api.post(`/admin/enrollments/send-email/${token}`);
      setEmailSentTokens((prev) => new Set(prev).add(token));
      showNotification(`Payment form sent to student's Gmail (${studentEmail || 'registered email'})!`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send email to student.');
    } finally {
      setSendingEmailToken(null);
    }
  };

  const handleOpenWhatsApp = (studentName: string, phone: string | undefined, paymentUrl: string, courseTitle: string, amount: number) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = `Dear ${studentName},\n\nYour enrollment invitation for *${courseTitle}* at Skillex Academy is ready.\n\n💰 Course Fee: ₹${amount.toLocaleString('en-IN')}\n\nPlease review your details and complete secure payment to activate your student account:\n👉 ${paymentUrl}\n\nAccepted: UPI (Google Pay, PhonePe, Paytm), QR, Cards & Net Banking.\n\nThank you,\nSkillex Admissions Team`;
    const waUrl = phoneWithCountry
      ? `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handleOpenSms = (phone: string | undefined, studentName: string, paymentUrl: string, courseTitle: string, amount: number) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const msg = `Dear ${studentName}, your enrollment invitation for ${courseTitle} (Fee: Rs. ${amount}) is ready. Pay & complete registration at: ${paymentUrl} - Skillex Academy`;
    const smsUrl = cleanPhone ? `sms:${cleanPhone}?body=${encodeURIComponent(msg)}` : `sms:?body=${encodeURIComponent(msg)}`;
    window.location.href = smsUrl;
  };

  const handleCopyShareMessage = (token: string, studentName: string, paymentUrl: string, courseTitle: string, amount: number) => {
    const msg = `Dear ${studentName},\n\nYour enrollment invitation for *${courseTitle}* at Skillex Academy is ready.\n\nCourse Fee: ₹${amount.toLocaleString('en-IN')}\n\nPlease review your details and complete secure payment to activate your student account:\n${paymentUrl}\n\nAccepted: UPI (Google Pay, PhonePe, Paytm), QR, Debit/Credit Cards & Net Banking.\n\nThank you,\nSkillex Admissions Team`;
    navigator.clipboard.writeText(msg);
    setCopiedMessageToken(token);
    setTimeout(() => setCopiedMessageToken(null), 3000);
    showNotification('Student invitation message copied to clipboard!');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Toggle student status
  const handleToggleStatus = async (student: StudentAdminItem) => {
    const newStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/admin/students/${student.userId}/status`, { status: newStatus });
      setStudents((prev) =>
        prev.map((s) => (s.userId === student.userId ? { ...s, status: newStatus } : s))
      );
      showNotification(`Student status updated to ${newStatus}.`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update student status.');
    }
  };

  // View student details
  const handleViewDetails = async (userId: number) => {
    setLoadingDetail(true);
    setDetailTab('profile');
    try {
      const res = await api.get(`/admin/students/${userId}`);
      setViewingDetail(res.data?.data || null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load student details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // View student QR directly
  const handleViewQr = async (userId: number) => {
    setLoadingDetail(true);
    setDetailTab('qr');
    try {
      const res = await api.get(`/admin/students/${userId}`);
      setViewingDetail(res.data?.data || null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load student QR details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Regenerate student QR
  const handleRegenerateQr = async (studentId: number) => {
    if (!window.confirm('Regenerate this student QR identity? Any previous physical or digital QR tokens will be invalidated immediately.')) {
      return;
    }
    setRegeneratingQr(true);
    try {
      const res = await api.post(`/attendance/students/${studentId}/regenerate-qr`);
      const newToken = res.data?.data?.qrToken;
      if (viewingDetail && viewingDetail.profile) {
        setViewingDetail({
          ...viewingDetail,
          profile: {
            ...viewingDetail.profile,
            qrToken: newToken,
            qrStatus: 'ACTIVE',
          },
        });
      }
      setStudents((prev) =>
        prev.map((s) => (s.studentId === studentId ? { ...s, qrToken: newToken, qrStatus: 'ACTIVE' } : s))
      );
      showNotification('Student QR token regenerated and encrypted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to regenerate student QR code.');
    } finally {
      setRegeneratingQr(false);
    }
  };

  // Submit Add Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!addForm.fullName.trim() || addForm.fullName.trim().length < 3) {
      setFormError('Full name must be at least 3 characters.');
      return;
    }
    if (!addForm.email.trim() || !addForm.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!addForm.studentIdNumber.trim()) {
      setFormError('Student ID Number is required (e.g. STU-2026-005).');
      return;
    }
    if (addForm.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (addForm.password !== addForm.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: StudentCreateRequest = {
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim().toLowerCase(),
        password: addForm.password,
        confirmPassword: addForm.confirmPassword,
        studentIdNumber: addForm.studentIdNumber.trim().toUpperCase(),
        studentCode: addForm.studentIdNumber.trim().toUpperCase(),
        phone: addForm.phone.trim(),
        college: addForm.college.trim(),
        batchId: Number(addForm.batchId),
      };

      await api.post('/admin/students', payload);
      setShowAddModal(false);
      setAddForm({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        studentIdNumber: '',
        phone: '',
        college: '',
        batchId: batches.length > 0 ? batches[0].id : 1,
        courseId: courses && courses.length > 0 ? courses[0].id : (batches[0]?.courseId || 1),
        amountInRupees: 4999,
      });
      showNotification('New student account created successfully!');
      fetchStudents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create student.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Student
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setFormError(null);

    setSubmitting(true);
    try {
      const payload: StudentUpdateRequest = {
        fullName: editingStudent.name.trim(),
        email: editingStudent.email.trim(),
        studentIdNumber: editingStudent.studentIdNumber.trim().toUpperCase(),
        studentCode: editingStudent.studentIdNumber.trim().toUpperCase(),
        phone: editingStudent.phone || '',
        college: editingStudent.college || '',
        batchId: editingStudent.batchId,
      };

      await api.put(`/admin/students/${editingStudent.userId}`, payload);
      setEditingStudent(null);
      showNotification('Student details updated successfully!');
      fetchStudents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update student.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdStudent) return;
    setPwdError(null);

    if (newPassword.length < 8) {
      setPwdError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/admin/students/${resetPwdStudent.userId}/reset-password`, {
        newPassword,
      });
      setResetPwdStudent(null);
      setNewPassword('');
      setConfirmPassword('');
      showNotification(`Password for ${resetPwdStudent.name} was reset successfully!`);
    } catch (err: any) {
      setPwdError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sub-view switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubView('students')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubView === 'students'
              ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Students ({students.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveSubView('enrollments');
            fetchEnrollments();
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubView === 'enrollments'
              ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Enrollments & Payments {enrollments.length > 0 && `(${enrollments.length})`}</span>
        </button>
      </div>

      {activeSubView === 'students' ? (
        <>
          {/* Roster Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Student Directory & Enrolled Cohorts
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage student accounts, credentials, batch affiliations, and track academic records.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchStudents()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Roster"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, student ID, email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Batch Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Batches & Cohorts</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active Learners Only</option>
              <option value="INACTIVE">Inactive / Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">
            Loading student records...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-rose-500 text-xs font-semibold">
            {error}
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            No students found matching current search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Student ID</th>
                  <th className="pb-3">Batch & Course</th>
                  <th className="pb-3">Email & Contact</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-center">Points</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {students.map((student) => (
                  <tr key={student.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{student.name}</div>
                      <div className="text-[10px] font-normal text-slate-400">{student.college || 'College not specified'}</div>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {student.studentIdNumber}
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-300">
                      <div className="font-semibold">{student.batchName || 'General Batch'}</div>
                      <div className="text-[10px] text-slate-400">{student.courseTitle || 'Curriculum Track'}</div>
                    </td>
                    <td className="py-3.5 text-slate-500">
                      <div>{student.email}</div>
                      {student.phone && <div className="text-[10px] text-slate-400">{student.phone}</div>}
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleToggleStatus(student)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-colors ${
                          student.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 hover:bg-rose-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {student.status}
                      </button>
                    </td>
                    <td className="py-3.5 text-center font-black text-brand-600 dark:text-brand-400">
                      {student.points} pts
                    </td>
                    <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* View & Manage QR Code */}
                      <button
                        onClick={() => handleViewQr(student.userId)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[#00c2ff] hover:bg-cyan-50 dark:hover:bg-cyan-950/50 transition-colors"
                        title="View & Manage QR Identity"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      {/* View Details */}
                      <button
                        onClick={() => handleViewDetails(student.userId)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Complete Academic Record"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setFormError(null);
                          setEditingStudent({ ...student });
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors"
                        title="Edit Student Information"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Reset Password */}
                      <button
                        onClick={() => {
                          setPwdError(null);
                          setNewPassword('');
                          setConfirmPassword('');
                          setResetPwdStudent(student);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                        title="Reset Account Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      ) : (
        <>
          {/* Enrollments & Payments View */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Enrollments & Payment Transactions
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Track student enrollment payment links, Razorpay transactions, and verified active students.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => fetchEnrollments()}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Refresh Enrollments"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setFormError(null);
                    setShowAddModal(true);
                  }}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll New Student</span>
                </button>
              </div>
            </div>

            {/* Filter Bar for Enrollments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="relative">
                <input
                  type="text"
                  value={enrollmentSearch}
                  onChange={(e) => setEnrollmentSearch(e.target.value)}
                  placeholder="Search by student name, email, ID, or order ref..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={enrollmentStatusFilter}
                  onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="ALL">All Payment Statuses</option>
                  <option value="PENDING">Pending Payment Orders</option>
                  <option value="PAID">Verified Paid & Active</option>
                  <option value="FAILED">Payment Failed / Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enrollments Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loadingEnrollments ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                Loading payment and enrollment records...
              </div>
            ) : enrollments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No enrollment payment records found. Click &quot;Enroll New Student&quot; to generate an enrollment payment link.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <th className="pb-3">Student Name</th>
                      <th className="pb-3">Course</th>
                      <th className="pb-3">Batch</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 text-center">Payment Status</th>
                      <th className="pb-3 text-center">Enrollment Status</th>
                      <th className="pb-3">Payment / Order ID</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {enrollments
                      .filter((item) => {
                        if (enrollmentStatusFilter !== 'ALL' && item.paymentStatus !== enrollmentStatusFilter) {
                          return false;
                        }
                        if (enrollmentSearch.trim()) {
                          const q = enrollmentSearch.toLowerCase();
                          const matchName = item.fullName?.toLowerCase().includes(q);
                          const matchEmail = item.email?.toLowerCase().includes(q);
                          const matchCode = item.studentIdNumber?.toLowerCase().includes(q);
                          const matchOrder = item.razorpayOrderId?.toLowerCase().includes(q);
                          const matchPayment = item.razorpayPaymentId?.toLowerCase().includes(q);
                          return matchName || matchEmail || matchCode || matchOrder || matchPayment;
                        }
                        return true;
                      })
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          {/* Student Name */}
                          <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                            <div>{item.fullName}</div>
                            <div className="text-[10px] font-normal text-slate-400 font-mono">
                              {item.studentIdNumber} • {item.email}
                            </div>
                          </td>

                          {/* Course */}
                          <td className="py-3.5 text-slate-700 dark:text-slate-300 font-semibold">
                            {item.courseTitle || 'Curriculum Track'}
                          </td>

                          {/* Batch */}
                          <td className="py-3.5 text-slate-600 dark:text-slate-400">
                            {item.batchName || 'General Cohort'}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 font-mono font-black text-slate-900 dark:text-white">
                            ₹{item.amountInRupees.toLocaleString('en-IN')}
                          </td>

                          {/* Payment Status */}
                          <td className="py-3.5 text-center">
                            {item.paymentStatus === 'PAID' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Paid
                              </span>
                            ) : item.paymentStatus === 'FAILED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Enrollment Status */}
                          <td className="py-3.5 text-center">
                            {item.enrollmentStatus === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-600 text-white shadow-sm">
                                <ShieldCheck className="w-3 h-3" />
                                Student Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Payment / Order ID */}
                          <td className="py-3.5 font-mono text-[11px]">
                            {item.razorpayPaymentId ? (
                              <div>
                                <span className="text-emerald-600 font-bold">{item.razorpayPaymentId}</span>
                                {item.razorpayOrderId && (
                                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={item.razorpayOrderId}>
                                    {item.razorpayOrderId}
                                  </div>
                                )}
                              </div>
                            ) : item.razorpayOrderId ? (
                              <span className="text-slate-500 truncate max-w-[140px] block" title={item.razorpayOrderId}>
                                {item.razorpayOrderId}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Awaiting Checkout</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 text-right">
                            {item.paymentStatus === 'PAID' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-black text-[10px] border border-emerald-200 dark:border-emerald-800">
                                  PAID &bull; ACTIVE
                                </span>
                                {item.studentUserId && (
                                  <button
                                    onClick={() => handleViewDetails(item.studentUserId!)}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
                                    title="View Student Academic Profile"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                <button
                                  onClick={() => handleSendEmail(item.enrollmentToken, item.email)}
                                  disabled={sendingEmailToken === item.enrollmentToken}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/70 font-bold text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50"
                                  title={`Send official payment form to ${item.email}`}
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>{sendingEmailToken === item.enrollmentToken ? 'Sending...' : 'Gmail'}</span>
                                </button>
                                <button
                                  onClick={() => handleOpenWhatsApp(
                                    item.fullName,
                                    item.phone,
                                    `${window.location.origin}/enroll/${item.enrollmentToken}`,
                                    item.courseTitle,
                                    item.amountInRupees
                                  )}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 font-bold text-[10px] flex items-center gap-1 transition-colors"
                                  title="Send payment link with pre-filled message via WhatsApp"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </button>
                                <button
                                  onClick={(evt) => handleCopyLink(item.enrollmentToken, evt)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] flex items-center gap-1 transition-colors"
                                  title="Copy Secure Link"
                                >
                                  {copiedToken === item.enrollmentToken ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-500" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Link</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => window.open(`${window.location.origin}/enroll/${item.enrollmentToken}`, '_blank')}
                                  className="px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-950/70 font-bold text-[10px] flex items-center gap-1 transition-colors"
                                  title="Open / View Payment Form"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Open Form</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* ADD STUDENT MODAL */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-600" />
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {directCreationMode ? 'Create Student Directly' : 'Enroll Student & Generate Payment Link'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {directCreationMode
                      ? 'Manual admin override: creates active account immediately without payment.'
                      : 'Generates secure payment form. Student created only upon verified payment.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setDirectCreationMode(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={directCreationMode ? handleCreateStudent : handleGenerateEnrollmentLink} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="rahul@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.studentIdNumber}
                    onChange={(e) => setAddForm({ ...addForm, studentIdNumber: e.target.value })}
                    placeholder="STU-2026-005"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assign to Batch *
                  </label>
                  <select
                    value={addForm.batchId}
                    onChange={(e) => setAddForm({ ...addForm, batchId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enrolled Course *
                  </label>
                  <select
                    value={addForm.courseId}
                    onChange={(e) => setAddForm({ ...addForm, courseId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {courses && courses.length > 0 ? (
                      courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))
                    ) : (
                      <option value={1}>General Curriculum</option>
                    )}
                  </select>
                </div>
              </div>

              {!directCreationMode && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Course Enrollment Fee (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={addForm.amountInRupees}
                      onChange={(e) => setAddForm({ ...addForm, amountInRupees: Number(e.target.value) })}
                      placeholder="4999"
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Student pays this exact fee via Razorpay Standard Checkout (UPI, Cards, NetBanking, Wallets).
                  </p>
                </div>
              )}

              {directCreationMode && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Initial Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      placeholder="At least 8 characters"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={addForm.confirmPassword}
                      onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                      placeholder="Re-type password"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    College / Institution
                  </label>
                  <input
                    type="text"
                    value={addForm.college}
                    onChange={(e) => setAddForm({ ...addForm, college: e.target.value })}
                    placeholder="e.g. National Institute of Tech"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {!directCreationMode && (
                <div className="p-3 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-800/40 text-brand-900 dark:text-brand-200 text-[11px] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Strict Payment Verification:</strong> Student account and credentials are created only after the Razorpay payment is completed and cryptographically verified.
                  </span>
                </div>
              )}

              {/* Mode toggle */}
              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setDirectCreationMode(!directCreationMode)}
                  className="text-[11px] text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 underline font-medium transition-colors"
                >
                  {directCreationMode
                    ? 'Switch back to Payment Link Generation (Recommended)'
                    : 'Need direct creation without payment? (Admin Override)'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setDirectCreationMode(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {submitting
                      ? directCreationMode ? 'Creating...' : 'Generating Link...'
                      : directCreationMode ? 'Create Student Directly' : 'Generate Secure Payment Link'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECURE PAYMENT LINK GENERATED SUCCESS MODAL */}
      {/* ========================================================= */}
      {generatedLinkData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Enrollment Payment Link Ready!
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Send this link to the student to complete payment and activate account.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGeneratedLinkData(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-700/40">
                <span className="text-slate-400 font-medium">Student Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{generatedLinkData.studentName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-700/40">
                <span className="text-slate-400 font-medium">Email:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{generatedLinkData.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-700/40">
                <span className="text-slate-400 font-medium">Assigned Batch:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{generatedLinkData.batchName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-700/40">
                <span className="text-slate-400 font-medium">Course Track:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{generatedLinkData.courseTitle}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400 font-medium">Course Fee:</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  ₹{generatedLinkData.amountInRupees.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Secure Student Payment Link</span>
                <span className="text-[10px] text-slate-400 font-normal">Valid for enrollment</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLinkData.paymentUrl}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none select-all"
                />
                <button
                  onClick={() => handleCopyLink(generatedLinkData.enrollmentToken)}
                  className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  {copiedToken === generatedLinkData.enrollmentToken ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Dispatch to Student Actions */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Send Form Directly to Student
                </span>
                {emailSentTokens.has(generatedLinkData.enrollmentToken) && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Auto-Dispatched to Gmail
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Send / Resend to Gmail */}
                <button
                  type="button"
                  onClick={() => handleSendEmail(generatedLinkData.enrollmentToken, generatedLinkData.email)}
                  disabled={sendingEmailToken === generatedLinkData.enrollmentToken}
                  className="px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                  title="Send official payment form to student's Gmail"
                >
                  <Mail className="w-4 h-4" />
                  <span>
                    {sendingEmailToken === generatedLinkData.enrollmentToken
                      ? 'Sending...'
                      : emailSentTokens.has(generatedLinkData.enrollmentToken)
                      ? 'Resend to Gmail'
                      : 'Send to Gmail'}
                  </span>
                </button>

                {/* WhatsApp Dispatch */}
                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp(
                    generatedLinkData.studentName,
                    generatedLinkData.phone,
                    generatedLinkData.paymentUrl,
                    generatedLinkData.courseTitle,
                    generatedLinkData.amountInRupees
                  )}
                  className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  title="Send payment link with personalized message via WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send on WhatsApp</span>
                </button>

                {/* SMS Dispatch */}
                <button
                  type="button"
                  onClick={() => handleOpenSms(
                    generatedLinkData.phone,
                    generatedLinkData.studentName,
                    generatedLinkData.paymentUrl,
                    generatedLinkData.courseTitle,
                    generatedLinkData.amountInRupees
                  )}
                  className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  title="Open SMS app with pre-filled message"
                >
                  <Phone className="w-4 h-4" />
                  <span>Send SMS</span>
                </button>

                {/* Copy Full Message */}
                <button
                  type="button"
                  onClick={() => handleCopyShareMessage(
                    generatedLinkData.enrollmentToken,
                    generatedLinkData.studentName,
                    generatedLinkData.paymentUrl,
                    generatedLinkData.courseTitle,
                    generatedLinkData.amountInRupees
                  )}
                  className="px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  title="Copy ready-to-send formatted text message"
                >
                  {copiedMessageToken === generatedLinkData.enrollmentToken ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Message Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Mandatory Rule:</strong> The student account has NOT been created yet. Once the student completes payment and Razorpay verifies the signature, the student record will be activated automatically.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.open(generatedLinkData.paymentUrl, '_blank')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Student Form</span>
              </button>
              <button
                onClick={() => {
                  setGeneratedLinkData(null);
                  setActiveSubView('enrollments');
                  fetchEnrollments();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm"
              >
                View in Enrollments Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT STUDENT MODAL */}
      {/* ========================================================= */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-600" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Edit Student Profile
                </h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student ID Code
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.studentIdNumber}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, studentIdNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Affiliation
                </label>
                <select
                  value={editingStudent.batchId || ''}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, batchId: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  College / Institution
                </label>
                <input
                  type="text"
                  value={editingStudent.college || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, college: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={editingStudent.phone || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RESET PASSWORD MODAL */}
      {/* ========================================================= */}
      {resetPwdStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Reset Password
                </h3>
              </div>
              <button
                onClick={() => setResetPwdStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Setting a new password for <span className="font-bold text-slate-800 dark:text-slate-200">{resetPwdStudent.name}</span> ({resetPwdStudent.email}).
            </p>

            {pwdError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPwdStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STUDENT DETAIL MODAL (6 SUBTABS) */}
      {/* ========================================================= */}
      {viewingDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-black text-sm">
                  {viewingDetail.profile.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {viewingDetail.profile.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {viewingDetail.profile.studentIdNumber} • {viewingDetail.profile.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subtabs navigation */}
            <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto text-xs shrink-0">
              <button
                onClick={() => setDetailTab('profile')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'profile'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => setDetailTab('attendance')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'attendance'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Attendance ({viewingDetail.attendanceRecords?.length || 0})</span>
              </button>

              <button
                onClick={() => setDetailTab('assignments')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'assignments'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Assignments ({viewingDetail.assignmentAttempts?.length || 0})</span>
              </button>

              <button
                onClick={() => setDetailTab('tests')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'tests'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Tests ({viewingDetail.testAttempts?.length || 0})</span>
              </button>

              <button
                onClick={() => setDetailTab('coding')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'coding'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Coding Submissions ({viewingDetail.codingSubmissions?.length || 0})</span>
              </button>

              <button
                onClick={() => setDetailTab('activity')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'activity'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Activity Log</span>
              </button>

              <button
                onClick={() => setDetailTab('qr')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  detailTab === 'qr'
                    ? 'bg-[#00b4d8] text-slate-950 shadow-sm font-black'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Identity</span>
              </button>
            </div>

            {/* Subtab content */}
            <div className="flex-1 overflow-y-auto pr-1 text-xs">
              {detailTab === 'profile' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Batch</span>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {viewingDetail.profile.batchName || 'General Cohort'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Curriculum Track</span>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {viewingDetail.profile.courseTitle || 'Core Engineering Track'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">College / Campus</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {viewingDetail.profile.college || 'N/A'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Points Earned</span>
                    <div className="font-black text-base text-brand-600 dark:text-brand-400">
                      {viewingDetail.profile.points} pts
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {viewingDetail.profile.phone || 'N/A'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Account Status</span>
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        viewingDetail.profile.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {viewingDetail.profile.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'attendance' && (
                <div className="space-y-2">
                  {(!viewingDetail.attendanceRecords || viewingDetail.attendanceRecords.length === 0) ? (
                    <div className="py-8 text-center text-slate-400">No attendance records logged yet.</div>
                  ) : (
                    viewingDetail.attendanceRecords.map((r, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{r.topic}</div>
                          <div className="text-[10px] text-slate-400">{r.sessionDate}</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            r.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === 'assignments' && (
                <div className="space-y-2">
                  {(!viewingDetail.assignmentAttempts || viewingDetail.assignmentAttempts.length === 0) ? (
                    <div className="py-8 text-center text-slate-400">No assignment attempts recorded.</div>
                  ) : (
                    viewingDetail.assignmentAttempts.map((a, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{a.title}</div>
                          <div className="text-[10px] text-slate-400">Status: {a.status}</div>
                        </div>
                        <div className="text-right font-black text-brand-600">
                          {a.marksObtained} / {a.totalMarks} Marks
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === 'tests' && (
                <div className="space-y-2">
                  {(!viewingDetail.testAttempts || viewingDetail.testAttempts.length === 0) ? (
                    <div className="py-8 text-center text-slate-400">No test attempts recorded.</div>
                  ) : (
                    viewingDetail.testAttempts.map((t, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{t.title}</div>
                          <div className="text-[10px] text-slate-400">Submitted: {t.submittedAt || 'N/A'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-brand-600">{t.score} / {t.totalMarks} ({t.percentage}%)</div>
                          <span className="text-[10px] font-bold text-slate-400">{t.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === 'coding' && (
                <div className="space-y-2">
                  {(!viewingDetail.codingSubmissions || viewingDetail.codingSubmissions.length === 0) ? (
                    <div className="py-8 text-center text-slate-400">No coding submissions recorded.</div>
                  ) : (
                    viewingDetail.codingSubmissions.map((c, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{c.questionTitle}</div>
                          <div className="text-[10px] font-mono text-slate-400 uppercase">{c.language} • {c.runtimeMs} ms</div>
                        </div>
                        <div>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            c.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === 'activity' && (
                <div className="space-y-2">
                  {(!viewingDetail.activityLog || viewingDetail.activityLog.length === 0) ? (
                    <div className="py-8 text-center text-slate-400">No recent activity logged.</div>
                  ) : (
                    viewingDetail.activityLog.map((act, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{act.eventType}</div>
                          <div className="text-[10px] text-slate-400">{act.details}</div>
                        </div>
                        <div className="text-[10px] text-slate-400">{act.createdAt}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === 'qr' && (
                <div className="space-y-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-[#00c2ff] text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Individual Student QR Token</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white pt-1">
                      {viewingDetail.profile.name} ({viewingDetail.profile.studentIdNumber})
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Assigned to cohort: <span className="font-semibold text-slate-700 dark:text-slate-300">{viewingDetail.profile.batchName}</span>
                    </p>
                  </div>

                  {/* QR Code Graphic Frame */}
                  <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
                    <QRCodeSVG
                      value={viewingDetail.profile.qrToken || viewingDetail.profile.studentIdNumber}
                      size={180}
                      level="H"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#090c12"
                    />
                  </div>

                  {/* Metadata and security token */}
                  <div className="max-w-md mx-auto p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-left space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">QR Status:</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {viewingDetail.profile.qrStatus || 'ACTIVE'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400 font-sans">Token String:</span>
                      <span className="text-[#00c2ff] font-bold truncate max-w-[200px]" title={viewingDetail.profile.qrToken}>
                        {viewingDetail.profile.qrToken || viewingDetail.profile.studentIdNumber}
                      </span>
                    </div>
                  </div>

                  {/* Regenerate Action */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={regeneratingQr || !viewingDetail.profile.studentId}
                      onClick={() => handleRegenerateQr(viewingDetail.profile.studentId!)}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black transition-all shadow-sm flex items-center gap-2 mx-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${regeneratingQr ? 'animate-spin' : ''}`} />
                      <span>{regeneratingQr ? 'Regenerating Token...' : 'Regenerate Student QR Token'}</span>
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Regenerating immediately revokes any previously printed or cached QR code for this student.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
