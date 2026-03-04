import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Button } from './components/common/Button';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { SubjectBrowser } from './components/SubjectBrowser';
import { Materials } from './pages/Materials';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TeacherRegister } from './pages/TeacherRegister';
import { AdminLogin } from './pages/AdminLogin';
import { PendingTeachers } from './pages/PendingTeachers';

// Role-based protected route
function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading, hasRole } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Check role restrictions
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
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
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Admin public route - completely separate from user flow
// Prevents regular users from accessing admin login, redirects admins to admin dashboard
function AdminPublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  
  // If already logged in as admin, go to admin dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // If logged in as non-admin, go to regular dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Layout for authenticated pages (with sidebar)
function AuthenticatedLayout({ children }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// Role-based dashboard redirect - for regular users only
function DashboardRouter() {
  const { user, loading, hasRole } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Admins should never hit this - they have their own dashboard
  if (hasRole(['admin'])) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  if (hasRole(['teacher'])) {
    return <Navigate to="/teacher/dashboard" replace />;
  }
  
  // Default to learner dashboard
  return <Dashboard />;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <Routes>
            {/* Public Routes - Regular Users */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Admin Login - Completely separate flow */}
            <Route 
              path="/admin/login"
              element={
                <AdminPublicRoute>
                  <AdminLogin />
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
            
            <Route
              path="/materials"
              element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Materials />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            {/* Teacher Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <AuthenticatedLayout>
                    <TeacherDashboard />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            {/* Only admins can register teachers directly */}
            <Route
              path="/teacher/register"
              element={
                <PrivateRoute allowedRoles={['admin']}>
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
                  <AuthenticatedLayout>
                    <Materials />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/teacher/materials"
              element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <AuthenticatedLayout>
                    <Materials />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/teacher/assignments"
              element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <AuthenticatedLayout>
                    <div className="p-8 text-center">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">Assignments</h2>
                      <p className="text-slate-500">Assignment management coming soon...</p>
                    </div>
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/teacher/grade"
              element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <AuthenticatedLayout>
                    <div className="p-8 text-center">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">Grade Submissions</h2>
                      <p className="text-slate-500">Grading interface coming soon...</p>
                    </div>
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/teacher/students"
              element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <AuthenticatedLayout>
                    <div className="p-8 text-center">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">My Students</h2>
                      <p className="text-slate-500">Student management coming soon...</p>
                    </div>
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            {/* Admin-only Routes - Completely separate from user routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AuthenticatedLayout>
                    <AdminDashboard />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/admin/pending-teachers"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AuthenticatedLayout>
                    <PendingTeachers />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/admin/users"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AuthenticatedLayout>
                    <AdminDashboard />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/admin/subjects"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AuthenticatedLayout>
                    <AdminDashboard />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/admin/teachers"
              element={
                <PrivateRoute allowedRoles={['admin']}>
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
                    <div className="text-6xl mb-4">🔍</div>
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
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;