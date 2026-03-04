import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';
import { Badge } from '../components/common/Badge';
import { Check, X, Users, BookOpen, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3',
  'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9',
  'Grade 10', 'Grade 11', 'Grade 12'
];

const PHASES = {
  'Grade 1': 'Foundation', 'Grade 2': 'Foundation', 'Grade 3': 'Foundation',
  'Grade 4': 'Intermediate', 'Grade 5': 'Intermediate', 'Grade 6': 'Intermediate',
  'Grade 7': 'Senior', 'Grade 8': 'Senior', 'Grade 9': 'Senior',
  'Grade 10': 'FET', 'Grade 11': 'FET', 'Grade 12': 'FET'
};

// Helper function to extract grade number from "Grade X" format
const extractGradeNumber = (gradeString) => {
  if (!gradeString) return '';
  // Extract number from "Grade 8" -> "8"
  const match = gradeString.toString().match(/\d+/);
  return match ? match[0] : gradeString;
};

export function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'learner',
    grade: '',
    // Teacher fields
    employeeNumber: '',
    qualification: '',
    specialization: '',
    yearsOfExperience: '',
    bio: '',
    // Teacher subject assignments
    assignments: []
  });
  const [gradeDetails, setGradeDetails] = useState(null);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [selectedGradeForSubjects, setSelectedGradeForSubjects] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Fetch available grades on mount
  useEffect(() => {
    fetchAvailableGrades();
  }, []);

  const fetchAvailableGrades = async () => {
    try {
      const response = await fetch(`${API_URL}/subjects/available-grades`);
      const data = await response.json();
      if (data.success) {
        setAvailableGrades(data.grades);
      }
    } catch (err) {
      console.error('Failed to fetch grades:', err);
    }
  };

  // Fetch grade details when learner selects grade
  useEffect(() => {
    if (formData.role === 'learner' && formData.grade) {
      // Find grade details using the full grade string (e.g., "Grade 8")
      const grade = availableGrades.find(g => g.grade === formData.grade || extractGradeNumber(g.grade) === formData.grade);
      setGradeDetails(grade || null);
    }
  }, [formData.grade, formData.role, availableGrades]);

  // Fetch subjects when teacher expands subject selector
  const fetchSubjectsForGrade = async (gradeId) => {
    try {
      const response = await fetch(`${API_URL}/subjects/grade-subjects/${gradeId}`);
      const data = await response.json();
      if (data.success) {
        setAvailableSubjects(data.subjects);
        setSelectedGradeForSubjects(data.grade);
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
    if (!selectedGradeForSubjects || selectedSubjects.length === 0) {
      addToast('Please select a grade and at least one subject', 'error');
      return;
    }

    const newAssignment = {
      gradeId: selectedGradeForSubjects.id,
      gradeName: selectedGradeForSubjects.name || selectedGradeForSubjects.grade,
      gradeLevel: selectedGradeForSubjects.level,
      subjectIds: [...selectedSubjects],
      isPrimary: formData.assignments.length === 0
    };

    // Check if grade already exists
    const existingIndex = formData.assignments.findIndex(a => a.gradeId === selectedGradeForSubjects.id);
    
    if (existingIndex >= 0) {
      // Merge subjects
      const updated = [...formData.assignments];
      const existing = updated[existingIndex];
      const newSubjects = selectedSubjects.filter(id => !existing.subjectIds.includes(id));
      
      if (newSubjects.length === 0) {
        addToast('These subjects are already added', 'warning');
        return;
      }
      
      existing.subjectIds = [...existing.subjectIds, ...newSubjects];
      setFormData({ ...formData, assignments: updated });
      addToast(`Added ${newSubjects.length} more subjects`, 'success');
    } else {
      setFormData({ 
        ...formData, 
        assignments: [...formData.assignments, newAssignment] 
      });
      addToast(`Added ${selectedSubjects.length} subjects for ${newAssignment.gradeName}`, 'success');
    }
    
    setSelectedSubjects([]);
    setShowSubjectSelector(false);
  };

  const removeAssignment = (gradeId) => {
    setFormData(prev => ({
      ...prev,
      assignments: prev.assignments.filter(a => a.gradeId !== gradeId)
    }));
  };

  const removeSubjectFromAssignment = (gradeId, subjectId) => {
    setFormData(prev => ({
      ...prev,
      assignments: prev.assignments.map(a => {
        if (a.gradeId === gradeId) {
          return {
            ...a,
            subjectIds: a.subjectIds.filter(id => id !== subjectId)
          };
        }
        return a;
      }).filter(a => a.subjectIds.length > 0)
    }));
  };

  const getSubjectDetails = (subjectId) => {
    return availableSubjects.find(s => s.id === subjectId) || {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // ============================================
      // FIXED: Extract just the grade number for backend
      // ============================================
      const gradeNumber = formData.role === 'learner' ? extractGradeNumber(formData.grade) : null;
      console.log('🔥 [Register] Sending grade:', gradeNumber, 'from:', formData.grade);

      // Build request body based on role
      const requestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        grade: gradeNumber // Send "8" instead of "Grade 8"
      };

      // Add teacher info if role is teacher
      if (formData.role === 'teacher') {
        requestBody.teacherInfo = {
          employeeNumber: formData.employeeNumber || `TCH${Date.now()}`,
          qualification: formData.qualification || 'To be updated',
          specialization: formData.specialization || 'General',
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
          bio: formData.bio || 'New teacher',
          assignments: formData.assignments
        };
      }

      console.log('🔥 [Register] Request body:', JSON.stringify(requestBody, null, 2));

      const registerResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const registerData = await registerResponse.json();
      console.log('🔥 [Register] Response:', registerData);

      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'Registration failed');
      }

      // ============================================
      // TEACHER PENDING APPROVAL
      // ============================================
      if (formData.role === 'teacher' && registerData.pending) {
        setStep(3); // Show success/pending page
        addToast('Registration submitted for admin approval!', 'success');
        return;
      }

      // ============================================
      // LEARNER IMMEDIATE REGISTRATION
      // ============================================
      if (formData.role === 'learner') {
        if (!registerData.token) {
          throw new Error('Registration successful but no token received. Please login manually.');
        }

        // Store token
        localStorage.setItem('token', registerData.token);

        // Select grade (auto-enrolls in subjects) - send number here too
        if (gradeNumber) {
          const selectGradeResponse = await fetch(`${API_URL}/subjects/select-grade`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${registerData.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ grade: gradeNumber }) // Send "8" not "Grade 8"
          });

          const gradeData = await selectGradeResponse.json();
          
          if (!selectGradeResponse.ok) {
            console.warn('Grade selection warning:', gradeData);
            addToast('Account created, but there was an issue setting up your subjects.', 'warning');
          } else {
            addToast(`Welcome! You are now enrolled in ${gradeData.autoEnrolled} subjects for ${formData.grade}.`, 'success');
          }
        }

        setStep(3); // Show success page
      }

    } catch (err) {
      console.error('❌ [Register] Error:', err);
      setError(err.message || 'Registration failed');
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Basic Info
  if (step === 1) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center text-white p-12">
          <div className="text-center">
            <img src="/E-tab logo.png" alt="E-tab" className="h-24 w-auto mx-auto mb-6 drop-shadow-lg" />
            <h1 className="text-5xl font-bold mb-6">Join E-tab</h1>
            <p className="text-xl text-blue-100">Start your learning journey today</p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img src="/E-tab logo.png" alt="E-tab" className="h-16 w-auto mx-auto mb-4 lg:hidden" />
              <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="you@school.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {['learner', 'teacher'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        role, 
                        grade: '', 
                        assignments: [],
                        employeeNumber: '',
                        qualification: '',
                        specialization: '',
                        yearsOfExperience: '',
                        bio: ''
                      })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize ${
                        formData.role === role
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full">
                Continue
              </Button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Role-specific details
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <button 
            onClick={() => setStep(1)} 
            className="text-slate-500 hover:text-slate-700 mb-4"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {formData.role === 'learner' ? 'Select Your Grade' : 'Teacher Registration'}
          </h2>

          {/* LEARNER: Grade Selection */}
          {formData.role === 'learner' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Grade</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
              >
                <option value="">Select grade...</option>
                {availableGrades.map(grade => (
                  <option key={grade.grade} value={grade.grade}>
                    {grade.grade} ({grade.phase})
                  </option>
                ))}
              </select>

              {gradeDetails && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Phase:</strong> {gradeDetails.phase}<br />
                    <strong>Total Subjects:</strong> {gradeDetails.total_modules}<br />
                    <strong>Compulsory:</strong> {gradeDetails.compulsory_count} subjects<br />
                    {gradeDetails.optional_count > 0 && (
                      <>
                        <strong>Optional:</strong> {gradeDetails.optional_count} subjects<br />
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TEACHER: Professional Details */}
          {formData.role === 'teacher' && (
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Teacher registrations require admin approval. 
                  You'll be able to log in once an administrator reviews and approves your request.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Employee Number"
                  placeholder="Auto-generated if empty"
                  value={formData.employeeNumber}
                  onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  placeholder="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                />
              </div>

              <Input
                label="Qualification"
                placeholder="e.g., B.Ed, M.Sc Education"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              />

              <Input
                label="Specialization"
                placeholder="e.g., Mathematics, Science"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about your teaching experience..."
                />
              </div>

              {/* Subject Assignment Section */}
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-slate-900">Subject Assignments</h4>
                  <Badge variant="primary">{formData.assignments.length} grades</Badge>
                </div>

                {/* Current Assignments */}
                {formData.assignments.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.assignments.map((assignment, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{assignment.gradeName}</span>
                          <button
                            type="button"
                            onClick={() => removeAssignment(assignment.gradeId)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {assignment.subjectIds.map(subjectId => {
                            const subject = getSubjectDetails(subjectId);
                            return (
                              <span 
                                key={subjectId}
                                className="inline-flex items-center px-2 py-1 bg-white border rounded text-xs"
                              >
                                {subject.name || 'Subject'}
                                <button
                                  type="button"
                                  onClick={() => removeSubjectFromAssignment(assignment.gradeId, subjectId)}
                                  className="ml-1 text-slate-400 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Assignment Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSubjectSelector(!showSubjectSelector)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject Assignment
                </Button>

                {/* Subject Selector */}
                {showSubjectSelector && (
                  <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <h5 className="font-medium mb-3">Select Grade & Subjects</h5>
                    
                    <select
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 mb-3"
                      onChange={(e) => {
                        const grade = availableGrades.find(g => g.id === e.target.value);
                        if (grade) fetchSubjectsForGrade(grade.id);
                      }}
                      value={selectedGradeForSubjects?.id || ''}
                    >
                      <option value="">Choose a grade...</option>
                      {availableGrades.map(grade => (
                        <option key={grade.id} value={grade.id}>
                          {grade.grade}
                        </option>
                      ))}
                    </select>

                    {selectedGradeForSubjects && (
                      <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                        {availableSubjects.map(subject => (
                          <div
                            key={subject.id}
                            onClick={() => toggleSubject(subject.id)}
                            className={`p-2 rounded border cursor-pointer flex items-center justify-between ${
                              selectedSubjects.includes(subject.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div>
                              <p className="font-medium text-sm">{subject.name}</p>
                              <p className="text-xs text-slate-500">{subject.code}</p>
                            </div>
                            {selectedSubjects.includes(subject.id) && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSubjectSelector(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={addAssignment}
                        disabled={selectedSubjects.length === 0}
                      >
                        Add {selectedSubjects.length} Subject{selectedSubjects.length !== 1 ? 's' : ''}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button 
            onClick={handleSubmit} 
            className="w-full mt-6" 
            isLoading={isLoading}
            disabled={formData.role === 'learner' ? !formData.grade : false}
          >
            {formData.role === 'teacher' ? 'Submit for Approval' : 'Create Account'}
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: Success
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        
        {formData.role === 'teacher' ? (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Submitted!</h2>
            <p className="text-slate-500 mb-6">
              Your teacher registration has been submitted for admin approval. 
              You'll receive an email once your account is approved.
            </p>
            <div className="p-4 bg-amber-50 rounded-lg mb-6">
              <p className="text-sm text-amber-700">
                <strong>Status:</strong> Pending Approval<br />
                <strong>Email:</strong> {formData.email}
              </p>
            </div>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
            <p className="text-slate-500 mb-6">
              Welcome to E-tab! You are now enrolled in {gradeDetails?.compulsory_count || 'all'} compulsory subjects for {formData.grade}.
            </p>
            {parseInt(extractGradeNumber(formData.grade)) >= 10 && (
              <p className="text-sm text-amber-600 mb-4">
                Don't forget to select your optional subjects after logging in!
              </p>
            )}
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          </>
        )}
      </div>
    </div>
  );
}