import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// High-Performance Route-Based Code Splitting via React.lazy
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CoursesPage = lazy(() => import('./pages/CoursesPage').then(m => ({ default: m.CoursesPage })));
const TopicViewPage = lazy(() => import('./pages/TopicViewPage').then(m => ({ default: m.TopicViewPage })));
const AssignmentsPage = lazy(() => import('./pages/AssignmentsPage').then(m => ({ default: m.AssignmentsPage })));
const AssignmentDetailPage = lazy(() => import('./pages/AssignmentDetailPage').then(m => ({ default: m.AssignmentDetailPage })));
const CodingWorkspacePage = lazy(() => import('./pages/CodingWorkspacePage').then(m => ({ default: m.CodingWorkspacePage })));
const TestsPage = lazy(() => import('./pages/TestsPage').then(m => ({ default: m.TestsPage })));
const TestWorkspacePage = lazy(() => import('./pages/TestWorkspacePage').then(m => ({ default: m.TestWorkspacePage })));
const TestResultPage = lazy(() => import('./pages/TestResultPage').then(m => ({ default: m.TestResultPage })));
const AttendancePage = lazy(() => import('./pages/AttendancePage').then(m => ({ default: m.AttendancePage })));
const MaterialsPage = lazy(() => import('./pages/MaterialsPage').then(m => ({ default: m.MaterialsPage })));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage').then(m => ({ default: m.BookmarksPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminScannerPage = lazy(() => import('./pages/AdminScannerPage').then(m => ({ default: m.AdminScannerPage })));
const CompanyQuestionsPage = lazy(() => import('./pages/CompanyQuestionsPage').then(m => ({ default: m.CompanyQuestionsPage })));
const JobsPage = lazy(() => import('./pages/JobsPage').then(m => ({ default: m.JobsPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const EnrollmentPaymentPage = lazy(() => import('./pages/EnrollmentPaymentPage').then(m => ({ default: m.EnrollmentPaymentPage })));

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullPage message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<LoadingSpinner fullPage message="Loading Skill Portal..." />}>
            <Routes>
              {/* Public Login & Enrollment Payment */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/enroll/:token" element={<EnrollmentPaymentPage />} />

              {/* Protected Student Portal Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="topics/:id" element={<TopicViewPage />} />
                <Route path="assignments" element={<AssignmentsPage />} />
                <Route path="assignments/:id" element={<AssignmentDetailPage />} />
                <Route path="company-questions" element={<CompanyQuestionsPage />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="coding" element={<CodingWorkspacePage />} />
                <Route path="tests" element={<TestsPage />} />
                <Route path="tests/:id/workspace" element={<TestWorkspacePage />} />
                <Route path="tests/:id/result/:attemptId" element={<TestResultPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="materials" element={<MaterialsPage />} />
                <Route path="bookmarks" element={<BookmarksPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="notifications" element={<NotificationsPage />} />

                {/* Admin Portal */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/scanner"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminScannerPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
