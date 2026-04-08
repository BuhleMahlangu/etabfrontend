import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './styles/animations.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './components/common/Toast';
import { SocketProvider } from './context/SocketContext';
import { QuizLockProvider, useQuizLock } from './context/QuizLockContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { LockedLayout } from './components/layout/LockedLayout';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { LoadingScreen } from './components/common/LoadingScreen';
import { PageTransition, ScrollToTop } from './components/common/PageTransition';
import { Button } from './components/common/Button';
import { SubjectProvider } from './components/dashboard/SubjectContext';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { SchoolRegister } from './pages/SchoolRegister';
import { Dashboard } from './pages/Dashboard';
import { SubjectBrowser } from './components/SubjectBrowser';
import { Materials } from './pages/Materials';
import { LearnerMaterials } from './pages/LearnerMaterials';
import { LearnerQuizzes } from './pages/LearnerQuizzes';
import { TeacherAnnouncements } from './pages/TeacherAnnouncements';
import { TeacherQuizzes } from './pages/TeacherQuizzes';
import { TeacherAssignments } from './pages/TeacherAssignments';
import { LearnerAssignments } from './pages/LearnerAssignments';
import { LearnerProgress } from './pages/LearnerProgress';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminSubjects } from './pages/AdminSubjects';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TeacherRegister } from './pages/TeacherRegister';
import { TeacherLearners } from './pages/TeacherLearners';
import { AdminLogin } from './pages/AdminLogin';
import { PendingTeachers } from './pages/PendingTeachers';
import { Settings } from './pages/Settings';
import { Deadlines } from './pages/Deadlines';
import { Notifications } from './pages/Notifications';
import { AllMaterials } from './pages/AllMaterials';
import { ContactAdmin } from './pages/ContactAdmin';
import { ContactSuperAdmin } from './pages/ContactSuperAdmin';
import { AdminSupport } from './pages/AdminSupport';
import { AdminNotifications } from './pages/AdminNotifications';
import { LearnerMessages } from './pages/LearnerMessages';
import { TeacherMessages } from './pages/TeacherMessages';
import { TeacherLearnerDetail } from './pages/TeacherLearnerDetail';

