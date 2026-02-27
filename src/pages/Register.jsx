import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';

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
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch subjects when grade changes (for learners) or for teachers
  useEffect(() => {
    if (formData.role === 'learner' && formData.grade) {
      fetchSubjectsForGrade(formData.grade);
    } else if (formData.role === 'teacher') {
      fetchAllSubjects();
    }
  }, [formData.role, formData.grade]);

  const fetchSubjectsForGrade = async (grade) => {
    try {
      const response = await fetch(`http://localhost:5000/api/subjects/grade/${grade}`);
      const data = await response.json();
      setAvailableSubjects(data.data || []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const fetchAllSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subjects');
      const data = await response.json();
      setAvailableSubjects(data.data || []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
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
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        grade: formData.role === 'learner' ? formData.grade : null,
        subjects: formData.role === 'teacher' ? formData.selectedSubjects : null
      };

      await authAPI.register(payload);
      setStep(3); // Success
    } catch (err) {
      setError(err.message || 'Registration failed');
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
                <div className="grid grid-cols-3 gap-3">
                  {['learner', 'teacher', 'admin'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role, grade: '', selectedSubjects: [] })}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize',
                        formData.role === role
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      )}
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
            {formData.role === 'learner' ? 'Select Your Grade' : 'Select Your Subjects'}
          </h2>

          {formData.role === 'learner' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Grade</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
              >
                <option value="">Select grade...</option>
                {GRADES.map(grade => (
                  <option key={grade} value={grade}>
                    {grade} ({PHASES[grade]} Phase)
                  </option>
                ))}
              </select>

              {formData.grade && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Phase:</strong> {PHASES[formData.grade]}<br />
                    <strong>Subjects:</strong> You will be automatically enrolled in all compulsory subjects for {formData.grade}.
                  </p>
                </div>
              )}
            </div>
          )}

          {formData.role === 'teacher' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Subjects You Teach
              </label>
              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-4 space-y-2">
                {availableSubjects.map((subject) => (
                  <label 
                    key={subject.id} 
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedSubjects.includes(subject.id)}
                      onChange={() => toggleSubject(subject.id)}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{subject.name}</p>
                      <p className="text-sm text-slate-500">{subject.phase} • {subject.code}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Selected: {formData.selectedSubjects.length} subjects
              </p>
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
            disabled={formData.role === 'learner' ? !formData.grade : formData.selectedSubjects.length === 0}
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
            ? `You have been enrolled in all subjects for ${formData.grade}.`
            : 'Your teacher account is pending approval.'}
        </p>
        <Button as={Link} to="/login">Sign In</Button>
      </div>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}