import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';

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
    selectedSubjects: []
  });
  const [gradeDetails, setGradeDetails] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Fetch subjects when teacher role selected
  useEffect(() => {
    if (formData.role === 'teacher') {
      fetchAllSubjects();
    }
  }, [formData.role]);

  // Fetch grade details when grade selected
  useEffect(() => {
    if (formData.role === 'learner' && formData.grade) {
      fetchGradeDetails(formData.grade);
    }
  }, [formData.grade, formData.role]);

  const fetchAllSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/subjects/available-grades`);
      const data = await response.json();
      // For teachers, we'd need a different endpoint - this is simplified
      console.log('Available grades:', data);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const fetchGradeDetails = async (grade) => {
    try {
      const response = await fetch(`${API_URL}/subjects/available-grades`);
      const data = await response.json();
      
      if (data.success) {
        const gradeInfo = data.grades.find(g => g.grade === grade);
        setGradeDetails(gradeInfo);
      }
    } catch (err) {
      console.error('Failed to fetch grade details:', err);
    }
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
      // Step 1: Register the user
      const registerResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          grade: formData.role === 'learner' ? formData.grade : null
        })
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'Registration failed');
      }

      // CRITICAL: Check if token exists
      if (!registerData.token) {
        console.error('Registration response missing token:', registerData);
        throw new Error('Registration successful but no token received. Please login manually.');
      }

      const token = registerData.token;

      // FIXED: Store token in localStorage so AuthContext can find it
      localStorage.setItem('token', token);

      // Step 2: For learners, select grade (this will auto-enroll in subjects)
      if (formData.role === 'learner' && formData.grade) {
        const selectGradeResponse = await fetch(`${API_URL}/subjects/select-grade`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ grade: formData.grade })
        });

        const gradeData = await selectGradeResponse.json();
        
        if (!selectGradeResponse.ok) {
          console.warn('Grade selection warning:', gradeData);
          addToast('Account created, but there was an issue setting up your subjects.', 'warning');
        } else {
          addToast(`Welcome! You are now enrolled in ${gradeData.autoEnrolled} subjects for ${formData.grade}.`, 'success');
        }
      }

      // Step 3: For teachers, create teacher profile
      if (formData.role === 'teacher') {
        try {
          await fetch(`${API_URL}/teachers/register`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              employeeNumber: `TCH${Date.now()}`,
              qualification: 'To be updated',
              specialization: 'To be updated',
              yearsOfExperience: 0,
              bio: 'New teacher'
            })
          });
          addToast('Teacher account created successfully!', 'success');
        } catch (teacherErr) {
          console.error('Teacher profile creation failed:', teacherErr);
          // Don't fail registration if teacher profile creation fails
        }
      }

      setStep(3);
      
    } catch (err) {
      setError(err.message || 'Registration failed');
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubject = (subjectId) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId]
    }));
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
                      onClick={() => setFormData({ ...formData, role, grade: '', selectedSubjects: [] })}
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
    const gradeNum = parseInt(formData.grade?.replace('Grade ', '') || 0);
    const isFET = gradeNum >= 10;

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

          {formData.role === 'learner' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Grade</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value, selectedSubjects: [] })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
              >
                <option value="">Select grade...</option>
                {GRADES.map(grade => (
                  <option key={grade} value={grade}>
                    {grade} ({PHASES[grade]} Phase)
                  </option>
                ))}
              </select>

              {gradeDetails && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Phase:</strong> {PHASES[formData.grade]}<br />
                    <strong>Total Subjects:</strong> {gradeDetails.total_modules}<br />
                    <strong>Compulsory:</strong> {gradeDetails.compulsory_count} subjects<br />
                    {isFET && (
                      <>
                        <strong>Optional:</strong> {gradeDetails.optional_count} subjects (choose up to 4)<br />
                      </>
                    )}
                    <span className="text-xs text-blue-600 mt-1 block">
                      {isFET 
                        ? 'You will be auto-enrolled in compulsory subjects and can select optional subjects after registration.'
                        : 'You will be automatically enrolled in all subjects for this grade.'}
                    </span>
                  </p>
                </div>
              )}

              {isFET && gradeDetails && (
                <div className="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-700">
                    <strong>Note:</strong> For FET phase (Grades 10-12), you'll select your 3-4 optional subjects after logging in. 
                    Compulsory subjects (Life Orientation, Home Language, First Additional Language) are automatically assigned.
                  </p>
                </div>
              )}
            </div>
          )}

          {formData.role === 'teacher' && (
            <div className="mb-6">
              <div className="p-4 bg-amber-50 rounded-lg mb-4">
                <p className="text-sm text-amber-700">
                  <strong>Note:</strong> As a teacher, you'll be able to upload materials, 
                  create assignments, and grade student work. Your subjects will be assigned by an administrator.
                </p>
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
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: Success
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
        <p className="text-slate-500 mb-6">
          {formData.role === 'learner' 
            ? `Welcome to E-tab! You are now enrolled in ${gradeDetails?.compulsory_count || 'all'} compulsory subjects for ${formData.grade}.`
            : 'Your teacher account has been created. You can now upload materials and create assignments.'}
        </p>
        {formData.role === 'learner' && parseInt(formData.grade?.replace('Grade ', '')) >= 10 && (
          <p className="text-sm text-amber-600 mb-4">
            Don't forget to select your optional subjects after logging in!
          </p>
        )}
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    </div>
  );
}