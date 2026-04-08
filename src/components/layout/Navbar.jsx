import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuizLock } from '../../context/QuizLockContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Lock } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { isQuizLocked } = useQuizLock();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/subjects', label: 'Subjects' },
    { to: '/materials', label: 'Materials' },
  ];

  // When quiz is locked, show a minimal locked navbar
  if (isQuizLocked) {
    return (
      <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Locked indicator */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-white font-medium">Quiz in Progress</span>
            </div>

            {/* Minimal user info */}
            <div className="flex items-center gap-3">
              <Badge variant="warning">Locked</Badge>
              <span className="text-sm text-slate-400 hidden sm:block">
                {user?.firstName}
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Image */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/E-tab logo.png" 
              alt="E-tab Logo" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-slate-900">E-tab</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {user && navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === link.to
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Badge variant={user.role === 'admin' || user.role === 'school_admin' ? 'primary' : 'success'}>
                  {user.role === 'school_admin' ? 'School Admin' : 
                   user.role === 'admin' ? 'Super Admin' :
                   user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </Badge>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                  {user.firstName}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button as={Link} to="/login" variant="ghost" size="sm">
                  Sign In
                </Button>
                <Button as={Link} to="/register" size="sm">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
