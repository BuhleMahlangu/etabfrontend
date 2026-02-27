import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export function Dashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.grade) {
      // Fetch subjects for the user's grade
      fetch(`http://localhost:5000/api/subjects/grade/${user.grade}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('etab_token')}`
        }
      })
        .then(r => r.json())
        .then(data => {
          setSubjects(data.data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch subjects:', err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img src="/E-tab logo.png" alt="E-tab" className="h-12 w-auto" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hi, {user?.firstName}! 👋</h1>
          <p className="text-slate-500">{user?.grade} • {subjects.length} Subjects</p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No subjects found for {user?.grade}</p>
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
                  {subject.code.replace(/-.*$/, '')}
                </div>
                {subject.is_compulsory ? <Badge variant="primary">Core</Badge> : <Badge>Elective</Badge>}
              </div>
              <h3 className="font-semibold text-slate-900 text-lg">{subject.name}</h3>
              <p className="text-sm text-slate-500">{subject.department}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                <span>📚 Materials</span>
                <span>📊 Progress</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}