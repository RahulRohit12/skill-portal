import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  GraduationCap,
  FolderTree,
  FileCheck2,
  FileSpreadsheet,
  FileQuestion,
  CalendarCheck,
  FolderArchive,
  Megaphone,
  AlertCircle,
  RefreshCw,
  Radio
} from 'lucide-react';
import api from '../api/client';
import { AdminOverview, BatchItem, CourseItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Tab Components
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminLiveClassesTab } from '../components/admin/AdminLiveClassesTab';
import { AdminStudentsTab } from '../components/admin/AdminStudentsTab';
import { AdminBatchesTab } from '../components/admin/AdminBatchesTab';
import { AdminCoursesTab } from '../components/admin/AdminCoursesTab';
import { AdminAssignmentsTab } from '../components/admin/AdminAssignmentsTab';
import { AdminQuestionBankTab } from '../components/admin/AdminQuestionBankTab';
import { AdminTestsTab } from '../components/admin/AdminTestsTab';
import { AdminAttendanceTab } from '../components/admin/AdminAttendanceTab';
import { AdminMaterialsTab } from '../components/admin/AdminMaterialsTab';
import { AdminAnnouncementsTab } from '../components/admin/AdminAnnouncementsTab';

type AdminTab =
  | 'overview'
  | 'live'
  | 'students'
  | 'batches'
  | 'courses'
  | 'assignments'
  | 'questions'
  | 'tests'
  | 'attendance'
  | 'materials'
  | 'announcements';

export const AdminDashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as AdminTab) || 'overview';

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, batchesRes, coursesRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/batches'),
        api.get('/admin/courses'),
      ]);

      setOverview(overviewRes.data?.data || null);
      setBatches(batchesRes.data?.data || []);
      setCourses(coursesRes.data?.data || []);
    } catch (err: any) {
      console.error('Failed to load admin initial data', err);
      setError(
        err.response?.data?.message ||
          'Failed to load administrator portal. Please ensure you have valid administrator credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (tab: AdminTab) => {
    setSearchParams({ tab });
  };

  const navTabs: Array<{ id: AdminTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live', label: 'Live Sessions', icon: Radio },
    { id: 'students', label: 'Students Roster', icon: Users },
    { id: 'batches', label: 'Batches & Cohorts', icon: GraduationCap },
    { id: 'courses', label: 'Curriculum Tree', icon: FolderTree },
    { id: 'assignments', label: 'Assignments & Labs', icon: FileCheck2 },
    { id: 'questions', label: 'Question Bank', icon: FileQuestion },
    { id: 'tests', label: 'Assessments & Tests', icon: FileSpreadsheet },
    { id: 'attendance', label: 'Attendance Register', icon: CalendarCheck },
    { id: 'materials', label: 'Study Materials', icon: FolderArchive },
    { id: 'announcements', label: 'Broadcast Center', icon: Megaphone },
  ];

  if (loading) {
    return <LoadingSpinner fullPage message="Authenticating administrator credentials & loading platform console..." />;
  }

  if (error || !overview) {
    return (
      <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
          {error || 'Admin Console Unavailable'}
        </h3>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181c26] text-sky-400 text-xs font-bold border border-[#263147] mb-2">
            <ShieldCheck className="w-4 h-4 text-[#00c2ff]" />
            <span>Master Enterprise Administrator Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            <span>SKILL<span className="text-[#00c2ff]">X</span> ACADEMY</span>
            <span className="text-slate-400 font-semibold text-lg sm:text-xl">Multi-Module Administration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full-lifecycle management for students, cohorts, curriculum hierarchy, question bank, assignments, assessments, and attendance.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl border border-[#1f2430] hover:bg-[#181c26] text-slate-300 text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Overview</span>
        </button>
      </div>

      {/* 10-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0c0e12] border border-[#1f2430] overflow-x-auto text-xs no-scrollbar shadow-lg">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#00c2ff] text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#181c26]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div>
        {currentTab === 'overview' && (
          <AdminOverviewTab
            overview={overview}
            onNavigateTab={(t) => handleTabChange(t as AdminTab)}
            onRefresh={loadData}
          />
        )}

        {currentTab === 'live' && (
          <AdminLiveClassesTab courses={courses} batches={batches} />
        )}

        {currentTab === 'students' && (
          <AdminStudentsTab batches={batches} courses={courses} />
        )}

        {currentTab === 'batches' && (
          <AdminBatchesTab courses={courses} onBatchesUpdated={loadData} />
        )}

        {currentTab === 'courses' && (
          <AdminCoursesTab onCoursesUpdated={loadData} />
        )}

        {currentTab === 'assignments' && (
          <AdminAssignmentsTab courses={courses} batches={batches} />
        )}

        {currentTab === 'questions' && (
          <AdminQuestionBankTab />
        )}

        {currentTab === 'tests' && (
          <AdminTestsTab courses={courses} batches={batches} />
        )}

        {currentTab === 'attendance' && (
          <AdminAttendanceTab batches={batches} />
        )}

        {currentTab === 'materials' && (
          <AdminMaterialsTab courses={courses} />
        )}

        {currentTab === 'announcements' && (
          <AdminAnnouncementsTab batches={batches} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
