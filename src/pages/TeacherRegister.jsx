import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';
import { Badge } from '../components/common/Badge';
import { Check, X, Users, BookOpen, Plus, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TeacherRegister = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeNumber: '',
    qualification: '',
    specialization: '',
    yearsOfExperience: '',
    bio: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/subjects/available-grades`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setGrades(data.grades);
      }
    } catch (err) {
      console.error('Failed to fetch grades:', err);
    }
  };

  const fetchSubjectsForGrade = async (gradeId) => {
    try {
      const token = localStorage.getItem('token');
      // FIXED: Use teachers/subjects-by-grade endpoint with auth
      const response = await fetch(`${API_URL}/teachers/subjects-by-grade/${gradeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAvailableSubjects(data.subjects);
        setSelectedGrade(data.grade);
        setSelectedSubjects([]);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      addToast('Failed to load subjects', 'error');
    }
  };

  const toggleSubject = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const addAssignment = () => {
    if (!selectedGrade || selectedSubjects.length === 0) {
      addToast('Please select a grade and at least one subject', 'error');
      return;
    }

    const existingIndex = assignments.findIndex(a => a.gradeId === selectedGrade.id);
    
    if (existingIndex >= 0) {
      const updated = [...assignments];
      const existing = updated[existingIndex];
      const newSubjects = selectedSubjects.filter(id => !existing.subjectIds.includes(id));
      
      if (newSubjects.length === 0) {
        addToast('These subjects are already added', 'warning');
        return;
      }
      
      existing.subjectIds = [...existing.subjectIds, ...newSubjects];
      setAssignments(updated);
      addToast(`Added ${newSubjects.length} more subjects to ${selectedGrade.name}`, 'success');
    } else {
      setAssignments(prev => [...prev, {
        gradeId: selectedGrade.id,
        gradeName: selectedGrade.name,
        gradeLevel: selectedGrade.level,
        subjectIds: [...selectedSubjects],
        isPrimary: prev.length === 0
      }]);
      addToast(`Added ${selectedSubjects.length} subjects for ${selectedGrade.name}`, 'success');
    }
    
    setSelectedSubjects([]);
  };

  const removeAssignment = (gradeId) => {
    setAssignments(prev => {
      const filtered = prev.filter(a => a.gradeId !== gradeId);
      if (filtered.length > 0 && !filtered.some(a => a.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const removeSubjectFromAssignment = (gradeId, subjectId) => {
    setAssignments(prev => prev.map(a => {
      if (a.gradeId === gradeId) {
        const updatedSubjectIds = a.subjectIds.filter(id => id !== subjectId);
        return { ...a, subjectIds: updatedSubjectIds };
      }
      return a;
    }).filter(a => a.subjectIds.length > 0));
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      addToast('Please fill in all required fields', 'error');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return false;
    }
    if (formData.password.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (assignments.length === 0) {
      addToast('Please assign at least one subject', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // ============================================
      // CRITICAL FIX: Use /teachers/register endpoint with Authorization header
      // ============================================
      const response = await fetch(`${API_URL}/teachers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // REQUIRED: Admin authentication
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          employeeNumber: formData.employeeNumber,
          qualification: formData.qualification,
          specialization: formData.specialization,
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
          bio: formData.bio,
          assignments: assignments.map(a => ({
            gradeId: a.gradeId,
            subjectIds: a.subjectIds,
            isPrimary: a.isPrimary
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        addToast('Teacher registered successfully!', 'success');
        navigate('/admin/teachers');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering teacher:', error);
      addToast(error.message || 'Error registering teacher', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectDetails = (subjectId) => {
    return availableSubjects.find(s => s.id === subjectId) || {};
  };

  // Step 1: Basic Information
  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Teacher Registration - Step 1</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); if (validateStep1()) setStep(2); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
                <Input
                  label="Last Name *"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
              
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              
              <Input
                label="Password *"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              
              <Input
                label="Confirm Password *"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
              
              <Input
                label="Employee Number"
                placeholder="e.g., TCH001 (auto-generated if empty)"
                value={formData.employeeNumber}
                onChange={(e) => setFormData({...formData, employeeNumber: e.target.value})}
              />
              
              <Input
                label="Qualification"
                placeholder="e.g., B.Ed, M.Sc Education"
                value={formData.qualification}
                onChange={(e) => setFormData({...formData, qualification: e.target.value})}
              />
              
              <Input
                label="Specialization"
                placeholder="e.g., Mathematics, Science"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              />
              
              <Input
                label="Years of Experience"
                type="number"
                placeholder="0"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about your teaching experience..."
                />
              </div>

              <Button type="submit" className="w-full">
                Next: Select Subjects
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Grade and Subject Selection
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Teacher Registration - Step 2</h1>
          <Button variant="outline" onClick={() => setStep(1)}>
            ← Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Grade/Subject Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Grade & Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Grade
                </label>
                <select
                  value={selectedGrade?.id || ''}
                  onChange={(e) => {
                    const grade = grades.find(g => g.id === e.target.value);
                    if (grade) fetchSubjectsForGrade(grade.id);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a grade...</option>
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.grade} ({grade.phase})
                    </option>
                  ))}
                </select>
              </div>

              {selectedGrade && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Available Subjects in {selectedGrade.name}
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-2">
                    {availableSubjects.map(subject => (
                      <div
                        key={subject.id}
                        onClick={() => toggleSubject(subject.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedSubjects.includes(subject.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{subject.name}</p>
                            <p className="text-xs text-slate-500">{subject.code} • {subject.department}</p>
                          </div>
                          {selectedSubjects.includes(subject.id) && (
                            <Check className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <Users className="w-3 h-3" />
                          {subject.learnerCount} learners enrolled
                          {subject.isCompulsory && (
                            <Badge variant="primary" className="text-xs">Core</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    type="button"
                    onClick={addAssignment}
                    disabled={selectedSubjects.length === 0}
                    className="mt-3 w-full"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {selectedSubjects.length} Subject{selectedSubjects.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Current Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Your Subject Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No subjects assigned yet</p>
                  <p className="text-sm">Select a grade and subjects on the left</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.gradeId} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{assignment.gradeName}</h4>
                          {assignment.isPrimary && (
                            <Badge variant="primary">Primary</Badge>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAssignment(assignment.gradeId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {assignment.subjectIds.map(subjectId => {
                          const subject = getSubjectDetails(subjectId);
                          return (
                            <div
                              key={subjectId}
                              className="flex items-center justify-between bg-white p-2 rounded border border-slate-200"
                            >
                              <div>
                                <p className="font-medium text-sm">{subject.name || 'Subject'}</p>
                                <p className="text-xs text-slate-500">{subject.code || ''}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSubjectFromAssignment(assignment.gradeId, subjectId)}
                                className="text-slate-400 hover:text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {assignments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex justify-between text-sm text-slate-600 mb-4">
                    <span>Total Grades:</span>
                    <span className="font-medium">{assignments.length}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 mb-4">
                    <span>Total Subjects:</span>
                    <span className="font-medium">
                      {assignments.reduce((sum, a) => sum + a.subjectIds.length, 0)}
                    </span>
                  </div>
                  
                  <Button
                    onClick={handleSubmit}
                    loading={loading}
                    className="w-full"
                  >
                    Complete Registration
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};