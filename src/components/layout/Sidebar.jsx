import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Bell, 
  FileText, 
  TrendingUp, 
  Settings,
  LogOut,
  GraduationCap,
  Users,
  Upload
} from 'lucide-react';

export function Sidebar() {
  const { user, logout } = useAuth();

  // Define menu items based on user role
  const getMenuItems = () => {
    const role = user?.role;

    // Learner menu
    if (role === 'learner') {
      return [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/subjects', icon: BookOpen, label: 'My Subjects' },
        { to: '/deadlines', icon: Calendar, label: 'Deadlines' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
        { to: '/materials', icon: FileText, label: 'All Materials' },
        { to: '/progress', icon: TrendingUp, label: 'My Progress' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    // Teacher menu
    if (role === 'teacher') {
      return [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/teacher/dashboard', icon: GraduationCap, label: 'Teacher Dashboard' },
        { to: '/teacher/upload', icon: Upload, label: 'Upload Materials' },
        { to: '/teacher/assignments', icon: FileText, label: 'Assignments' },
        { to: '/teacher/students', icon: Users, label: 'My Students' },
        { to: '/deadlines', icon: Calendar, label: 'Deadlines' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    // Admin menu
    if (role === 'admin') {
      return [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin', icon: Settings, label: 'Admin Panel' },
        { to: '/admin/users', icon: Users, label: 'Manage Users' },
        { to: '/admin/subjects', icon: BookOpen, label: 'Manage Subjects' },
        { to: '/notifications', icon: Bell, label: 'Notifications' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    // Fallback (shouldn't happen, but just in case)
    return [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ];
  };

  const menuItems = getMenuItems();

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'teacher': return 'bg-green-100 text-green-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <img src="/E-tab logo.png" alt="E-tab" className="h-10 w-auto" />
          <span className="text-xl font-bold text-slate-900">E-tab</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
                {user?.role}
              </span>
              {user?.role === 'learner' && user?.grade && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                  {user.grade}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}