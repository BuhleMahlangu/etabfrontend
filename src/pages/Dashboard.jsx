import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { subjectAPI } from '../services/api';  // USE AUTHENTICATED API SERVICE

export function Dashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      // Wait for user to be loaded from AuthContext
      if (!user) {
        console.log('⏳ [Dashboard] Waiting for user to load...');
        return;
      }

      try {
        console.log('🔍 [Dashboard] Fetching subjects for user:', user.email);
        
        // Use authenticated API service - automatically includes token via interceptors
        const data = await subjectAPI.getMySubjects();
        
        console.log('✅ [Dashboard] Subjects data received:', data);

        if (data.success) {
          // Combine doing and available subjects
          const allSubjects = [
            ...(data.subjects?.doing || []),
            ...(data.subjects?.available || [])
          ];
          setSubjects(allSubjects);
        } else {
          throw new Error(data.message || 'Failed to load subjects');
        }
      } catch (err) {
        console.error('❌ [Dashboard] Failed to fetch subjects:', err);
        
        // Handle specific error types
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
  }, [user]); // Re-run when user changes

  // Show loading while waiting for user or subjects
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading your subjects...</p>
        </div>
      </div>
    );
  }
  
  // Show error if fetch failed
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
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Hi, {user?.firstName || user?.first_name || 'Student'}! 👋
          </h1>
          <p className="text-slate-500">
            {user?.grade || user?.currentGrade || user?.current_grade || 'No grade'} • {subjects.length} Subjects
            {user?.phase && ` • ${user.phase}`}
          </p>
        </div>
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 mb-2">No subjects found</p>
          <Link 
            to="/subjects" 
            className="text-blue-600 hover:underline text-sm"
          >
            Browse available subjects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <Link 
              key={subject.id} 
              to={`/subjects/${subject.id}`}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-slate-100 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold
                  ${subject.phase === 'Foundation' ? 'bg-pink-100 text-pink-600' :
                    subject.phase === 'Intermediate' ? 'bg-blue-100 text-blue-600' :
                    subject.phase === 'Senior' ? 'bg-purple-100 text-purple-600' : 
                    'bg-orange-100 text-orange-600'}`}>
                  {subject.code?.replace(/-.*$/, '') || subject.name?.charAt(0) || 'S'}
                </div>
                {subject.isCompulsory ? (
                  <Badge variant="primary">Core</Badge>
                ) : (
                  <Badge>Elective</Badge>
                )}
              </div>
              
              <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                {subject.name}
              </h3>
              <p className="text-sm text-slate-500">{subject.department}</p>
              
              {/* Progress bar for enrolled subjects */}
              {subject.isEnrolled && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{subject.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${subject.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                <span>📚 {subject.materialCount || 0} Materials</span>
                {subject.isEnrolled && <span className="text-green-600">✓ Enrolled</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}