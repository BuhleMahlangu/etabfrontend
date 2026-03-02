import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function Dashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FIXED: Use correct token key and endpoint
  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const fetchSubjects = async () => {
      const token = getToken();
      
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        // FIXED: Use /my-subjects endpoint instead of /grade/:grade
        const response = await fetch(`${API_URL}/subjects/my-subjects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        
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
        console.error('Failed to fetch subjects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  
  if (error) return (
    <div className="p-8 text-red-600">
      Error: {error}. <Link to="/login" className="underline">Please log in again</Link>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img src="/E-tab logo.png" alt="E-tab" className="h-12 w-auto" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hi, {user?.firstName || 'Student'}! 👋</h1>
          <p className="text-slate-500">
            {user?.grade || 'No grade'} • {subjects.length} Subjects
            {user?.phase && ` • ${user.phase}`}
          </p>
        </div>
      </div>

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
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-slate-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold
                  ${subject.phase === 'Foundation' ? 'bg-pink-100 text-pink-600' :
                    subject.phase === 'Intermediate' ? 'bg-blue-100 text-blue-600' :
                    subject.phase === 'Senior' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                  {subject.code?.replace(/-.*$/, '') || 'S'}
                </div>
                {subject.isCompulsory ? <Badge variant="primary">Core</Badge> : <Badge>Elective</Badge>}
              </div>
              <h3 className="font-semibold text-slate-900 text-lg">{subject.name}</h3>
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
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${subject.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                <span>📚 Materials</span>
                {subject.isEnrolled && <span>✓ Enrolled</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}