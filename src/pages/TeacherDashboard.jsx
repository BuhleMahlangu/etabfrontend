import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TeacherDashboard = () => {
  const { addToast } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/teachers/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setDashboard(data.dashboard);
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

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Teacher Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600">
              {dashboard?.subjects?.length || 0}
            </div>
            <p className="text-slate-500">Subjects Teaching</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600">
              {dashboard?.totalStudents || 0}
            </div>
            <p className="text-slate-500">Total Students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600">
              {dashboard?.materials?.total_materials || 0}
            </div>
            <p className="text-slate-500">Materials Uploaded</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-orange-600">
              {dashboard?.pendingGrading || 0}
            </div>
            <p className="text-slate-500">Pending Grading</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/teacher/materials">
          <Card hover className="h-full">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-semibold text-lg">Upload Materials</h3>
              <p className="text-slate-500 text-sm">Share notes, videos, and resources</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/teacher/assignments">
          <Card hover className="h-full">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-semibold text-lg">Create Assignment</h3>
              <p className="text-slate-500 text-sm">Homework, tests, and projects</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/teacher/grade">
          <Card hover className="h-full">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="font-semibold text-lg">Grade Submissions</h3>
              <p className="text-slate-500 text-sm">Review and grade student work</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* My Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>My Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard?.subjects?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboard.subjects.map(subject => (
                <div key={`${subject.id}-${subject.grade}`} className="p-4 border rounded-lg hover:bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{subject.name}</h4>
                      <p className="text-sm text-slate-500">{subject.code} • {subject.grade}</p>
                      <p className="text-sm text-slate-400">{subject.department}</p>
                    </div>
                    <Badge>{subject.student_count} students</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No subjects assigned yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};