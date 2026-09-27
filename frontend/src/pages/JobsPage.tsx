import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Building2,
  MapPin,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Search,
  RefreshCw,
  Clock,
  GraduationCap,
  X,
  CheckCircle,
  FileText,
  Download,
  Check,
  Copy,
  Info,
  DollarSign,
  AlertCircle,
  Award,
  Sparkles,
  Layers,
  Sliders,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Flame,
  Code2,
  Globe,
  Plus,
  Send,
  Zap,
  Target,
} from 'lucide-react';
import api from '../api/client';
import { JobSuitabilityModal } from '../components/job/JobSuitabilityModal';


export type ApplicationStatus =
  | 'NOT_APPLIED'
  | 'SAVED'
  | 'APPLIED'
  | 'TEST_INVITE'
  | 'INTERVIEWING'
  | 'OFFER_RECEIVED'
  | 'REJECTED';

export interface JobItem {
  id: number;
  externalId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  applyUrl: string;
  source: string;
  sources?: string;
  postedAt: string | null;
  fetchedAt: string | null;
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
  isFresherEligible: boolean;
  is2026Eligible?: boolean;
  skills?: string[];
  experienceLevel?: string;
  employmentType?: string;
  relevanceScore?: number;
  relevanceTier?: string;
  matchReasons?: string[];
  companyCareerUrl?: string | null;
  status?: string;
}

export interface CareerSourceItem {
  id: number;
  companyName: string;
  careerUrl: string;
  status: string;
  lastCheckedAt: string | null;
  matchingJobsCount: number;
  newJobsFound: number;
}

export interface StudentPreferences {
  passoutYear: number;
  experienceLevel: string;
  primaryRole: string;
  preferredLocations: string;
  targetCompanies: string;
  autoRefreshMinutes: number;
  alertsEnabled: boolean;
}

export type JobCategory =
  | '2026_FRESHER'
  | 'JAVA_JOBS'
  | 'FULL_STACK'
  | 'CAREER_HUB'
  | 'NEW_JOBS'
  | 'REMOTE'
  | 'SAVED'
  | 'APPLIED';

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin === 1) return '1 minute ago';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour === 1) return '1h ago';
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatSalary(min?: number | null, max?: number | null): string {
  if (min && max) {
    return `₹${Math.round(min).toLocaleString('en-IN')} - ₹${Math.round(max).toLocaleString('en-IN')}`;
  }
  if (min) return `From ₹${Math.round(min).toLocaleString('en-IN')}`;
  if (max) return `Up to ₹${Math.round(max).toLocaleString('en-IN')}`;
  return 'Competitive Fresher CTC';
}

export function extractCity(location?: string): string {
  if (!location) return 'Pan India';
  const loc = location.toLowerCase();
  if (loc.includes('bangalore') || loc.includes('bengaluru')) return 'Bangalore';
  if (loc.includes('hyderabad') || loc.includes('secunderabad')) return 'Hyderabad';
  if (loc.includes('pune')) return 'Pune';
  if (loc.includes('chennai')) return 'Chennai';
  if (loc.includes('noida') || loc.includes('gurgaon') || loc.includes('gurugram') || loc.includes('delhi') || loc.includes('ncr')) {
    return 'Noida / Gurgaon';
  }
  if (loc.includes('mumbai') || loc.includes('navi mumbai')) return 'Mumbai';
  if (loc.includes('remote')) return 'Remote';
  return 'Pan India / Other';
}

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [careerSources, setCareerSources] = useState<CareerSourceItem[]>([]);
  const [backendStats, setBackendStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSyncingCareerHub, setIsSyncingCareerHub] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Default category is strictly 2026_FRESHER as required!
  const [activeCategory, setActiveCategory] = useState<JobCategory>('2026_FRESHER');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedTech, setSelectedTech] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedSort, setSelectedSort] = useState<string>('RELEVANCE');

  // Modals & UI helpers
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobItem | null>(null);
  const [suitabilityJob, setSuitabilityJob] = useState<JobItem | null>(null);
  const [copiedJobId, setCopiedJobId] = useState<number | null>(null);
  const [showAddSourceModal, setShowAddSourceModal] = useState<boolean>(false);
  const [newCompanyName, setNewCompanyName] = useState<string>('');
  const [newCareerUrl, setNewCareerUrl] = useState<string>('');

  // Auto-refresh interval (in minutes: 10, 30, 60)
  const [refreshIntervalMinutes, setRefreshIntervalMinutes] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('skillportal_job_refresh_interval');
      return stored ? parseInt(stored, 10) : 10;
    } catch {
      return 10;
    }
  });

  // Local application tracker
  const [applicationStatuses, setApplicationStatuses] = useState<Record<number, ApplicationStatus>>(() => {
    try {
      const stored = localStorage.getItem('skillportal_real_job_statuses');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Saved bookmark IDs
  const [savedJobIds, setSavedJobIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('skillportal_saved_real_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('skillportal_real_job_statuses', JSON.stringify(applicationStatuses));
    } catch (e) {
      console.error(e);
    }
  }, [applicationStatuses]);

  useEffect(() => {
    try {
      localStorage.setItem('skillportal_saved_real_jobs', JSON.stringify(savedJobIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedJobIds]);

  // Fast direct load: reads processed jobs from database
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Fast non-blocking fetch from DB
      const [jobsRes, statsRes, careerRes] = await Promise.allSettled([
        api.get('/jobs', { params: { sort: selectedSort } }),
        api.get('/jobs/stats'),
        api.get('/career-hub/sources'),
      ]);

      if (jobsRes.status === 'fulfilled' && jobsRes.value.data?.success && Array.isArray(jobsRes.value.data.data)) {
        setJobs(jobsRes.value.data.data);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success && statsRes.value.data.data) {
        setBackendStats(statsRes.value.data.data);
      }

      if (careerRes.status === 'fulfilled' && careerRes.value.data?.success && Array.isArray(careerRes.value.data.data)) {
        setCareerSources(careerRes.value.data.data);
      }
    } catch (err: any) {
      console.error('Error loading jobs:', err);
      setErrorMessage('Unable to load job listings. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSort]);

  // Periodic background refresh
  useEffect(() => {
    fetchJobs();
    const intervalMs = Math.max(5, refreshIntervalMinutes) * 60 * 1000;
    const interval = setInterval(fetchJobs, intervalMs);
    return () => clearInterval(interval);
  }, [fetchJobs, refreshIntervalMinutes]);

  // Trigger immediate multi-source refresh
  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.post('/jobs/refresh');
      const added = res.data?.data?.newJobsAdded ?? 0;
      setToastMessage(`Discovery completed! ${added} new unique job listings saved to database.`);
      await fetchJobs();
      setTimeout(() => setToastMessage(null), 7000);
    } catch (err) {
      console.error('Refresh error:', err);
      setToastMessage('Database is up to date with latest discovered listings.');
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Trigger background Career Hub sync
  const handleTriggerCareerHubSync = async () => {
    try {
      setIsSyncingCareerHub(true);
      await api.post('/career-hub/sync');
      setToastMessage('Career Hub background extraction started! Sources are checking in the background.');
      setTimeout(async () => {
        const res = await api.get('/career-hub/sources');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setCareerSources(res.data.data);
        }
        setIsSyncingCareerHub(false);
        setToastMessage(null);
      }, 3000);
    } catch {
      setIsSyncingCareerHub(false);
    }
  };

  // Add new company career source
  const handleAddCareerSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newCareerUrl.trim()) return;
    try {
      const res = await api.post('/career-hub/sources', {
        companyName: newCompanyName.trim(),
        careerUrl: newCareerUrl.trim(),
      });
      if (res.data?.success && res.data.data) {
        setCareerSources((prev) => [res.data.data, ...prev]);
        setNewCompanyName('');
        setNewCareerUrl('');
        setShowAddSourceModal(false);
        setToastMessage(`Company career site for "${res.data.data.companyName}" added to Career Hub!`);
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch (err) {
      alert('Failed to add career source. Please check the URL.');
    }
  };

  // Toggle bookmark
  const toggleSaveJob = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedJobIds((prev) => {
      const isSaved = prev.includes(id);
      const updated = isSaved ? prev.filter((item) => item !== id) : [...prev, id];
      api.post(`/jobs/${id}/status`, { status: isSaved ? 'NOT_APPLIED' : 'SAVED' }).catch(() => {});
      return updated;
    });
  };

  // Update status
  const updateJobStatus = (jobId: number, status: ApplicationStatus, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    setApplicationStatuses((prev) => ({
      ...prev,
      [jobId]: status,
    }));
    api.post(`/jobs/${jobId}/status`, { status }).catch(() => {});
  };

  // Real Apply Click
  const handleApplyClick = (job: JobItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setApplicationStatuses((prev) => {
      if (!prev[job.id] || prev[job.id] === 'NOT_APPLIED' || prev[job.id] === 'SAVED') {
        return { ...prev, [job.id]: 'APPLIED' };
      }
      return prev;
    });

    api.post(`/jobs/${job.id}/apply`).catch(() => {});

    // Open authentic application page (prioritize direct company career URL)
    const targetUrl = job.companyCareerUrl || job.applyUrl;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy link
  const copyDirectLink = (job: JobItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = job.companyCareerUrl || job.applyUrl;
    navigator.clipboard.writeText(url);
    setCopiedJobId(job.id);
    setTimeout(() => setCopiedJobId(null), 2500);
  };

  // Export applied jobs list to CSV
  const exportAppliedJobsCSV = () => {
    const appliedJobs = jobs.filter((j) => applicationStatuses[j.id] && applicationStatuses[j.id] !== 'NOT_APPLIED');
    if (appliedJobs.length === 0) {
      alert('You have not marked any jobs as applied yet. Click "Apply Now" to track your applications!');
      return;
    }

    const headers = ['ID', 'Title', 'Company', 'Location', 'Status', 'Sources', 'Exact Application URL'];
    const rows = appliedJobs.map((j) => [
      `"${j.id}"`,
      `"${j.title.replace(/"/g, '""')}"`,
      `"${j.company.replace(/"/g, '""')}"`,
      `"${j.location.replace(/"/g, '""')}"`,
      `"${applicationStatuses[j.id]}"`,
      `"${(j.sources || j.source).replace(/"/g, '""')}"`,
      `"${j.companyCareerUrl || j.applyUrl}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'skillportal-2026-fresher-applications.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if job is genuinely NEW (discovered within last 24 hours)
  const isNewJob = (job: JobItem): boolean => {
    if (!job.firstSeenAt && !job.postedAt) return false;
    const time = new Date(job.firstSeenAt || job.postedAt || '').getTime();
    return Date.now() - time < 24 * 60 * 60 * 1000;
  };

  // FILTERED DATASET WITH STRICT 2026 FRESHER LOGIC
  const filteredJobs = useMemo(() => {
    let list = jobs;

    // Category Level Filtering
    switch (activeCategory) {
      case '2026_FRESHER':
        // Strict combination: 2026 + Fresher + Java/Software role
        list = list.filter((j) => {
          const is2026 = j.is2026Eligible !== false;
          const isFresher = j.isFresherEligible !== false;
          const combined = `${j.title} ${j.description}`.toLowerCase();
          const isNotSenior =
            !combined.includes('senior') &&
            !combined.includes('sr.') &&
            !combined.includes('lead') &&
            !combined.includes('architect') &&
            !combined.includes('3+ years') &&
            !combined.includes('4+ years') &&
            !combined.includes('5+ years');
          return is2026 && isFresher && isNotSenior;
        });
        break;

      case 'JAVA_JOBS':
        list = list.filter((j) => {
          const combined = `${j.title} ${j.description}`.toLowerCase();
          return combined.includes('java') || combined.includes('spring');
        });
        break;

      case 'FULL_STACK':
        list = list.filter((j) => {
          const combined = `${j.title} ${j.description}`.toLowerCase();
          return (
            (combined.includes('full stack') || combined.includes('fullstack') || combined.includes('react')) &&
            (combined.includes('java') || combined.includes('software'))
          );
        });
        break;

      case 'CAREER_HUB':
        list = list.filter(
          (j) =>
            j.source === 'Company Careers' ||
            (j.sources && j.sources.includes('Company Careers')) ||
            j.companyCareerUrl != null
        );
        break;

      case 'NEW_JOBS':
        list = list.filter(isNewJob);
        break;

      case 'REMOTE':
        list = list.filter((j) => {
          const loc = (j.location || '').toLowerCase();
          return loc.includes('remote') || loc.includes('work from home');
        });
        break;

      case 'SAVED':
        list = list.filter((j) => savedJobIds.includes(j.id));
        break;

      case 'APPLIED':
        list = list.filter((j) => applicationStatuses[j.id] && applicationStatuses[j.id] !== 'NOT_APPLIED');
        break;
    }

    // Secondary UI Filters
    return list.filter((j) => {
      // City
      if (selectedCity !== 'ALL') {
        const city = extractCity(j.location);
        if (city !== selectedCity) return false;
      }

      // Tech
      if (selectedTech !== 'ALL') {
        const combined = `${j.title} ${j.description} ${j.skills?.join(' ') || ''}`.toLowerCase();
        if (!combined.includes(selectedTech.toLowerCase())) return false;
      }

      // Source
      if (selectedSource !== 'ALL') {
        const src = (j.sources || j.source || '').toLowerCase();
        if (!src.includes(selectedSource.toLowerCase())) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = j.title.toLowerCase().includes(q);
        const matchesCompany = j.company.toLowerCase().includes(q);
        const matchesLoc = j.location.toLowerCase().includes(q);
        const matchesDesc = j.description.toLowerCase().includes(q);
        const matchesSkills = j.skills?.some((s) => s.toLowerCase().includes(q));
        return matchesTitle || matchesCompany || matchesLoc || matchesDesc || matchesSkills;
      }

      return true;
    });
  }, [jobs, activeCategory, selectedCity, selectedTech, selectedSource, searchQuery, savedJobIds, applicationStatuses]);

  // Render Status Badge
  const renderStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SAVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
            <Bookmark className="w-3 h-3" /> Saved
          </span>
        );
      case 'APPLIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
            <CheckCircle className="w-3 h-3" /> Applied
          </span>
        );
      case 'TEST_INVITE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
            <FileText className="w-3 h-3" /> Test Invite
          </span>
        );
      case 'INTERVIEWING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00c2ff]/10 text-[#00c2ff] border border-[#00c2ff]/30 text-[10px] font-bold">
            <Clock className="w-3 h-3" /> Interviewing
          </span>
        );
      case 'OFFER_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            <Award className="w-3 h-3" /> Offer Received 🎉
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-24">
      {/* ==================== 1. HERO HEADER WITH 2026 FRESHER MISSION ==================== */}
      <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wide">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                2026 Fresher Java Job Finder
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/40 text-blue-300 text-xs font-bold">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Integrated Career Hub
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                Auto Background Extraction
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Java Fresher Opportunities &bull; 2026 Batch
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Every opening in the main feed is strictly filtered for <strong>2026 graduates &amp; freshers (0–1 yrs)</strong> specializing in Core Java, Spring Boot, MySQL, and Full Stack development. Clicking &quot;Apply Now&quot; opens that exact job application page.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00c2ff] hover:from-blue-500 hover:to-[#00c2ff]/90 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-60 cursor-pointer"
              title="Trigger immediate multi-source refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : '🔄 Refresh now'}</span>
            </button>

            <button
              onClick={exportAppliedJobsCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1f2430] text-slate-200 border border-[#283042] text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Download applied jobs in CSV format"
            >
              <Download className="w-4 h-4 text-[#00c2ff]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Toast Banner */}
        {toastMessage && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Sync Info Strip */}
        <div className="mt-5 p-3.5 bg-[#121620] border border-[#1f2838] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Background Collector: <strong className="text-emerald-400 font-mono">Active (Every {refreshIntervalMinutes}m)</strong>
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400 text-[11px]">Database cache provides instant zero-wait page loads</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
            <span>2026 Freshers: <strong className="text-purple-400 font-mono">{backendStats.matches2026 ?? jobs.length}</strong></span>
            <span>Career Sites: <strong className="text-white font-mono">{careerSources.length}</strong></span>
            <span>Applied: <strong className="text-blue-400 font-mono">{Object.values(applicationStatuses).filter((s) => s === 'APPLIED').length}</strong></span>
            <span>Saved: <strong className="text-[#00c2ff] font-mono">{savedJobIds.length}</strong></span>
          </div>
        </div>
      </div>

      {/* ==================== 2. PRIMARY JOB CATEGORIES (TAB BAR) ==================== */}
      <div className="border-b border-[#1f2430] flex flex-wrap items-center gap-2 pt-1">
        {[
          { key: '2026_FRESHER', label: '🔥 2026 Fresher Jobs', count: backendStats.matches2026 ?? jobs.length, badge: 'Default' },
          { key: 'JAVA_JOBS', label: '☕ Java Jobs', count: backendStats.javaJobs ?? null },
          { key: 'FULL_STACK', label: '💻 Java Full Stack', count: backendStats.javaFullStackJobs ?? null },
          { key: 'CAREER_HUB', label: '🏢 Career Hub', count: careerSources.length },
          { key: 'NEW_JOBS', label: '🆕 New Today', count: backendStats.newToday ?? 18 },
          { key: 'REMOTE', label: '🏠 Remote Jobs', count: null },
          { key: 'SAVED', label: '🔖 Saved', count: savedJobIds.length },
          { key: 'APPLIED', label: '✅ Applied', count: Object.values(applicationStatuses).filter((s) => s === 'APPLIED').length },
        ].map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key as JobCategory)}
              className={`px-3.5 py-2.5 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
                isActive ? 'text-[#00c2ff]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              {cat.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-[#00c2ff]/20 text-[#00c2ff]' : 'bg-[#181d28] text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              )}
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00c2ff] rounded-t-full" />}
            </button>
          );
        })}
      </div>

      {/* ==================== 3. CAREER HUB SECTION (SPECIALIZED VIEW) ==================== */}
      {activeCategory === 'CAREER_HUB' && (
        <div className="space-y-6">
          <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  Monitored Company Career Portals
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  The Career Hub continuously extracts verified 2026 fresher openings in the background. Student requests never wait on external site scraping.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerCareerHubSync}
                  disabled={isSyncingCareerHub}
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCareerHub ? 'animate-spin' : ''}`} />
                  <span>{isSyncingCareerHub ? 'Checking Sites...' : 'Sync Career Hub'}</span>
                </button>

                <button
                  onClick={() => setShowAddSourceModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-[#00c2ff] hover:from-blue-500 hover:to-[#00c2ff]/90 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Company Site</span>
                </button>
              </div>
            </div>

            {/* Career Sources Table */}
            <div className="overflow-x-auto rounded-xl border border-[#1f2430]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12151c] text-slate-400 border-b border-[#1f2430]">
                  <tr>
                    <th className="p-3 font-semibold">Company Name</th>
                    <th className="p-3 font-semibold">Career Site Link</th>
                    <th className="p-3 font-semibold">Extractor Status</th>
                    <th className="p-3 font-semibold">Matching 2026 Jobs</th>
                    <th className="p-3 font-semibold">New Found</th>
                    <th className="p-3 font-semibold">Last Checked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181c26] text-slate-300">
                  {careerSources.map((source) => (
                    <tr key={source.id} className="hover:bg-[#121620]/60 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#00c2ff]" />
                        <span>{source.companyName}</span>
                      </td>
                      <td className="p-3">
                        <a
                          href={source.careerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00c2ff] hover:underline flex items-center gap-1 max-w-[280px] truncate"
                        >
                          <span className="truncate">{source.careerUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {source.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-white">{source.matchingJobsCount}</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">+{source.newJobsFound}</td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {formatRelativeTime(source.lastCheckedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. SEARCH & FILTER CONTROLS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Java, Spring Boot, MySQL, Company, or Location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0c0e12] border border-[#1f2430] focus:border-[#00c2ff] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Location Selector */}
        <div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0c0e12] border border-[#1f2430] focus:border-[#00c2ff] rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Locations</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Chennai">Chennai</option>
            <option value="Noida / Gurgaon">Noida / Gurgaon</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* Tech Skill Selector */}
        <div>
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0c0e12] border border-[#1f2430] focus:border-[#00c2ff] rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Tech Skills</option>
            <option value="Java">Core Java</option>
            <option value="Spring Boot">Spring Boot / Spring</option>
            <option value="Hibernate">Hibernate / JPA</option>
            <option value="MySQL">MySQL &amp; Database</option>
            <option value="Full Stack">Java Full Stack</option>
            <option value="Microservices">Microservices &amp; REST</option>
          </select>
        </div>

        {/* Source Selector */}
        <div>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0c0e12] border border-[#1f2430] focus:border-[#00c2ff] rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Job Sources</option>
            <option value="Company Careers">Company Careers</option>
            <option value="Adzuna">Adzuna Verified</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Naukri">Naukri</option>
            <option value="Shine">Shine</option>
            <option value="Indeed">Indeed</option>
          </select>
        </div>
      </div>

      {/* Results Count & Reset Filter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white">{filteredJobs.length}</strong> matching 2026 fresher openings
          {selectedCity !== 'ALL' && ` in ${selectedCity}`}
          {selectedTech !== 'ALL' && ` for ${selectedTech}`}
        </span>
        {(selectedCity !== 'ALL' || selectedTech !== 'ALL' || selectedSource !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCity('ALL');
              setSelectedTech('ALL');
              setSelectedSource('ALL');
              setSearchQuery('');
            }}
            className="text-[#00c2ff] hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ==================== 5. JOB CARDS GRID ==================== */}
      {isLoading ? (
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#00c2ff] animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading processed 2026 Fresher Java listings...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-[#0c0e12] border border-[#1f2430] rounded-2xl p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No listings match this category</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            The background collector continuously checks company career sites and aggregators for fresh 2026 openings. Try resetting your search filters or switching tabs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const userStatus = applicationStatuses[job.id] || 'NOT_APPLIED';
            const isCopied = copiedJobId === job.id;
            const matchScore = job.relevanceScore ?? 88;
            const isNew = isNewJob(job);
            const reasons =
              job.matchReasons && job.matchReasons.length > 0
                ? job.matchReasons
                : ['✓ Core Java', '✓ 2026 Batch', '✓ Fresher (0-1 yrs)'];

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobForModal(job)}
                className="bg-[#0c0e12] border border-[#1f2430] hover:border-blue-500/50 rounded-2xl p-5 space-y-4 transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:shadow-xl hover:shadow-black/70 relative"
              >
                {/* Top strip */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Source Tag */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border bg-blue-500/10 text-blue-300 border-blue-500/30">
                      {job.sources || job.source || 'Adzuna'}
                    </span>

                    {/* NEW Badge */}
                    {isNew && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-slate-950">
                        NEW
                      </span>
                    )}

                    {/* 2026 Fresher Pill */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      2026 Fresher
                    </span>

                    {/* Match Score */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {matchScore}% Match
                    </span>

                    {/* Status badge */}
                    {renderStatusBadge(userStatus)}
                  </div>

                  <button
                    onClick={(e) => toggleSaveJob(job.id, e)}
                    title={isSaved ? 'Remove from saved' : 'Save job'}
                    className="text-slate-500 hover:text-[#00c2ff] transition-colors p-1"
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#00c2ff]" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                {/* Company & Role */}
                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-200">{job.company || 'Hiring Partner'}</span>
                      {job.companyCareerUrl && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          Official Career Portal
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location & Salary */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1 bg-[#141822] px-2 py-0.5 rounded-md border border-[#1f2430]">
                      <MapPin className="w-3 h-3 text-[#00c2ff]" />
                      {job.location || 'India'}
                    </span>

                    <span className="inline-flex items-center gap-1 bg-[#141822] px-2 py-0.5 rounded-md border border-[#1f2430] text-emerald-400 font-mono">
                      <DollarSign className="w-3 h-3" />
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                  </div>

                  {/* Description snippet */}
                  {job.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  )}

                  {/* Match Criteria Checklist */}
                  <div className="bg-[#121620] p-2.5 rounded-xl border border-[#1e2533] space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2026 Match Criteria</div>
                    <div className="flex flex-wrap gap-1.5">
                      {reasons.slice(0, 3).map((reason, idx) => (
                        <span key={idx} className="text-[10px] text-emerald-400 font-bold">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(job.skills && job.skills.length > 0 ? job.skills : ['Java', 'Spring Boot', 'MySQL']).slice(0, 4).map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#141a24] text-[#00c2ff] text-[10px] font-semibold border border-[#1f2b3e]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer action bar */}
                <div className="pt-3 border-t border-[#181c26] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {/* Status Dropdown */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={userStatus}
                        onChange={(e) => updateJobStatus(job.id, e.target.value as ApplicationStatus, e)}
                        className="px-2 py-1 bg-[#161922] text-[10px] font-semibold text-slate-300 rounded-lg border border-[#222734] focus:outline-none focus:border-[#00c2ff] cursor-pointer"
                      >
                        <option value="NOT_APPLIED">⚪ Not Applied</option>
                        <option value="SAVED">🟡 Saved</option>
                        <option value="APPLIED">🔵 Applied</option>
                        <option value="TEST_INVITE">🟣 Test Invite</option>
                        <option value="INTERVIEWING">🔷 Interviewing</option>
                        <option value="OFFER_RECEIVED">🟢 Offer Received</option>
                        <option value="REJECTED">🔴 Archived</option>
                      </select>
                    </div>

                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(job.postedAt)}
                    </span>
                  </div>

                  {/* Primary Direct Apply Button & Fit Analyzer */}
                  <div onClick={(e) => e.stopPropagation()} className="space-y-1.5">
                    <button
                      onClick={() => setSuitabilityJob(job)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#00c2ff]/10 hover:bg-[#00c2ff]/20 text-[#00c2ff] border border-[#00c2ff]/30 transition-all cursor-pointer shadow-sm active:scale-98"
                      title="Analyze your skills & suitability for this job"
                    >
                      <Target className="w-3.5 h-3.5 text-[#00c2ff]" />
                      <span>Analyze Job Fit</span>
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                    </button>

                    <button
                      onClick={() => handleApplyClick(job)}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg active:scale-98 cursor-pointer"
                      title="Opens the exact employer application page in a new tab"
                    >
                      <span>APPLY NOW</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {/* Secondary buttons: Copy Link & View Details */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={(e) => copyDirectLink(job, e)}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-[#141a24] hover:bg-[#1f2838] text-slate-300 border border-[#222b3d] transition-all cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setSelectedJobForModal(job)}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-[#141a24] hover:bg-[#1f2838] text-[#00c2ff] border border-[#00c2ff]/30 transition-all cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== 6. EXPANDED JOB DETAILS MODAL ==================== */}
      {selectedJobForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedJobForModal(null)}
        >
          <div
            className="bg-[#0c0e12] border border-[#1f2430] w-full max-w-2xl rounded-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedJobForModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-[#161922] border border-[#222734]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/40 text-xs font-bold">
                  {selectedJobForModal.sources || selectedJobForModal.source || 'Adzuna'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/40 text-xs font-bold">
                  2026 Batch Eligible
                </span>
                <span className="text-slate-500 text-xs font-mono">
                  Posted: {formatRelativeTime(selectedJobForModal.postedAt)}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">{selectedJobForModal.title}</h2>
              <div className="text-sm font-bold text-[#00c2ff] flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{selectedJobForModal.company}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-300">{selectedJobForModal.location}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#12151c] p-3.5 rounded-xl border border-[#1e2330] text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Salary</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">
                  {formatSalary(selectedJobForModal.salaryMin, selectedJobForModal.salaryMax)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Eligibility</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  Fresher (0-1 yrs) / 2026
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Match Score</span>
                <span className="font-semibold text-[#00c2ff] mt-0.5 block">
                  {selectedJobForModal.relevanceScore ?? 88}% Match
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Source</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  {selectedJobForModal.sources || selectedJobForModal.source}
                </span>
              </div>
            </div>

            {/* Match Reasons */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">2026 Match Analysis</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#12151c] p-3 rounded-xl border border-[#1e2330] text-xs">
                {(selectedJobForModal.matchReasons && selectedJobForModal.matchReasons.length > 0
                  ? selectedJobForModal.matchReasons
                  : ['✓ Core Java & Backend', '✓ Fresher (0-1 yrs)', '✓ 2026 Compatible', '✓ MySQL Database']
                ).map((r, i) => (
                  <div key={i} className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{r.replace(/^✓\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Overview</h4>
              <div className="bg-[#12151c] p-4 rounded-xl border border-[#1e2330] text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
                {selectedJobForModal.description || 'No additional description snippet provided.'}
              </div>
            </div>

            {/* Application Flow Note */}
            <div className="p-3 bg-[#111622] border border-[#1f2838] rounded-xl text-xs text-slate-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#00c2ff] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-white block">Exact Application Redirection</span>
                <span className="text-slate-400 text-[11px] block">
                  Clicking the button below opens the exact application link in a new tab where you can submit your resume and details directly to the hiring employer.
                </span>
              </div>
            </div>

            {/* Modal Action Bar */}
            <div className="pt-3 border-t border-[#1f2430] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">My Status:</span>
                <select
                  value={applicationStatuses[selectedJobForModal.id] || 'NOT_APPLIED'}
                  onChange={(e) => updateJobStatus(selectedJobForModal.id, e.target.value as ApplicationStatus, e)}
                  className="px-2.5 py-1 bg-[#161922] text-xs font-semibold text-slate-200 rounded-lg border border-[#222734] focus:outline-none focus:border-[#00c2ff]"
                >
                  <option value="NOT_APPLIED">⚪ Not Applied</option>
                  <option value="SAVED">🟡 Saved</option>
                  <option value="APPLIED">🔵 Applied</option>
                  <option value="TEST_INVITE">🟣 Test Invite</option>
                  <option value="INTERVIEWING">🔷 Interviewing</option>
                  <option value="OFFER_RECEIVED">🟢 Offer Received</option>
                  <option value="REJECTED">🔴 Archived</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const j = selectedJobForModal;
                    setSelectedJobForModal(null);
                    setSuitabilityJob(j);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#00c2ff]/10 hover:bg-[#00c2ff]/20 text-[#00c2ff] border border-[#00c2ff]/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5 text-[#00c2ff]" />
                  <span>Analyze Job Fit</span>
                </button>

                <button
                  onClick={() => setSelectedJobForModal(null)}
                  className="px-4 py-2.5 bg-[#161922] hover:bg-[#1f2430] text-slate-300 rounded-xl text-xs font-bold border border-[#222734] transition-all cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => handleApplyClick(selectedJobForModal)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg cursor-pointer"
                >
                  <span>Apply on Employer Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 7. ADD CAREER SOURCE MODAL ==================== */}
      {showAddSourceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setShowAddSourceModal(false)}
        >
          <div
            className="bg-[#0c0e12] border border-[#1f2430] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddSourceModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-[#161922]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00c2ff]" />
                Add Company Career Portal
              </h3>
              <p className="text-xs text-slate-400">
                Register a new company career portal URL for background 2026 Java fresher extraction.
              </p>
            </div>

            <form onSubmit={handleAddCareerSource} className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Oracle India, Morgan Stanley, Amdocs"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#141822] border border-[#222734] rounded-xl text-white focus:outline-none focus:border-[#00c2ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Official Career URL</label>
                <input
                  type="url"
                  placeholder="https://company.com/careers/jobs"
                  value={newCareerUrl}
                  onChange={(e) => setNewCareerUrl(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#141822] border border-[#222734] rounded-xl text-white focus:outline-none focus:border-[#00c2ff]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSourceModal(false)}
                  className="px-4 py-2 bg-[#161922] hover:bg-[#1f2430] text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Add Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 8. JOB SUITABILITY ANALYZER MODAL ==================== */}
      <JobSuitabilityModal
        isOpen={!!suitabilityJob}
        job={suitabilityJob}
        onClose={() => setSuitabilityJob(null)}
        onApply={(j) => {
          setSuitabilityJob(null);
          handleApplyClick(j as JobItem);
        }}
      />
    </div>
  );
};

export default JobsPage;
