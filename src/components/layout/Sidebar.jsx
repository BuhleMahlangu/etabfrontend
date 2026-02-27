import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Upload, 
  Users, 
  BarChart3, 
  Settings,
  UserCog,
  Library,
  Activity
} from 'lucide-react';

export function Sidebar() {
  const { hasRole } = useAuth();

  const menuSections = [
    {
      title: 'Main',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['learner', 'teacher', 'admin'] },
        { to: '/subjects', icon: BookOpen, label: 'My Subjects', roles: ['learner', 'teacher', 'admin'] },
        { to: '/materials', icon: FileText, label: 'Materials', roles: ['learner', 'teacher', 'admin'] },
      ]
    },
    {
      title: 'Teaching',
      items: [
        { to: '/upload', icon: Upload, label: 'Upload Material', roles: ['teacher', 'admin'] },
        { to: '/students', icon: Users, label: 'My Students', roles: ['teacher'] },
        { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['teacher'] },
      ]
    },
    {
      title: 'Administration',
      items: [
        { to: '/admin/users', icon: UserCog, label: 'User Management', roles: ['admin'] },
        { to: '/admin/subjects', icon: Library, label: 'Subjects', roles: ['admin'] },
        { to: '/admin/logs', icon: Activity, label: 'Access Logs', roles: ['admin'] },
      ]
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16">
      <div className="flex-1 overflow-y-auto py-6 px-4">
        {menuSections.map((section) => {
          const visibleItems = section.items.filter(item => hasRole(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-8">
              <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <nav className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-blue-50 text-blue-600 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-xs font-medium opacity-90 mb-1">Storage Used</p>
          <p className="text-2xl font-bold">75%</p>
          <div className="mt-2 bg-white/20 rounded-full h-1.5">
            <div className="bg-white rounded-full h-1.5 w-3/4" />
          </div>
          <p className="text-xs opacity-75 mt-2">15GB of 20GB used</p>
        </div>
      </div>
    </aside>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}