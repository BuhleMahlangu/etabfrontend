// E-tab Subjects Page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export const Subjects = () => {
  const { user, hasRole } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    // Mock API call - replace with actual API
    setTimeout(() => {
      setSubjects([
        { id: 1, code: 'CS101', name: 'Introduction to Computer Science', credits: 3, department: 'Computer Science', progress: 75, materials: 24, teacher: 'Dr. Smith', cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400' },
        { id: 2, code: 'MATH201', name: 'Calculus II', credits: 4, department: 'Mathematics', progress: 60, materials: 18, teacher: 'Prof. Johnson', cover: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400' },
        { id: 3, code: 'ENG102', name: 'Academic Writing', credits: 3, department: 'English', progress: 90, materials: 12, teacher: 'Dr. Williams', cover: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400' },
        { id: 4, code: 'PHY301', name: 'Physics III', credits: 4, department: 'Physics', progress: 45, materials: 20, teacher: 'Prof. Brown', cover: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         subject.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ? true :
                         filter === 'active' ? subject.progress < 100 :
                         subject.progress === 100;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Subjects</h1>
          <p className="text-slate-500 mt-1">Manage your enrolled courses and materials</p>
        </div>
        {hasRole(['admin']) && (
          <Button leftIcon="+" variant="primary">
            Add Subject
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors',
                filter === f 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <Link key={subject.id} to={`/subjects/${subject.id}`}>
            <Card hover className="h-full group">
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden rounded-t-2xl -mx-6 -mt-6 mb-4">
                <img 
                  src={subject.cover} 
                  alt={subject.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
                <p className="text-sm text-slate-500 mb-4">{subject.department}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold text-slate-900">{subject.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {subject.materials} materials
                    </span>
                    <span>{subject.credits} credits</span>
                  </div>
                  <span className="text-slate-400">{subject.teacher}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-slate-900">No subjects found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};