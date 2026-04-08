import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  GraduationCap,
  FolderOpen,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Briefcase,
  Award,
  Calendar,
  Building2,
  Shield,
  Megaphone
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalTeachers: 0,
    pendingTeachers: 0,
    totalAdmins: 0,
    recentPending: 0
  });
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'pending'
  const [schoolInfo, setSchoolInfo] = useState(null);
  
  // Modal states
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is a school admin (not super admin)
  const isSchoolAdmin = user?.role === 'school_admin';
  const isSuperAdmin = user?.role === 'admin' && user?.isSuperAdmin;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch dashboard stats - UPDATED URL
      const statsRes = await fetch(`${API_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats({
            totalLearners: statsData.data?.totalLearners || 0,
            totalTeachers: statsData.data?.totalTeachers || 0,
            pendingTeachers: statsData.data?.pendingTeachers || 0,
            totalAdmins: statsData.data?.totalAdmins || 0,
            recentPending: statsData.data?.recentPending || 0
          });
          // Set school info if available
          if (statsData.data?.school) {
            setSchoolInfo(statsData.data.school);
          }
        }
      }

      // Fetch pending teachers - UPDATED URL
      const pendingRes = await fetch(`${API_URL}/admin/teachers/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        if (pendingData.success) {
          setPendingTeachers(pendingData.teachers || []);
        }
      }

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

  const handleApprove = async (pendingId) => {
    setProcessingId(pendingId);
    try {
      const token = localStorage.getItem('token');
      // UPDATED URL to match new route structure
      const response = await fetch(`${API_URL}/admin/teachers/${pendingId}/approve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        addToast('Teacher approved successfully!', 'success');
        fetchDashboardData();
        setShowDetailsModal(false);
      } else {
        addToast(data.message || 'Failed to approve teacher', 'error');
      }
    } catch (error) {
      console.error('Error approving teacher:', error);
      addToast('Failed to approve teacher', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (pendingId) => {
    setProcessingId(pendingId);
    try {
      const token = localStorage.getItem('token');
      // UPDATED URL to match new route structure
      const response = await fetch(`${API_URL}/admin/teachers/${pendingId}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addToast('Teacher registration rejected', 'success');
        fetchDashboardData();
        setShowRejectModal(false);
        setShowDetailsModal(false);
        setRejectionReason('');
      } else {
        addToast(data.message || 'Failed to reject teacher', 'error');
      }
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      addToast('Failed to reject teacher', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const openTeacherDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsModal(true);
  };

  // PENDING TEACHERS VIEW
  if (activeView === 'pending') {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button 
              onClick={() => setActiveView('dashboard')}
              className="text-sm text-slate-500 hover:text-slate-700 mb-2 flex items-center gap-1"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Pending Teacher Approvals</h1>
            <p className="text-slate-500 mt-2">
              Review and manage teacher registration requests
            </p>
          </div>
          <Badge variant="amber" className="text-lg px-4 py-2">
            {pendingTeachers.length} Pending
          </Badge>
        </div>

        {pendingTeachers.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
            <p className="text-slate-500">No pending teacher registrations to review.</p>
            <Button 
              className="mt-6" 
              onClick={() => setActiveView('dashboard')}
            >
              Return to Dashboard
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingTeachers.map((teacher) => (
              <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {teacher.firstName} {teacher.lastName}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {teacher.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {teacher.yearsExperience} years exp.
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Applied {new Date(teacher.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline">{teacher.qualification}</Badge>
                          <Badge variant="outline">{teacher.specialization}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => openTeacherDetails(teacher)}
                      >
                        Review Details
                      </Button>
                      <Button 
                        onClick={() => handleApprove(teacher.id)}
                        disabled={processingId === teacher.id}
                      >
                        {processingId === teacher.id ? 'Processing...' : 'Quick Approve'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Teacher Details Modal */}
        {showDetailsModal && selectedTeacher && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Teacher Application</h2>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {selectedTeacher.firstName} {selectedTeacher.lastName}
                    </h3>
                    <p className="text-slate-500">{selectedTeacher.email}</p>
                    <Badge variant="amber" className="mt-1">Pending Approval</Badge>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Employee Number" value={selectedTeacher.employeeNumber} />
                  <DetailItem label="Years of Experience" value={`${selectedTeacher.yearsExperience} years`} />
                  <DetailItem label="Qualification" value={selectedTeacher.qualification} />
                  <DetailItem label="Specialization" value={selectedTeacher.specialization} />
                </div>

                <DetailItem label="Bio" value={selectedTeacher.bio} fullWidth />

                {/* Subject Assignments */}
                {selectedTeacher.assignments && selectedTeacher.assignments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Requested Subject Assignments
                    </label>
                    <div className="space-y-2">
                      {selectedTeacher.assignments.map((assignment, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-900">{assignment.gradeName}</span>
                            {assignment.isPrimary && (
                              <Badge variant="blue" size="sm">Primary</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {assignment.subjectIds?.length || 0} subjects assigned
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Applied on {new Date(selectedTeacher.requestedAt).toLocaleString()}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                  disabled={processingId === selectedTeacher.id}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowRejectModal(true)}
                  disabled={processingId === selectedTeacher.id}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedTeacher.id)}
                  disabled={processingId === selectedTeacher.id}
                  className="flex-1"
                >
                  {processingId === selectedTeacher.id ? (
                    'Processing...'
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Teacher
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Reject Application</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Please provide a reason for rejecting {selectedTeacher.firstName} {selectedTeacher.lastName}'s application.
                  </p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 mb-4 min-h-[100px]"
                  />
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowRejectModal(false)}
                      disabled={processingId === selectedTeacher.id}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleReject(selectedTeacher.id)}
                      disabled={processingId === selectedTeacher.id || !rejectionReason.trim()}
                      className="flex-1"
                    >
                      {processingId === selectedTeacher.id ? 'Processing...' : 'Confirm Reject'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // MAIN DASHBOARD VIEW
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
      onClick: () => setActiveView('pending'),
      alert: stats.pendingTeachers > 0
    },
    // Only show Administrators stat for super admins
    ...(isSuperAdmin ? [{
      title: 'Administrators',
      value: stats.totalAdmins,
      icon: Award,
      color: 'purple',
      link: '/admin/admins'
    }] : [])
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
      {/* School Info Card for School Admins */}
      {isSchoolAdmin && schoolInfo && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{schoolInfo.name}</h2>
                <Badge className="bg-white/20 text-white border-0">
                  Code: {schoolInfo.code}
                </Badge>
              </div>
              <p className="text-blue-100 mt-1">
                You are managing this school. All data shown is filtered for {schoolInfo.name} only.
              </p>
            </div>
            {schoolInfo.address && (
              <div className="text-right hidden md:block">
                <p className="text-sm text-blue-100">{schoolInfo.address}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Super Admin Badge */}
      {isSuperAdmin && (
        <div className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Super Admin Mode</h2>
              <p className="text-purple-100 mt-1">
                You have access to all schools and data across the platform.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-2">
          {isSchoolAdmin && schoolInfo 
            ? `Manage your school's teachers, learners, and resources.`
            : isSuperAdmin 
              ? 'Manage all schools, users, and system settings.'
              : "Welcome back! Here's what's happening in your institution."
          }
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
            onClick={() => setActiveView('pending')}
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
            className={`cursor-pointer hover:shadow-md transition-shadow ${stat.onClick ? '' : ''}`}
            onClick={stat.onClick || (() => navigate(stat.link))}
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
                onClick={() => navigate('/register')}
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
                onClick={() => setActiveView('pending')}
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

              {!isSchoolAdmin && (
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-4 border-red-200 hover:border-red-300"
                  onClick={() => navigate('/admin/notifications/send')}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Megaphone className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Send Global Notification</p>
                      <p className="text-sm text-slate-500">Announce to all users</p>
                    </div>
                  </div>
                </Button>
              )}
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
              <div 
                className="flex items-center justify-between p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => setActiveView('pending')}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="font-medium">Pending Approval</span>
                </div>
                <span className="text-lg font-bold text-amber-600">{stats.pendingTeachers}</span>
              </div>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => setActiveView('pending')}
              disabled={stats.pendingTeachers === 0}
              variant={stats.pendingTeachers > 0 ? 'default' : 'outline'}
            >
              {stats.pendingTeachers > 0 ? 'Review Pending Requests' : 'No Pending Requests'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Administrators</span>
                </div>
                <span className="text-lg font-bold">{stats.totalAdmins}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">New This Week</span>
                </div>
                <span className="text-lg font-bold">{stats.recentPending}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper Component
function DetailItem({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
        <p className="text-sm text-slate-900">{value || 'N/A'}</p>
      </div>
    </div>
  );
}