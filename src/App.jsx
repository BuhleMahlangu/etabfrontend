import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { SubjectBrowser } from './components/SubjectBrowser';  // ← CHANGED: Import SubjectBrowser
import { Materials } from './pages/Materials';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TeacherRegister } from './pages/TeacherRegister';

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

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  
  return user ? <Navigate to="/dashboard" replace /> : children;
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

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
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
            
            {/* Protected Routes with Sidebar Layout */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Dashboard />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            {/* UPDATED: Subject Browser Route */}
            <Route
              path="/subjects"
              element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <SubjectBrowser />  {/* ← CHANGED: Use SubjectBrowser instead of Subjects */}
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
            
            <Route
              path="/teacher/register"
              element={
                <PrivateRoute>
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
                    <div>Teacher Materials Management (Coming Soon)</div>
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/teacher/assignments"
              element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <AuthenticatedLayout>
                    <div>Teacher Assignments (Coming Soon)</div>
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/teacher/grade"
              element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <AuthenticatedLayout>
                    <div>Grade Submissions (Coming Soon)</div>
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/teacher/students"
              element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <AuthenticatedLayout>
                    <div>My Students (Coming Soon)</div>
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            
            {/* Admin-only Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AuthenticatedLayout>
                    <AdminDashboard />
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