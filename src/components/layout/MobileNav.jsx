import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Settings,
  Users,
  ClipboardList,
  BarChart3,
  GraduationCap
} from 'lucide-react';

export function MobileNav() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  // Get menu items based on role
  const getMenuItems = () => {
    const role = user.role;

    if (role === 'learner') {
      return [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
        { to: '/subjects', icon: BookOpen, label: 'Subjects' },
        { to: '/my-messages', icon: MessageSquare, label: 'Messages' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    if (role === 'teacher') {
      return [
        { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Home' },
        { to: '/teacher/learners', icon: Users, label: 'Learners' },
        { to: '/teacher/assignments', icon: ClipboardList, label: 'Tasks' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    if (role === 'admin' || role === 'school_admin') {
      return [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Home' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/subjects', icon: GraduationCap, label: 'Subjects' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                active 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
