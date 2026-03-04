import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useToast } from '../components/common/Toast';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  GraduationCap,
  FolderOpen
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalTeachers: 0,
    pendingTeachers: 0,
    totalSubjects: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stats from multiple endpoints
      const [teachersRes, pendingRes, subjectsRes] = await Promise.all([
        fetch(`${API_URL}/teachers/all`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/admin/pending-teachers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/subjects/available-grades`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const teachersData = await teachersRes.json();
      const pendingData = await pendingRes.json();
      const subjectsData = await subjectsRes.json();

      setStats({
        totalTeachers: teachersData.count || 0,
        pendingTeachers: pendingData.count || 0,
        totalSubjects: subjectsData.grades?.reduce((sum, g) => sum + (g.total_modules || 0), 0) || 0,
        totalLearners: 0 // Would need separate endpoint
      });

      // Mock recent activity - in real app, fetch from admin logs
      setRecentActivity([
        { type: 'teacher_approved', message: 'New teacher approved', time: '2 hours ago' },
        { type: 'signup', message: '5 new learner signups', time: '4 hours ago' },
        { type: 'pending', message: 'New teacher pending approval', time: '5 hours ago' }
      ]);

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Learners',
      value: stats.totalLearners,
      icon: Users,
      color: 'blue',
      link: '/admin/users'
    },
    {
      title: 'Active Teachers',
      value: stats.totalTeachers,
      icon: UserCheck,
      color: 'green',
      link: '/admin/teachers'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingTeachers,
      icon: Clock,
      color: 'amber',
      link: '/admin/pending-teachers',
      alert: stats.pendingTeachers > 0
    },
    {
      title: 'Total Subjects',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'purple',
      link: '/admin/subjects'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-2">
          Welcome back! Here's what's happening in your institution.
        </p>
      </div>

      {/* Alert for pending teachers */}
      {stats.pendingTeachers > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">
                {stats.pendingTeachers} teacher{stats.pendingTeachers !== 1 ? 's' : ''} pending approval
              </p>
              <p className="text-sm text-amber-700">
                Review and approve teacher registration requests
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/pending-teachers')}
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            Review Now
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <Card 
            key={idx} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(stat.link)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              {stat.alert && (
                <div className="mt-3 flex items-center gap-1 text-amber-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Action needed</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto py-4"
                onClick={() => navigate('/teacher/register')}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Register Teacher</p>
                    <p className="text-sm text-slate-500">Create teacher account directly</p>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto py-4"
                onClick={() => navigate('/admin/pending-teachers')}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Pending Approvals</p>
                    <p className="text-sm text-slate-500">
                      {stats.pendingTeachers} request{stats.pendingTeachers !== 1 ? 's' : ''} waiting
                    </p>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto py-4"
                onClick={() => navigate('/admin/subjects')}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Manage Subjects</p>
                    <p className="text-sm text-slate-500">Add or edit subjects and grades</p>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto py-4"
                onClick={() => navigate('/admin/users')}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Manage Users</p>
                    <p className="text-sm text-slate-500">View all learners and teachers</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'teacher_approved' ? 'bg-green-500' :
                    activity.type === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-4">
              View All Activity
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Teacher Management
            </CardTitle>
            <Button size="sm" onClick={() => navigate('/admin/teachers')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Active Teachers</span>
                </div>
                <span className="text-lg font-bold">{stats.totalTeachers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="font-medium">Pending Approval</span>
                </div>
                <span className="text-lg font-bold text-amber-600">{stats.pendingTeachers}</span>
              </div>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/admin/pending-teachers')}
              disabled={stats.pendingTeachers === 0}
            >
              {stats.pendingTeachers > 0 ? 'Review Pending Requests' : 'No Pending Requests'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Content Overview
            </CardTitle>
            <Button size="sm" variant="outline">
              Manage
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Total Subjects</span>
                </div>
                <span className="text-lg font-bold">{stats.totalSubjects}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Materials Uploaded</span>
                </div>
                <span className="text-lg font-bold">-</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};