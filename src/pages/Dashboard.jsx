import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollmentAPI, subjectAPI, announcementAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BookOpen, GraduationCap, Award, Calendar, TrendingUp, ChevronRight, Megaphone, Pin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'
  
  // Current subjects state
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // FET History state
  const [enrollmentHistory, setEnrollmentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch announcements on mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const response = await announcementAPI.getRecent(5);
      if (response.success) {
        setAnnouncements(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  // Fetch current subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) return;

      try {
        // Use the correct API endpoint from subjectRoutes
        const response = await subjectAPI.getMySubjects();
        
        if (response.success) {
          // The response has subjects.doing array
          setSubjects(response.subjects?.doing || []);
        } else {
          throw new Error(response.message || 'Failed to load subjects');
        }
      } catch (err) {
        console.error('❌ [Dashboard] Failed to fetch subjects:', err);
        if (err.message?.includes('401') || err.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError(err.message || 'Failed to load subjects');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [user]);

  // Fetch FET history when tab changes
  useEffect(() => {
    if (activeTab === 'history' && enrollmentHistory.length === 0) {
      fetchFETHistory();
    }
  }, [activeTab]);

  const fetchFETHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_URL}/enrollments/history?phase=fet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEnrollmentHistory(data.data?.byGrade || []);
      }
    } catch (err) {
      console.error('Failed to fetch enrollment history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Calculate overall stats from history
  const calculateStats = () => {
    if (!enrollmentHistory.length) return null;
    
    let totalSubjects = 0;
    let passedSubjects = 0;
    let totalMark = 0;
    
    enrollmentHistory.forEach(grade => {
      grade.subjects.forEach(subject => {
        totalSubjects++;
        if (subject.final_mark) {
          totalMark += parseFloat(subject.final_mark);
          if (subject.final_mark >= 50) passedSubjects++;
        }
      });
    });
    
    return {
      totalSubjects,
      passedSubjects,
      averageMark: totalSubjects > 0 ? (totalMark / totalSubjects).toFixed(1) : 0,
      passRate: totalSubjects > 0 ? ((passedSubjects / totalSubjects) * 100).toFixed(0) : 0
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 mb-4">{error}</p>
          <Link 
            to="/login" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img 
          src="/E-tab logo.png" 
          alt="E-tab" 
          className="h-12 w-auto"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Hi, {user?.firstName || user?.first_name || 'Student'}! 👋
          </h1>
          <p className="text-slate-500">
            {user?.grade || user?.currentGrade || user?.current_grade || 'No grade'} • {subjects.length} Current Subjects
          </p>
        </div>
      </div>

      {/* Stats Overview (if we have history) */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalSubjects}</p>
                <p className="text-xs text-slate-600">Total FET Subjects</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 text-white flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.passRate}%</p>
                <p className="text-xs text-slate-600">Pass Rate</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.averageMark}%</p>
                <p className="text-xs text-slate-600">Average Mark</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-600 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{enrollmentHistory.length}</p>
                <p className="text-xs text-slate-600">FET Grades Completed</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Announcements
            </h2>
            <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <Card 
                key={announcement.id} 
                className={`p-4 hover:shadow-md transition-shadow ${announcement.is_pinned ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {announcement.is_pinned && (
                        <Pin className="w-3 h-3 text-blue-600" />
                      )}
                      <Badge variant="secondary" className="text-xs">{announcement.subject_name}</Badge>
                      <span className="text-xs text-slate-400">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-medium text-slate-900">{announcement.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{announcement.content}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('current')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'current'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Current Subjects ({subjects.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'history'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            FET Phase History (Grades 10-12)
          </span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'current' ? (
        // Current Subjects Grid
        subjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-2">No subjects found</p>
            <p className="text-slate-400 text-sm">Contact your administrator</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(subject => (
              <Link 
                key={subject.id} 
                to={`/learner/materials/${subject.id}`}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-slate-100 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                    {subject.code?.charAt(0) || subject.name?.charAt(0) || 'S'}
                  </div>
                  <Badge variant="success">Current</Badge>
                </div>
                
                <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                  {subject.name}
                </h3>
                <p className="text-sm text-slate-500">{subject.code}</p>
                
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                  <span>View Materials</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        // FET Phase History
        historyLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : enrollmentHistory.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-2">No FET phase history found</p>
            <p className="text-slate-400 text-sm">Your Grades 10-12 enrollment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {enrollmentHistory.map((grade) => (
              <Card key={grade.grade} className="overflow-hidden">
                {/* Grade Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-slate-900">{grade.grade}</h3>
                        <p className="text-sm text-slate-500">Academic Year: {grade.academic_year}</p>
                      </div>
                    </div>
                    <Badge variant="info">{grade.subjects.length} Subjects</Badge>
                  </div>
                </div>
                
                {/* Subjects Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium">Subject</th>
                        <th className="px-6 py-3 text-left font-medium">Code</th>
                        <th className="px-6 py-3 text-left font-medium">Teacher</th>
                        <th className="px-6 py-3 text-center font-medium">Term 1</th>
                        <th className="px-6 py-3 text-center font-medium">Term 2</th>
                        <th className="px-6 py-3 text-center font-medium">Term 3</th>
                        <th className="px-6 py-3 text-center font-medium">Final</th>
                        <th className="px-6 py-3 text-center font-medium">Status</th>
                        <th className="px-6 py-3 text-center font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {grade.subjects.map((subject) => (
                        <tr key={subject.subject_id || subject.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">
                              {subject.subject_name || subject.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {subject.subject_code || subject.code}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {subject.teacher_name || '-'}
                          </td>
                          <td className="px-6 py-4 text-center text-sm">
                            {subject.term_1_mark || '-'}
                          </td>
                          <td className="px-6 py-4 text-center text-sm">
                            {subject.term_2_mark || '-'}
                          </td>
                          <td className="px-6 py-4 text-center text-sm">
                            {subject.term_3_mark || '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-semibold ${
                              subject.final_mark >= 50 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {subject.final_mark || '-'}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {subject.final_mark ? (
                              <Badge variant={subject.final_mark >= 50 ? 'success' : 'error'}>
                                {subject.final_mark >= 50 ? 'Passed' : 'Failed'}
                              </Badge>
                            ) : (
                              <Badge variant="warning">Pending</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link
                              to={`/learner/materials/${subject.subject_id || subject.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Materials
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default Dashboard;
