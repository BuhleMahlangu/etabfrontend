import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Subjects = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [doingSubjects, setDoingSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userGrade, setUserGrade] = useState('');
  const [userPhase, setUserPhase] = useState('');
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [isFET, setIsFET] = useState(false);

  useEffect(() => {
    fetchMySubjects();
  }, []);

  const fetchMySubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your subjects');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/subjects/my-subjects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle "needs grade selection" case
        if (errorData.needsGradeSelection) {
          setError('Please select your grade first');
          addToast('Please select your grade in profile settings', 'warning');
          // Optionally redirect to grade selection
          // window.location.href = '/select-grade';
          return;
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setDoingSubjects(data.subjects?.doing || []);
        setAvailableSubjects(data.subjects?.available || []);
        setUserGrade(data.grade);
        setUserPhase(data.phase);
        setSummary(data.summary);
        setIsFET(data.phase === 'FET');
        
        const totalDoing = data.subjects?.doing?.length || 0;
        if (totalDoing > 0) {
          addToast(`Showing ${totalDoing} subjects for ${data.grade}`, 'success');
        }
      } else {
        throw new Error(data.message || 'Failed to load subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError(error.message);
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Use moduleId instead of subjectId to match new backend
  const handleEnroll = async (moduleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/subjects/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ moduleId }) // Changed from subjectId to moduleId
      });

      const data = await response.json();
      
      if (data.success) {
        addToast(data.message || 'Successfully enrolled!', 'success');
        fetchMySubjects(); // Refresh the list
      } else {
        addToast(data.message, 'error');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      addToast('Error enrolling in subject', 'error');
    }
  };

  // NEW: Handle drop optional subject
  const handleDrop = async (moduleId) => {
    if (!window.confirm('Are you sure you want to drop this subject?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/subjects/drop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ moduleId })
      });

      const data = await response.json();
      
      if (data.success) {
        addToast(data.message || 'Subject dropped successfully', 'success');
        fetchMySubjects(); // Refresh
      } else {
        addToast(data.message, 'error');
      }
    } catch (error) {
      console.error('Error dropping:', error);
      addToast('Error dropping subject', 'error');
    }
  };

  // Filter only the "doing" subjects
  const filteredDoing = doingSubjects.filter(subject => {
    if (!subject) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      (subject.name?.toLowerCase().includes(searchLower)) || 
      (subject.code?.toLowerCase().includes(searchLower)) ||
      (subject.department?.toLowerCase().includes(searchLower))
    );
  });

  // Group by department
  const subjectsByDepartment = filteredDoing.reduce((acc, subject) => {
    const dept = subject.department || 'Other';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(subject);
    return acc;
  }, {});

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12 bg-red-50 rounded-xl border-2 border-red-200">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Subjects</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchMySubjects} variant="primary">Try Again</Button>
            <Button onClick={() => window.location.href = '/dashboard'} variant="secondary">Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Subjects</h1>
          <p className="text-slate-500 mt-1">
            {userGrade ? `${userGrade} (${userPhase}) - What you're studying` : 'Your subjects'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="success" className="text-sm">
            {summary?.totalDoing || doingSubjects.length} Doing
          </Badge>
          {isFET && (
            <Badge variant="primary" className="text-sm">
              {summary?.optionalDoing || 0}/4 Optional Chosen
            </Badge>
          )}
          <Button onClick={fetchMySubjects} variant="ghost" size="sm" title="Refresh">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search your subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      {/* DOING SECTION - Subjects the learner is actively doing */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-8 bg-green-500 rounded-full"></span>
          Currently Doing
          <Badge variant="success">{filteredDoing.length}</Badge>
        </h2>

        {Object.entries(subjectsByDepartment).length > 0 ? (
          Object.entries(subjectsByDepartment).map(([department, deptSubjects]) => (
            <div key={department} className="mb-6">
              <h3 className="text-lg font-medium text-slate-700 mb-3 flex items-center gap-2">
                {department}
                <span className="text-sm text-slate-400">({deptSubjects.length})</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deptSubjects.map((subject) => (
                  <Link key={subject.id} to={`/subjects/${subject.id}`} className="group">
                    <Card hover className="h-full border-l-4 border-l-green-500">
                      <div className="relative h-48 overflow-hidden rounded-t-2xl">
                        <img 
                          src={subject.coverImage || getDefaultCoverImage(subject.department)} 
                          alt={subject.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge 
                            variant={subject.isCompulsory ? 'primary' : 'secondary'}
                            className={subject.isCompulsory ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}
                          >
                            {subject.isCompulsory ? 'Compulsory' : 'Optional'}
                          </Badge>
                          <Badge variant="success" className="bg-green-600 text-white">
                            Doing
                          </Badge>
                        </div>
                        
                        <div className="absolute bottom-4 left-4 text-white">
                          <Badge variant="primary" className="bg-white/20 backdrop-blur text-white border-0">
                            {subject.code}
                          </Badge>
                        </div>
                      </div>

                      <CardContent>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {subject.name}
                        </h3>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-semibold text-slate-900">{subject.progress || 0}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                              style={{ width: `${subject.progress || 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {subject.materials || 0} materials
                          </span>
                          <span>{subject.credits} credits</span>
                        </div>

                        {/* NEW: Drop button for FET optional subjects */}
                        {isFET && !subject.isCompulsory && (
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDrop(subject.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-red-600 hover:text-red-700"
                          >
                            Drop Subject
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500">No subjects found. {searchQuery && 'Try clearing your search.'}</p>
          </div>
        )}
      </div>

      {/* AVAILABLE SECTION - For FET phase only */}
      {isFET && availableSubjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            Available to Choose
            <Badge variant="primary">{availableSubjects.length}</Badge>
          </h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>FET Phase:</strong> You must choose 3-4 optional subjects. 
              Currently have <strong>{summary?.optionalDoing || 0}/4</strong> optional subjects.
              {summary?.optionalDoing >= 4 && (
                <span className="text-red-600 block mt-1">You've reached the maximum of 4 optional subjects.</span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSubjects.map((subject) => (
              <Card key={subject.id} hover className="h-full border-l-4 border-l-blue-500">
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img 
                    src={subject.coverImage || getDefaultCoverImage(subject.department)} 
                    alt={subject.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-blue-600 text-white">
                      Available
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 text-white">
                    <Badge variant="primary" className="bg-white/20 backdrop-blur text-white border-0">
                      {subject.code}
                    </Badge>
                  </div>
                </div>

                <CardContent>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">{subject.department}</p>
                  
                  <Button 
                    onClick={() => handleEnroll(subject.id)}
                    variant="primary"
                    className="w-full"
                    disabled={(summary?.optionalDoing || 0) >= 4}
                  >
                    {(summary?.optionalDoing || 0) >= 4 ? 'Maximum Reached (4/4)' : 'Choose This Subject'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no available subjects for FET */}
      {isFET && availableSubjects.length === 0 && (summary?.optionalDoing || 0) < 4 && (
        <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500">No more optional subjects available.</p>
        </div>
      )}
    </div>
  );
};

function getDefaultCoverImage(department) {
  const images = {
    'Mathematics': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
    'Science': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400',
    'Languages': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
    'Technology': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    'Arts': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400',
    'Humanities': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
    'Business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
    'Services': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    'Life Orientation': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  };
  
  return images[department] || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400';
}