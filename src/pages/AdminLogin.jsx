import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Shield, Lock, Mail, ArrowRight, Sparkles, Building2, UserCheck, BarChart3 } from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Animated particles for admin theme
function AdminParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-ping"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 2) * 40}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: '3s',
          }}
        />
      ))}
    </div>
  );
}

// Admin feature card
function AdminFeature({ icon: Icon, title, description, delay }) {
  return (
    <div 
      className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 animate-fade-in-left"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-2 bg-purple-500/30 rounded-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <p className="text-purple-200 text-xs mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { addToast } = useToast();
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  // Add animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fade-in-left {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes pulse-ring {
        0% { transform: scale(0.8); opacity: 0.5; }
        100% { transform: scale(1.3); opacity: 0; }
      }
      .animate-gradient { background-size: 200% 200%; animation: gradient-shift 10s ease infinite; }
      .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; opacity: 0; }
      .animate-fade-in-left { animation: fade-in-left 0.6s ease-out forwards; opacity: 0; }
      .animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          loginType: 'admin'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const userData = data.user || data.data;
      const token = data.token || data.data?.token;

      if (!userData) {
        throw new Error('User data not found in response');
      }

      if (userData.role !== 'admin' && userData.role !== 'school_admin') {
        throw new Error('This login is for administrators only');
      }

      await adminLogin(userData, token);
      
      addToast(`Welcome, Administrator ${userData.firstName || userData.first_name}!`, 'success');
      navigate('/admin/dashboard');

    } catch (err) {
      console.error('Admin login error:', err);
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Admin Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated gradient background - purple theme for admin */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 animate-gradient" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5" />
        
        {/* Animated particles */}
        <AdminParticles />
        
        {/* Glowing orb effect */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white w-full">
          <div className="max-w-md mx-auto">
            {/* Admin badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8 animate-fade-in-up">
              <Shield className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium">Administrator Portal</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Manage Your{' '}
              <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                School
              </span>
            </h1>
            
            <p className="text-xl text-purple-100 mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Access powerful tools to manage users, track progress, and oversee all school operations.
            </p>
            
            {/* Admin features */}
            <div className="space-y-4">
              <AdminFeature 
                icon={Building2} 
                title="School Management"
                description="Manage your entire school infrastructure"
                delay={300}
              />
              <AdminFeature 
                icon={UserCheck} 
                title="User Administration"
                description="Add, edit, and monitor all users"
                delay={400}
              />
              <AdminFeature 
                icon={BarChart3} 
                title="Analytics & Reports"
                description="Track performance and generate insights"
                delay={500}
              />
            </div>
            
            {/* Security note */}
            <div className="mt-10 pt-8 border-t border-white/20 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center gap-3 text-purple-200">
                <Lock className="w-5 h-5" />
                <span className="text-sm">Secure, encrypted administrator access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Admin Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
        
        <div className="w-full max-w-md relative z-10">
          {/* Back link */}
          <div className="mb-8">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to regular login
            </Link>
          </div>
          
          {/* Login card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 animate-fade-in-up">
            {/* Admin badge */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
                <div className="relative p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl border border-purple-200">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium mb-4">
                <Sparkles className="w-3 h-3" />
                Admin Portal
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Administrator Sign In</h2>
              <p className="text-slate-500 mt-2">Access the management dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}`}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-purple-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    placeholder="admin@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-purple-500' : 'text-slate-400'}`} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                isLoading={isLoading}
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Sign In as Admin
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </form>

            {/* Help section */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 text-center">
                Having trouble? Contact your Super Administrator for assistance.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-xs">
              © 2024 E-tab. Secure administrator access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
