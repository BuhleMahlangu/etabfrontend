import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user from token
  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const data = await authAPI.getMe();
      // Handle both { data: {...} } and direct {...} responses
      const userData = data.data || data;
      setUser(userData);
      return userData;
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Login function for regular users (Learners/Teachers via Login.jsx)
  const login = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      
      // Handle multiple possible response structures from backend
      // Backend might return: { token, user } or { success: true, data: { token, user } }
      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user || data.data;
      
      if (!token) {
        console.error('Login response:', data);
        throw new Error('No token received from server');
      }
      
      if (!user) {
        console.error('Login response:', data);
        throw new Error('No user data received from server');
      }
      
      localStorage.setItem('token', token);
      setUser(user);
      return { token, user };
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error;
    }
  };

  // Admin login - manually set user without calling authAPI.login again
  // This is used by AdminLogin.jsx after successful fetch
  const adminLogin = async (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    return { token, user: userData };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    authAPI.logout().catch(() => {});
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      adminLogin,
      logout, 
      hasRole, 
      loading,
      fetchCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);