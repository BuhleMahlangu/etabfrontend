import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuizLock } from '../../context/QuizLockContext';
import { subjectMessageAPI, notificationAPI, materialAPI } from '../../services/api';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Bell,
  FileText, 
  TrendingUp, 
  Settings as SettingsIcon,
  LogOut,
  GraduationCap,
  Users,
  Upload,
  Megaphone,
  HelpCircle,
  FolderOpen,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Inbox,
  Mail,
  Shield
} from 'lucide-react';

export function Sidebar() {
  const { user, logout } = useAuth();
  const { isQuizLocked } = useQuizLock();
  const location = useLocation();
  
  // Don't render sidebar when quiz is locked
  if (isQuizLocked) return null;
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [materialsCount, setMaterialsCount] = useState(0);

  // Fetch unread counts and materials
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Get unread subject messages
        const msgRes = await subjectMessageAPI.getUnreadCount();
        if (msgRes.success) {
          setUnreadMessages(msgRes.data.unreadCount);
        }
        
        // Get unread notifications
        const notifRes = await notificationAPI.getStats();
        if (notifRes.success) {
          setUnreadNotifications(notifRes.data?.unread || 0);
        }
        
        // Get materials count for learners
        if (user?.role === 'learner') {
          const matRes = await materialAPI.getAll({ limit: 1 });
          if (matRes.success) {
            setMaterialsCount(matRes.pagination?.totalCount || 0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch counts:', err);
      }
    };
    
    fetchCounts();
    // Poll every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user?.role]);

  // Define menu items based on user role
  const getMenuItems = () => {
    const role = user?.role;

    // Learner menu
    if (role === 'learner') {
      return [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'blue' },
        { to: '/subjects', icon: BookOpen, label: 'My Subjects', color: 'indigo' },
        { to: '/learner/assignments', icon: FileText, label: 'My Assignments', color: 'orange' },
        { to: '/learner/quizzes', icon: HelpCircle, label: 'My Quizzes', color: 'purple' },
        { to: '/deadlines', icon: Calendar, label: 'My Deadlines', color: 'red' },
        { to: '/materials', icon: FolderOpen, label: 'All Materials', badge: materialsCount > 0 ? materialsCount : null, color: 'teal' },
        { to: '/my-messages', icon: MessageCircle, label: 'My Messages', badge: unreadMessages > 0 ? unreadMessages : null, color: 'pink' },
        { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadNotifications > 0 ? unreadNotifications : null, color: 'pink' },
        { to: '/progress', icon: TrendingUp, label: 'My Progress', color: 'green' },
        { to: '/contact-admin', icon: MessageCircle, label: 'Contact Admin', color: 'orange' },
        { to: '/settings', icon: SettingsIcon, label: 'Settings', color: 'slate' },
      ];
    }

    // Teacher menu
    if (role === 'teacher') {
      return [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'blue' },
        { to: '/teacher/dashboard', icon: GraduationCap, label: 'Teacher Dashboard', color: 'indigo' },
        { to: '/teacher/upload', icon: Upload, label: 'Upload Materials', color: 'teal' },
        { to: '/teacher/announcements', icon: Megaphone, label: 'Announcements', color: 'orange' },
        { to: '/teacher/quizzes', icon: HelpCircle, label: 'Quizzes', color: 'purple' },
        { to: '/teacher/assignments', icon: FileText, label: 'Assignments', color: 'pink' },
        { to: '/teacher/learners', icon: Users, label: 'My Students', color: 'green' },
        { to: '/teacher/messages', icon: Mail, label: 'Student Messages', badge: unreadMessages > 0 ? unreadMessages : null, color: 'pink' },
        { to: '/deadlines', icon: Calendar, label: 'Deadlines', color: 'red' },
        { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadNotifications > 0 ? unreadNotifications : null, color: 'blue' },
        { to: '/contact-admin', icon: MessageCircle, label: 'Contact Admin', color: 'orange' },
        { to: '/settings', icon: SettingsIcon, label: 'Settings', color: 'slate' },
      ];
    }

    // Admin menu - both super admins and school admins
    if (role === 'admin' || role === 'school_admin') {
      const baseMenu = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'blue' },
        { to: '/admin', icon: SettingsIcon, label: 'Admin Panel', color: 'indigo' },
        { to: '/admin/users', icon: Users, label: 'Manage Users', color: 'green' },
        { to: '/admin/subjects', icon: BookOpen, label: 'Manage Subjects', color: 'teal' },
        { to: '/admin/support', icon: Inbox, label: 'Support Messages', color: 'orange' },
        { to: '/admin/notifications/send', icon: Megaphone, label: 'Send Global Notification', color: 'red' },
        { to: '/notifications', icon: Bell, label: 'Notifications', color: 'pink' },
        { to: '/settings', icon: SettingsIcon, label: 'Settings', color: 'slate' },
      ];
      
      // School admins can contact Super Admin
      if (role === 'school_admin') {
        baseMenu.splice(5, 0, { to: '/contact-super-admin', icon: Shield, label: 'Contact Super Admin', color: 'purple' });
      }
      
      return baseMenu;
    }

    // Fallback
    return [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'blue' },
      { to: '/settings', icon: SettingsIcon, label: 'Settings', color: 'slate' },
    ];
  };

  const menuItems = getMenuItems();

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-900/20',
      indigo: isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-900/20',
      purple: isActive ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'text-slate-600 hover:bg-purple-50 hover:text-purple-600 dark:text-slate-400 dark:hover:bg-purple-900/20',
      green: isActive ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'text-slate-600 hover:bg-green-50 hover:text-green-600 dark:text-slate-400 dark:hover:bg-green-900/20',
      orange: isActive ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-orange-900/20',
      red: isActive ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20',
      pink: isActive ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600 dark:text-slate-400 dark:hover:bg-pink-900/20',
      teal: isActive ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-600 hover:bg-teal-50 hover:text-teal-600 dark:text-slate-400 dark:hover:bg-teal-900/20',
      slate: isActive ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800',
    };
    return colors[color] || colors.blue;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'school_admin': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'teacher': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen sticky top-0 transition-all duration-300">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <img src="/E-tab logo.png" alt="E-tab" className="relative h-10 w-auto transform group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              E-tab
            </span>
            <p className="text-xs text-slate-400">Learning Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            onMouseEnter={() => setHoveredItem(item.to)}
            onMouseLeave={() => setHoveredItem(null)}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                getColorClasses(item.color, isActive)
              }`
            }
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            {/* Active indicator */}
            {({ isActive }) => (
              <>
                <div 
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                  } bg-current`}
                />
                <div className={`relative transition-transform duration-200 ${hoveredItem === item.to ? 'scale-110' : ''}`}>
                  <item.icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-4 h-4 opacity-50 animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold transform group-hover:scale-105 transition-transform">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
                {user?.role === 'school_admin' ? 'School Admin' : 
                 user?.role === 'admin' ? 'Super Admin' :
                 user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
              {user?.role === 'learner' && user?.grade && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  {user.grade}
                </span>
              )}
            </div>
            {/* Show school name for school admins */}
            {user?.role === 'school_admin' && user?.schoolId && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                School Code: {user?.schoolId?.slice(0, 8)}...
              </p>
            )}
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
