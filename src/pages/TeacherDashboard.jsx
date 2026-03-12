import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSubject } from '../components/dashboard/SubjectContext';
import { SubjectSiteSelector } from '../components/dashboard/SubjectSiteSelector';
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
  ChevronRight,
  Eye,
  User,
  BarChart3
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentSubject, availableSubjects, loading: subjectLoading, selectSubject } = useSubject();
  
  const [dashboard, setDashboard] = useState(null);
  const [learners, setLearners] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [learnersLoading, setLearnersLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [expandedGrades, setExpandedGrades] = useState(new Set());
  const [showLearnersModal, setShowLearnersModal] = useState(false);
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalMaterials: 0,
    recentUploads: 0
  });

  // Fetch data when current subject changes
  useEffect(() => {
    if (currentSubject) {
      fetchDashboardData();
    } else if (!subjectLoading) {
      setLoading(false);
    }
  }, [currentSubject]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch learners filtered by current subject
      const learnersRes = await fetch(
        `${API_URL}/teacher-learners/my-learners?subjectId=${currentSubject.subjectId}`, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const learnersData = await learnersRes.json();
      
      if (learnersData.success) {
        setLearners(learnersData.data?.learners || []);
        setStats(prev => ({ ...prev, totalLearners: learnersData.data?.learners?.length || 0 }));
      }

      // Fetch materials for current subject
      const materialsRes = await fetch(
        `${API_URL}/materials?subjectId=${currentSubject.subjectId}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const materialsData = await materialsRes.json();
      
      if (materialsData.success) {
        setMaterials(materialsData.data || []);
        setStats(prev => ({ ...prev, totalMaterials: materialsData.data?.length || 0 }));
      }

      // Fetch dashboard stats
      const dashboardRes = await fetch(`${API_URL}/teachers/dashboard`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const dashboardData = await dashboardRes.json();
      
      if (dashboardData.success) {
        setDashboard(dashboardData.dashboard);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      addToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
      setLearnersLoading(false);
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

  // Group learners by grade for current subject only
  const learnersByGrade = learners.reduce((acc, learner) => {
    const gradeKey = learner.grade_id || learner.gradeId;
    if (!acc[gradeKey]) {
      acc[gradeKey] = {
        gradeId: gradeKey,
        gradeName: learner.grade_name || learner.gradeName,
        learners: []
      };
    }
    acc[gradeKey].learners.push(learner);
    return acc;
  }, {});

  // Loading state
  if (subjectLoading || loading) {
    return <LoadingSpinner fullScreen />;
  }

  // No subjects assigned
  if (availableSubjects.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Subjects Assigned</h2>
          <p className="text-slate-500 mb-4">
            You haven't been assigned to any subjects yet. Contact an administrator to get assigned.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    );
  }

  // No subject selected
  if (!currentSubject) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Select a Subject</h2>
          <SubjectSiteSelector />
        </div>
      </div>
    );
  }

  const { teacher, academicYear } = dashboard || {};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Subject Site Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-slate-900 hidden sm:block">
                Teacher Portal
              </h1>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <SubjectSiteSelector />
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/teacher/profile')}
                className="hidden sm:flex"
              >
                Profile
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate(`/materials/upload?subjectId=${currentSubject.subjectId}`)}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Subject Context Banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Current Subject Site</p>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {currentSubject.subjectName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-blue-100 text-sm">
                  <span>{currentSubject.subjectCode}</span>
                  <span>•</span>
                  <span>{currentSubject.department}</span>
                  {currentSubject.isPrimary && (
                    <>
                      <span>•</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">
                        Primary Teacher
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{currentSubject.grades.length}</p>
                <p className="text-xs text-blue-100">Grades</p>
              </div>
              <div className="text-center px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{stats.totalLearners}</p>
                <p className="text-xs text-blue-100">Learners</p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome, {teacher?.firstName || 'Teacher'}! 👋
            </h1>
            <p className="text-slate-500 mt-1">
              Academic Year: {academicYear || '2026'}
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
          </div>
        </div>

        {/* Stats Overview - Filtered by Subject */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Grades Teaching</p>
                  <p className="text-2xl font-bold text-slate-900">{currentSubject.grades.length}</p>
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
                  <p className="text-sm text-slate-600">Subject</p>
                  <p className="text-2xl font-bold text-slate-900">{currentSubject.subjectCode}</p>
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
          {/* Main Content - My Learners Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Learners Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    My Learners - {currentSubject.subjectName}
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Students enrolled in this subject
                  </p>
                </div>
                <Badge variant="primary">{stats.totalLearners} Students</Badge>
              </CardHeader>
              <CardContent>
                {learnersLoading ? (
                  <LoadingSpinner />
                ) : learners.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No learners enrolled in this subject yet.</p>
                    <p className="text-sm">Learners will appear here once they enroll in {currentSubject.subjectName}.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.values(learnersByGrade).map((gradeGroup) => (
                      <div key={gradeGroup.gradeId} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleGradeExpand(gradeGroup.gradeId)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {expandedGrades.has(gradeGroup.gradeId) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                            )}
                            <GraduationCap className="w-5 h-5 text-slate-500" />
                            <h3 className="font-semibold text-slate-900">{gradeGroup.gradeName}</h3>
                          </div>
                          <Badge variant="outline">{gradeGroup.learners.length} learners</Badge>
                        </button>
                        
                        {expandedGrades.has(gradeGroup.gradeId) && (
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {gradeGroup.learners.map((learner) => (
                              <div 
                                key={learner.learner_id || learner.id}
                                className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                              >
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                  {(learner.first_name || learner.firstName || 'S')[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-slate-900 truncate">
                                    {learner.first_name || learner.firstName} {learner.last_name || learner.lastName}
                                  </h4>
                                  <p className="text-sm text-slate-500 truncate">{learner.email}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => navigate(`/teacher/learners/${learner.learner_id || learner.id}?subjectId=${currentSubject.subjectId}`)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
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

            {/* Recent Materials - Visible to Students */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Recent Materials - {currentSubject.subjectName}
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Recently uploaded for this subject
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/materials')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {materials.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No materials uploaded for this subject yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate(`/materials/upload?subjectId=${currentSubject.subjectId}`)}
                    >
                      Upload First Material
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getFileIcon(activity.fileType)}</span>
                          <div>
                            <h4 className="font-medium text-slate-900">{activity.title}</h4>
                            <p className="text-sm text-slate-500">
                              {activity.gradeName} • {formatDate(activity.createdAt)}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Visible to {activity.visibleToLearners || activity.studentCount || 'all'} learners
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/materials/${activity.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Subject Info Card */}
            <Card className="bg-gradient-to-br from-slate-50 to-white">
              <CardHeader>
                <CardTitle className="text-base">Subject Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-1">Subject Code</p>
                  <p className="font-semibold text-slate-900">{currentSubject.subjectCode}</p>
                </div>
                
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-1">Department</p>
                  <p className="font-semibold text-slate-900">{currentSubject.department}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-2">Teaching Grades</p>
                  <div className="flex flex-wrap gap-2">
                    {currentSubject.grades.map(grade => (
                      <Badge key={grade.gradeId} variant="outline">
                        {grade.gradeName}
                      </Badge>
                    ))}
                  </div>
                </div>

                {currentSubject.isPrimary && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Primary Subject Teacher
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      You have primary responsibility for this subject.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start gap-2"
                  onClick={() => navigate(`/materials/upload?subjectId=${currentSubject.subjectId}`)}
                >
                  <Upload className="w-4 h-4" />
                  Upload Material
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate(`/teacher/assignments/create?subjectId=${currentSubject.subjectId}`)}
                >
                  <FileText className="w-4 h-4" />
                  Create Assignment
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/teacher/learners')}
                >
                  <Users className="w-4 h-4" />
                  View All Learners
                </Button>
              </CardContent>
            </Card>

            {/* Other Subjects */}
            {availableSubjects.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Other Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {availableSubjects
                      .filter(s => s.subjectId !== currentSubject.subjectId)
                      .map(subject => (
                        <button
                          key={subject.subjectId}
                          onClick={() => selectSubject(subject)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left border"
                        >
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs">
                            {subject.subjectCode?.slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate">{subject.subjectName}</p>
                            <p className="text-xs text-slate-500">{subject.grades.length} grade(s)</p>
                          </div>
                        </button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Material Visibility Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Material Visibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p className="text-slate-600">
                    When you upload materials, they are automatically visible to:
                  </p>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>All learners in {currentSubject.subjectName}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Learners taking this specific subject</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Active enrollments only</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-xs">
                      <strong>Tip:</strong> Materials are instantly accessible to your {stats.totalLearners} learners upon upload.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Recent Uploads (7 days)</span>
                    <span className="font-semibold text-slate-900">{stats.recentUploads}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Materials Visible</span>
                    <span className="font-semibold text-slate-900">{stats.totalMaterials}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Learners with Access</span>
                    <span className="font-semibold text-slate-900">{stats.totalLearners}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;