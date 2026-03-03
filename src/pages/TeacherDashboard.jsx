import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import { 
  BookOpen, 
  Users, 
  FileText, 
  CheckCircle, 
  Upload, 
  Plus, 
  Clock,
  TrendingUp,
  Calendar,
  MoreVertical,
  GraduationCap,
  FolderOpen,
  Award,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [expandedGrades, setExpandedGrades] = useState(new Set());

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        addToast('Please log in', 'error');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/teachers/dashboard`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        addToast('Session expired. Please log in again.', 'error');
        navigate('/login');
        return;
      }
      
      if (data.success) {
        setDashboard(data);
        // Expand first grade by default
        if (data.grades && data.grades.length > 0) {
          setSelectedGrade(data.grades[0]);
          setExpandedGrades(new Set([data.grades[0].gradeId]));
        }
      } else {
        addToast(data.message || 'Failed to load dashboard', 'error');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      addToast('Error loading dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleGradeExpand = (gradeId) => {
    setExpandedGrades(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gradeId)) {
        newSet.delete(gradeId);
      } else {
        newSet.add(gradeId);
      }
      return newSet;
    });
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      case 'document': return '📝';
      default: return '📎';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Failed to load dashboard</p>
          <Button onClick={fetchDashboard}>Retry</Button>
        </div>
      </div>
    );
  }

  const { teacher, stats, grades, recentMaterials, recentActivity, academicYear } = dashboard;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome, {teacher.firstName}! 👋
            </h1>
            <p className="text-slate-500 mt-1">
              Academic Year: {academicYear}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/teacher/register')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Teacher
            </Button>
            <Button 
              onClick={() => navigate('/materials/upload')}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Material
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Grades Teaching</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalGrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Subjects</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalSubjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Learners</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalLearners}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Materials</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalMaterials}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Grades & Subjects */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  My Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {grades.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No subjects assigned yet.</p>
                    <p className="text-sm">Contact an administrator to get assigned to subjects.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {grades.map((grade) => (
                      <div key={grade.gradeId} className="border rounded-lg overflow-hidden">
                        {/* Grade Header */}
                        <button
                          onClick={() => toggleGradeExpand(grade.gradeId)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {expandedGrades.has(grade.gradeId) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                            )}
                            <div>
                              <h3 className="font-semibold text-slate-900">{grade.gradeName}</h3>
                              <p className="text-sm text-slate-500">
                                {grade.subjects.length} subjects • {grade.totalLearners} learners
                              </p>
                            </div>
                          </div>
                          <Badge variant="primary">{grade.gradeLevel}</Badge>
                        </button>

                        {/* Subjects List */}
                        {expandedGrades.has(grade.gradeId) && (
                          <div className="p-4 space-y-3">
                            {grade.subjects.map((subject) => (
                              <div
                                key={subject.subjectId}
                                className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                    {subject.code.replace(/-.*$/, '')}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-slate-900">{subject.name}</h4>
                                    <p className="text-sm text-slate-500">{subject.department}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-slate-900">
                                      {subject.learnerCount} learners
                                    </p>
                                    {subject.isPrimary && (
                                      <Badge variant="success" className="text-xs">Primary</Badge>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/materials/upload?subject=${subject.subjectId}&grade=${grade.gradeId}`)}
                                  >
                                    <Upload className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Materials */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Recent Materials
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/materials')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {recentMaterials.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No materials uploaded yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/materials/upload')}
                    >
                      Upload Your First Material
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getFileIcon(material.fileType)}</span>
                          <div>
                            <h4 className="font-medium text-slate-900">{material.title}</h4>
                            <p className="text-sm text-slate-500">
                              {material.gradeName} • {material.subjectName} • {formatDate(material.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <TrendingUp className="w-4 h-4" />
                          {material.downloadCount} downloads
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/materials/upload')}
                >
                  <Upload className="w-4 h-4" />
                  Upload Material
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/teacher/assignments')}
                >
                  <FileText className="w-4 h-4" />
                  Create Assignment
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/teacher/students')}
                >
                  <Users className="w-4 h-4" />
                  View My Students
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'submission' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm text-slate-900">{activity.title}</p>
                          <p className="text-xs text-slate-500">
                            {activity.studentName} • {formatDate(activity.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;