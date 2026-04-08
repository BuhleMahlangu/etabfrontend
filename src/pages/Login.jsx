import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Shield, BookOpen, Users, Award, Sparkles, ArrowRight, Mail, Lock } from 'lucide-react';
import { TeacherStatusCheck } from '../components/TeacherStatusCheck';

// Animated floating shapes component
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full mix-blend-overlay animate-float"
          style={{
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
            background: `rgba(255,255,255,${0.05 + i * 0.02})`,
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${6 + i}s`,
          }}
        />
      ))}
    </div>
  );
}

// Feature card component
function FeatureCard({ icon: Icon, title, delay }) {
  return (
    <div 
      className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-2 bg-white/20 rounded-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-white/90 text-sm font-medium">{title}</span>
    </div>
  );
}

export function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Add animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
        50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
      }
      .animate-float { animation: float 6s ease-in-out infinite; }
      .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
      .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; opacity: 0; }
      .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login({ ...formData, loginType: 'user' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Enhanced Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 animate-gradient" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        {/* Floating shapes */}
        <FloatingShapes />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white w-full">
          <div className="max-w-md mx-auto">
            {/* Logo with glow effect */}
            <div className="relative mb-8 animate-fade-in-up">
              <div className="absolute inset-0 bg-white/30 blur-3xl rounded-full animate-pulse" />
              <img 
                src="/E-tab logo.png" 
                alt="E-tab Logo" 
                className="relative h-28 w-auto mx-auto drop-shadow-2xl filter brightness-110"
              />
            </div>
            
            <h1 className="text-5xl font-bold mb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Welcome to{' '}
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                E-tab
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Your modern learning management system. Access materials, track progress, and collaborate seamlessly.
            </p>
            
            {/* Feature cards */}
            <div className="space-y-3">
              <FeatureCard icon={BookOpen} title="Access Learning Materials" delay={300} />
              <FeatureCard icon={Users} title="Collaborate with Peers" delay={400} />
              <FeatureCard icon={Award} title="Track Your Progress" delay={500} />
            </div>
            
            {/* Stats */}
            <div className="mt-10 pt-8 border-t border-white/20 grid grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <div className="text-center">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm text-blue-200">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-blue-200">Teachers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm text-blue-200">Schools</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
        
        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
              <img 
                src="/E-tab logo.png" 
                alt="E-tab Logo" 
                className="relative h-20 w-auto mx-auto"
              />
            </div>
          </div>
          
          {/* Login card with glass effect */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-4">
                <Sparkles className="w-3 h-3" />
                Student & Teacher Portal
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
              <p className="text-slate-500 mt-2">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field with icon */}
              <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}`}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Password field with icon */}
              <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-fade-in-up">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full group relative overflow-hidden"
                isLoading={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </form>

            {/* Admin Login Option */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-4">
                <Link to="/admin/login">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                  >
                    <Shield className="w-4 h-4 text-purple-600" />
                    Sign in as Administrator
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* School Registration CTA */}
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-100 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Are you a school?
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Register your school on E-Tab and get access to all features for teachers and learners.
                </p>
                <Link to="/school/register">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Register Your School
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Teacher Registration Status Check */}
          <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <TeacherStatusCheck />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <p className="text-slate-500 text-sm">
              New to E-tab?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
