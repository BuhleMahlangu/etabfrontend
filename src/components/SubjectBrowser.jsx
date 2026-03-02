import React, { useState, useEffect, useCallback } from 'react';
import { Search, BookOpen, Plus, Check, X, Star, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from './common/Toast';
import { Button } from './common/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function SubjectBrowser() {
  const [subjects, setSubjects] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ department: '' });
  const [activeTab, setActiveTab] = useState('browse');
  const [userGrade, setUserGrade] = useState('');
  const [userPhase, setUserPhase] = useState('');
  const [summary, setSummary] = useState(null);
  const [isFET, setIsFET] = useState(false);
  const [authError, setAuthError] = useState(null); // NEW: Track auth errors
  const { addToast } = useToast();

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  // NEW: Check if user is authenticated
  const checkAuth = () => {
    const token = getToken();
    if (!token) {
      setAuthError('Please log in to view subjects');
      return false;
    }
    return true;
  };

  // UPDATED: Fetch with proper auth handling
  const fetchSubjects = useCallback(async () => {
    // Check auth first
    if (!checkAuth()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setAuthError(null);
      const token = getToken();
      
      const response = await fetch(`${API_URL}/subjects/my-subjects`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Auth error:', errorData);
        
        // Clear invalid token
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        
        setAuthError('Session expired. Please log in again.');
        addToast('Session expired. Please log in again.', 'error');
        setLoading(false);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      // Handle other errors
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Combine doing and available for browse view
        const allSubjects = [
          ...(data.subjects?.doing || []).map(s => ({ ...s, isEnrolled: true })),
          ...(data.subjects?.available || []).map(s => ({ ...s, isEnrolled: false, isAvailable: true }))
        ];
        
        setSubjects(allSubjects);
        setEnrolledSubjects(data.subjects?.doing || []);
        setUserGrade(data.grade);
        setUserPhase(data.phase);
        setSummary(data.summary);
        setIsFET(data.phase === 'FET');
        
        // Extract unique departments
        const uniqueDepts = [...new Set(allSubjects.map(s => s.department))];
        setDepartments(uniqueDepts);
      } else {
        throw new Error(data.message || 'Failed to load subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // UPDATED: Enroll with auth check
  const handleEnroll = async (moduleId) => {
    if (!checkAuth()) {
      addToast('Please log in first', 'error');
      return;
    }

    try {
      const token = getToken();
      
      const response = await fetch(`${API_URL}/subjects/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ moduleId })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        addToast('Session expired. Please log in again.', 'error');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        addToast(data.message, 'success');
        fetchSubjects(); // Refresh all data
      } else {
        addToast(data.message, 'error');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      addToast('Failed to enroll in subject', 'error');
    }
  };

  // UPDATED: Drop with auth check
  const handleDrop = async (moduleId) => {
    if (!window.confirm('Are you sure you want to drop this subject?')) return;
    
    if (!checkAuth()) {
      addToast('Please log in first', 'error');
      return;
    }

    try {
      const token = getToken();
      
      const response = await fetch(`${API_URL}/subjects/drop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ moduleId })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        addToast('Session expired. Please log in again.', 'error');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        addToast(data.message, 'success');
        fetchSubjects(); // Refresh
      } else {
        addToast(data.message, 'error');
      }
    } catch (error) {
      console.error('Error dropping subject:', error);
      addToast('Failed to drop subject', 'error');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Client-side filtering since we have all data
    const filtered = subjects.filter(s => {
      const searchLower = searchQuery.toLowerCase();
      return (
        s.name?.toLowerCase().includes(searchLower) ||
        s.code?.toLowerCase().includes(searchLower) ||
        s.department?.toLowerCase().includes(searchLower)
      );
    });
    setSubjects(filtered);
  };

  // Filter by department
  const filteredSubjects = subjects.filter(s => {
    if (!filters.department) return true;
    return s.department === filters.department;
  });

  // Load initial data
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const isEnrolled = (subjectId) => {
    return enrolledSubjects.some(s => s.id === subjectId);
  };

  // NEW: Show auth error screen
  if (authError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-slate-600 mb-6">{authError}</p>
          <Button onClick={() => window.location.href = '/login'} className="w-full">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Subject Selection</h1>
          <p className="text-slate-600">
            {userGrade ? `Manage your subjects for ${userGrade} (${userPhase})` : 'Manage your subjects'}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Enrolled</p>
                <p className="text-xl font-bold text-slate-900">{summary?.totalDoing || enrolledSubjects.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Compulsory</p>
                <p className="text-xl font-bold text-slate-900">
                  {summary?.compulsoryDoing || enrolledSubjects.filter(s => s.isCompulsory).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Optional</p>
                <p className="text-xl font-bold text-slate-900">
                  {summary?.optionalDoing || enrolledSubjects.filter(s => !s.isCompulsory).length}
                  {isFET && <span className="text-sm font-normal text-slate-500">/4</span>}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Available</p>
                <p className="text-xl font-bold text-slate-900">
                  {summary?.totalAvailable || subjects.filter(s => !s.isEnrolled).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FET Warning */}
        {isFET && summary?.optionalDoing >= 4 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800">
              You've selected the maximum of 4 optional subjects. 
              Drop one to choose a different subject.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { id: 'browse', label: 'All Subjects', icon: Search },
            { id: 'my-subjects', label: 'My Subjects', icon: BookOpen },
            { id: 'available', label: 'Available', icon: Plus }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters - Only show in browse tab */}
        {activeTab === 'browse' && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subjects by name, code, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <Button type="submit" className="px-6">
                Search
              </Button>
            </form>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Browse Tab - All Subjects */}
            {activeTab === 'browse' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map(subject => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    isEnrolled={subject.isEnrolled}
                    onEnroll={() => handleEnroll(subject.id)}
                    onDrop={() => handleDrop(subject.id)}
                  />
                ))}
              </div>
            )}

            {/* My Subjects Tab */}
            {activeTab === 'my-subjects' && (
              <div className="space-y-6">
                {/* Compulsory Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Compulsory Subjects
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrolledSubjects
                      .filter(s => s.isCompulsory)
                      .map(subject => (
                        <SubjectCard
                          key={subject.id}
                          subject={subject}
                          isEnrolled={true}
                          showProgress={true}
                        />
                      ))}
                  </div>
                  {enrolledSubjects.filter(s => s.isCompulsory).length === 0 && (
                    <p className="text-slate-500 text-center py-8">No compulsory subjects enrolled</p>
                  )}
                </div>

                {/* Optional Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-600" />
                    Optional Subjects
                    {isFET && (
                      <span className="text-sm font-normal text-slate-500">
                        ({summary?.optionalDoing || 0}/4 max)
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrolledSubjects
                      .filter(s => !s.isCompulsory)
                      .map(subject => (
                        <SubjectCard
                          key={subject.id}
                          subject={subject}
                          isEnrolled={true}
                          showProgress={true}
                          onDrop={() => handleDrop(subject.id)}
                        />
                      ))}
                  </div>
                  {enrolledSubjects.filter(s => !s.isCompulsory).length === 0 && (
                    <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
                      <p className="text-slate-500">No optional subjects enrolled yet</p>
                      {isFET && (
                        <button
                          onClick={() => setActiveTab('available')}
                          className="mt-2 text-blue-600 hover:underline"
                        >
                          Browse available subjects
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Available Tab - For FET */}
            {activeTab === 'available' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-1">Available Optional Subjects</h3>
                  <p className="text-sm text-blue-700">
                    You can enroll in up to 4 optional subjects. 
                    Currently enrolled: <strong>{summary?.optionalDoing || 0}/4</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects
                    .filter(s => !s.isEnrolled && !s.isCompulsory)
                    .map(subject => (
                      <SubjectCard
                        key={subject.id}
                        subject={subject}
                        isEnrolled={false}
                        onEnroll={() => handleEnroll(subject.id)}
                      />
                    ))}
                </div>

                {subjects.filter(s => !s.isEnrolled && !s.isCompulsory).length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl">
                    <p className="text-slate-500">No more optional subjects available</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Subject Card Component
function SubjectCard({ subject, isEnrolled, onEnroll, onDrop, showProgress = false, badge }) {
  const getDepartmentColor = (dept) => {
    const colors = {
      'Mathematics': 'bg-blue-100 text-blue-700',
      'Science': 'bg-green-100 text-green-700',
      'Languages': 'bg-purple-100 text-purple-700',
      'Technology': 'bg-cyan-100 text-cyan-700',
      'Arts': 'bg-pink-100 text-pink-700',
      'Humanities': 'bg-amber-100 text-amber-700',
      'Business': 'bg-emerald-100 text-emerald-700',
      'Services': 'bg-orange-100 text-orange-700',
      'Life Orientation': 'bg-teal-100 text-teal-700'
    };
    return colors[dept] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Header */}
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative">
        {subject.coverImage ? (
          <img 
            src={subject.coverImage} 
            alt={subject.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-slate-300" />
          </div>
        )}
        
        {badge && (
          <span className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
            {badge}
          </span>
        )}
        
        {subject.isCompulsory && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
            Compulsory
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getDepartmentColor(subject.department)}`}>
              {subject.department}
            </span>
            <h3 className="font-semibold text-slate-900 mt-1">{subject.name}</h3>
            <p className="text-sm text-slate-500">{subject.code}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {subject.description || `${subject.name} - ${subject.department}`}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span>{subject.credits || 1} Credit{subject.credits !== 1 ? 's' : ''}</span>
          <span>{subject.phase}</span>
        </div>

        {/* Progress Bar */}
        {showProgress && isEnrolled && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">Progress</span>
              <span className="font-medium text-slate-900">{subject.progress || 0}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${subject.progress || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isEnrolled ? (
            <>
              <button
                disabled
                className="flex-1 py-2 px-4 bg-green-50 text-green-700 rounded-lg font-medium flex items-center justify-center gap-2 cursor-default"
              >
                <Check className="w-4 h-4" />
                Enrolled
              </button>
              {!subject.isCompulsory && onDrop && (
                <button
                  onClick={onDrop}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Drop subject"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onEnroll}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Enroll
            </button>
          )}
        </div>
      </div>
    </div>
  );
}