// Role-based protected route
function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading, hasRole } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Check role restrictions - support both 'admin' and 'school_admin'
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // Redirect admins to admin dashboard, others to regular dashboard
    if (user.role === 'admin' || user.role === 'school_admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Public route - for regular users only (login, register)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  
  // If already logged in, redirect to appropriate dashboard
  if (user) {
    if (user.role === 'admin' || user.role === 'school_admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Admin public route - completely separate from user flow
function AdminPublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  
  // If already logged in as admin (super or school), go to admin dashboard
  if (user?.role === 'admin' || user?.role === 'school_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // If logged in as non-admin, go to regular dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Layout for public pages (login, register) - has navbar but no sidebar
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </>
  );
}

// Layout for authenticated pages (with sidebar)
function AuthenticatedLayout({ children }) {
  const { user } = useAuth();
  const { isQuizLocked } = useQuizLock();
  
  // When quiz is locked, use LockedLayout which hides sidebar
  if (isQuizLocked) {
    return (
      <LockedLayout userRole={user?.role}>
        {children}
      </LockedLayout>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </>
  );
}

// Layout for learner quizzes - always uses LockedLayout for quiz lock support
function LearnerQuizLayout({ children }) {
  const { user } = useAuth();
  return (
    <LockedLayout userRole={user?.role}>
      {children}
    </LockedLayout>
  );
}

// Teacher layout with SubjectProvider
function TeacherLayout({ children }) {
  return (
    <SubjectProvider>
      <AuthenticatedLayout>
        {children}
      </AuthenticatedLayout>
    </SubjectProvider>
  );
}

// Role-based dashboard redirect - for regular users only
function DashboardRouter() {
  const { user, loading, hasRole } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Admins should never hit this - they have their own dashboard
  if (hasRole(['admin', 'school_admin'])) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  if (hasRole(['teacher'])) {
    return <Navigate to="/teacher/dashboard" replace />;
  }
  
  // Default to learner dashboard
  return <Dashboard />;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <ScrollToTop />
      <PageTransition>
        <Routes>
          {/* Public Routes - Regular Users */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <PublicLayout>
                  <Login />
                </PublicLayout>
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <PublicLayout>
                  <Register />
                </PublicLayout>
              </PublicRoute>
            } 
          />
          <Route 
            path="/school/register" 
            element={
              <PublicRoute>
                <PublicLayout>
                  <SchoolRegister />
                </PublicLayout>
              </PublicRoute>
            } 
          />
          
          {/* Admin Login - Completely separate flow */}
          <Route 
            path="/admin/login"
            element={
              <AdminPublicRoute>
                <PublicLayout>
                  <AdminLogin />
                </PublicLayout>
              </AdminPublicRoute>
            } 
          />
          
          {/* Dashboard Router - for regular users (learners/teachers) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <AuthenticatedLayout>
                  <DashboardRouter />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          {/* Learner Routes */}
          <Route
            path="/subjects"
            element={
              <PrivateRoute allowedRoles={['learner', 'admin']}>
                <AuthenticatedLayout>
                  <SubjectBrowser />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/subjects/:subjectId"
            element={
              <PrivateRoute>
                <AuthenticatedLayout>
                  <Materials />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          {/* All Materials - Learners see AllMaterials component */}
          <Route
            path="/materials"
            element={
              <PrivateRoute allowedRoles={['learner']}>
                <AuthenticatedLayout>
                  <AllMaterials />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          {/* Learner Materials - with FET Phase History */}
          <Route
            path="/learner/materials"
            element={
              <PrivateRoute allowedRoles={['learner', 'admin']}>
                <LearnerQuizLayout>
                  <LearnerMaterials />
                </LearnerQuizLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/learner/materials/:subjectId"
            element={
              <PrivateRoute allowedRoles={['learner', 'admin']}>
                <LearnerQuizLayout>
                  <LearnerMaterials />
                </LearnerQuizLayout>
              </PrivateRoute>
            }
          />

          {/* Learner Quizzes - Uses LockedLayout for quiz lock */}
          <Route
            path="/learner/quizzes"
            element={
              <PrivateRoute allowedRoles={['learner', 'admin']}>
                <LearnerQuizLayout>
                  <LearnerQuizzes />
                </LearnerQuizLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/learner/quizzes/subject/:subjectId"
            element={
              <PrivateRoute allowedRoles={['learner', 'admin']}>
                <LearnerQuizLayout>
                  <LearnerQuizzes />
                </LearnerQuizLayout>
              </PrivateRoute>
            }
          />

          {/* Learner Assignments */}
          <Route
            path="/learner/assignments"
            element={
              <PrivateRoute allowedRoles={['learner', 'admin']}>
                <LearnerQuizLayout>
                  <LearnerAssignments />
                </LearnerQuizLayout>
              </PrivateRoute>
            }
          />
          
          {/* Settings - Available to all roles */}
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <AuthenticatedLayout>
                  <Settings />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <AuthenticatedLayout>
                  <Notifications />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />

          {/* Deadlines - Shows assignments and quizzes */}
          <Route
            path="/deadlines"
            element={
              <PrivateRoute allowedRoles={['learner', 'admin']}>
                <AuthenticatedLayout>
                  <Deadlines />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          {/* Learner Progress */}
          <Route
            path="/progress"
            element={
              <PrivateRoute allowedRoles={['learner', 'admin']}>
                <AuthenticatedLayout>
                  <LearnerProgress />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          {/* Contact Admin - for both learners and teachers */}
          <Route
            path="/contact-admin"
            element={
              <PrivateRoute allowedRoles={['learner', 'teacher']}>
                <AuthenticatedLayout>
                  <ContactAdmin />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          {/* My Messages - for learners */}
          <Route
            path="/my-messages"
            element={
              <PrivateRoute allowedRoles={['learner']}>
                <AuthenticatedLayout>
                  <LearnerMessages />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          {/* Teacher Messages */}
          <Route
            path="/teacher/messages"
            element={
              <PrivateRoute allowedRoles={['teacher']}>
                <TeacherLayout>
                  <TeacherMessages />
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          {/* Teacher Routes - Wrapped with SubjectProvider */}
          <Route
            path="/teacher/dashboard"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <TeacherDashboard />
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/learners"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <TeacherLearners />
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/learners/:id"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <TeacherLearnerDetail />
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          {/* Only admins can register teachers directly */}
          <Route
            path="/teacher/register"
            element={
              <PrivateRoute allowedRoles={['admin', 'school_admin']}>
                <AuthenticatedLayout>
                  <TeacherRegister />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/upload"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <Materials />
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/materials"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <Materials />
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/materials/upload"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <Materials />
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/assignments"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <TeacherAssignments />
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/assignments/create"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Create Assignment</h2>
                    <p className="text-slate-500">Assignment creation coming soon...</p>
                  </div>
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/grade"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Grade Submissions</h2>
                    <p className="text-slate-500">Grading interface coming soon...</p>
                  </div>
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/grade/:gradeId/learners"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Grade Learners</h2>
                    <p className="text-slate-500">Grade learners list coming soon...</p>
                  </div>
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/students"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">My Students</h2>
                    <p className="text-slate-500">Student management coming soon...</p>
                  </div>
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/announcements"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <TeacherAnnouncements />
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/quizzes"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <TeacherQuizzes />
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/analytics"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Analytics</h2>
                    <p className="text-slate-500">Analytics dashboard coming soon...</p>
                  </div>
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/profile"
            element={
              <PrivateRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Teacher Profile</h2>
                    <p className="text-slate-500">Profile page coming soon...</p>
                  </div>
                </TeacherLayout>
              </PrivateRoute>
            }
          />
          
          {/* Admin-only Routes - Allow both super admins and school admins */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin', 'school_admin']}>
                <AuthenticatedLayout>
                  <AdminDashboard />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/pending-teachers"
            element={
              <PrivateRoute allowedRoles={['admin', 'school_admin']}>
                <AuthenticatedLayout>
                  <PendingTeachers />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={['admin', 'school_admin']}>
                <AuthenticatedLayout>
                  <AdminUsers />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/subjects"
            element={
              <PrivateRoute allowedRoles={['admin', 'school_admin']}>
                <AuthenticatedLayout>
                  <AdminSubjects />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/teachers"
            element={
              <PrivateRoute allowedRoles={['admin', 'school_admin']}>
                <AuthenticatedLayout>
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Teachers</h2>
                    <div className="flex gap-4 mb-6">
                      <Button onClick={() => window.location.href = '/teacher/register'}>
                        Register New Teacher
                      </Button>
                      <Button variant="outline" onClick={() => window.location.href = '/admin/pending-teachers'}>
                        View Pending Requests
                      </Button>
                    </div>
                    <p className="text-slate-500">Teacher management interface. New teacher signups require approval.</p>
                  </div>
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          {/* Admin Support Messages */}
          <Route
            path="/admin/support"
            element={
              <PrivateRoute allowedRoles={['admin', 'school_admin']}>
                <AuthenticatedLayout>
                  <AdminSupport />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          {/* Admin Global Notifications - Super Admin only */}
          <Route
            path="/admin/notifications/send"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AuthenticatedLayout>
                  <AdminNotifications />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          {/* Contact Super Admin - School Admin only */}
          <Route
            path="/contact-super-admin"
            element={
              <PrivateRoute allowedRoles={['school_admin']}>
                <AuthenticatedLayout>
                  <ContactSuperAdmin />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
          
          {/* Redirect /admin to /admin/dashboard */}
          <Route 
            path="/admin" 
            element={<Navigate to="/admin/dashboard" replace />} 
          />
          
          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 Not Found */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤔</div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
                  <p className="text-slate-500 mb-6">Page not found</p>
                  <a 
                    href="/dashboard" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
      </PageTransition>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SocketProvider>
          <SettingsProvider>
            <QuizLockProvider>
              <AppContent />
            </QuizLockProvider>
          </SettingsProvider>
        </SocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
