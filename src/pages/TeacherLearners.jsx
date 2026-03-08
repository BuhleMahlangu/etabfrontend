import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import { Search, Users, BookOpen, ChevronDown, ChevronRight, Mail } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TeacherLearners = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [learners, setLearners] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGrades, setExpandedGrades] = useState(new Set());
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    fetchLearners();
  }, [pagination.page]);

  const fetchLearners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/teacher-learners/my-learners?page=${pagination.page}&search=${searchTerm}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setLearners(data.data.learners);
        setGroupedData(data.data.groupedByGrade);
        setPagination(prev => ({ ...prev, totalPages: data.data.pagination.totalPages }));
        
        // Expand first grade by default
        if (data.data.groupedByGrade.length > 0) {
          setExpandedGrades(new Set([data.data.groupedByGrade[0].gradeId]));
        }
      } else {
        addToast(data.message || 'Failed to load learners', 'error');
      }
    } catch (error) {
      console.error('Error fetching learners:', error);
      addToast('Error loading learners', 'error');
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLearners();
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Learners</h1>
            <p className="text-slate-500 mt-1">
              Students in your assigned grades and subjects
            </p>
          </div>
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search learners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Learners</p>
                  <p className="text-2xl font-bold text-slate-900">{learners.length}</p>
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
                  <p className="text-sm text-slate-600">Grades</p>
                  <p className="text-2xl font-bold text-slate-900">{groupedData.length}</p>
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
                  <p className="text-sm text-slate-600">Subjects</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {groupedData.reduce((acc, grade) => acc + grade.subjects.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learners by Grade */}
        <div className="space-y-4">
          {groupedData.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">
                <p>No learners found.</p>
                <p className="text-sm mt-2">
                  You need to be assigned to grades and subjects to see learners.
                </p>
              </CardContent>
            </Card>
          ) : (
            groupedData.map((grade) => (
              <Card key={grade.gradeId}>
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleGradeExpand(grade.gradeId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedGrades.has(grade.gradeId) ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                      <CardTitle className="text-lg">
                        {grade.gradeName} (Level {grade.gradeLevel})
                      </CardTitle>
                    </div>
                    <Badge variant="primary">
                      {grade.subjects.reduce((acc, sub) => acc + sub.learners.length, 0)} learners
                    </Badge>
                  </div>
                </CardHeader>

                {expandedGrades.has(grade.gradeId) && (
                  <CardContent>
                    <div className="space-y-6">
                      {grade.subjects.map((subject) => (
                        <div key={subject.subjectId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {subject.subjectName}
                              </h3>
                              <p className="text-sm text-slate-500">
                                {subject.subjectCode} • {subject.department}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {subject.learners.length} students
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {subject.learners.map((learner) => (
                              <div
                                key={learner.learnerId}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {learner.firstName} {learner.lastName}
                                  </p>
                                  <p className="text-sm text-slate-500">{learner.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {learner.isPrimaryTeacher && (
                                    <Badge variant="success" className="text-xs">Primary</Badge>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.location.href = `mailto:${learner.email}`}
                                  >
                                    <Mail className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-slate-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherLearners;