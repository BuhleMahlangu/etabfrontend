import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use direct fetch for admin login with loginType: 'admin'
      // This ensures backend only checks admins table, not users table
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          loginType: 'admin'  // Critical: tells backend to check admins table only
        })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Check role - handle both response structures
      const userData = data.user || data.data;
      const token = data.token || data.data?.token;

      if (!userData) {
        throw new Error('User data not found in response');
      }

      if (userData.role !== 'admin') {
        throw new Error('This login is for administrators only');
      }

      // Use adminLogin to update AuthContext without page reload
      await adminLogin(userData, token);
      
      addToast(`Welcome, Administrator ${userData.firstName || userData.first_name}!`, 'success');
      
      // Navigate to admin dashboard
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-purple-800 items-center justify-center text-white p-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">Admin Portal</h1>
          <p className="text-xl text-purple-100">E-tab Management System</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Administrator Sign In</h2>
            <p className="text-slate-500 mt-2">Access the management dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="w-full" 
              isLoading={isLoading}
              disabled={isLoading}
            >
              Sign In as Admin
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              ← Back to regular login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}