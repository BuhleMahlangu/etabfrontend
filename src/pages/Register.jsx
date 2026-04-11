import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';
import { Badge } from '../components/common/Badge';
import { 
  Check, X, Users, BookOpen, Plus, ChevronDown, ChevronUp, 
  GraduationCap, School, ArrowRight, Sparkles, Award, 
  UserCircle, Lock, Mail, Briefcase, ChevronLeft, CheckCircle2,
  BookOpenCheck, UserPlus, Shield
} from 'lucide-react';
import { SchoolCodeInput } from '../components/SchoolCodeInput';

import { API_URL } from '../config/api';

// Animated floating shapes component
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full mix-blend-overlay animate-float"
          style={{
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
            background: `rgba(255,255,255,${0.05 + i * 0.02})`,
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${6 + i}s`,
          }}
        />
      ))}
    </div>
  );
}

// Feature card component
function FeatureCard({ icon: Icon, title, delay }) {
  return (
    <div 
      className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-2 bg-white/20 rounded-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-white/90 text-sm font-medium">{title}</span>
    </div>
  );
}

// Progress step indicator
function StepIndicator({ currentStep, totalSteps, labels }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        
        return (
          <React.Fragment key={stepNum}>
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
              </div>
              <span className={`text-xs mt-2 font-medium transition-colors ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
              }`}>
                {labels[idx]}
              </span>
            </div>
            {stepNum < totalSteps && (
              <div className={`w-16 h-1 mx-2 rounded-full transition-colors ${
                isCompleted ? 'bg-green-500' : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolCode: '',
    schoolId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'learner',
    grade: '',
    employeeNumber: '',
    qualification: '',
    specialization: '',
    yearsOfExperience: '',
    bio: '',
    assignments: []
  });
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [gradeDetails, setGradeDetails] = useState(null);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [selectedGradeForSubjects, setSelectedGradeForSubjects] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Add animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
        50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
      }
      @keyframes slide-in-right {
        from { opacity: 0; transform: translateX(30px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .animate-float { animation: float 6s ease-in-out infinite; }
      .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
      .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; opacity: 0; }
      .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
      .animate-slide-in { animation: slide-in-right 0.5s ease-out forwards; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    fetchAvailableGrades();
  }, []);

  useEffect(() => {
    if (formData.role === 'learner' && formData.grade) {
      const grade = availableGrades.find(g => g.grade === formData.grade);
      setGradeDetails(grade || null);
    }
  }, [formData.grade, formData.role, availableGrades]);

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

  const fetchSubjectsForGrade = async (gradeId) => {
    try {
      const schoolCode = selectedSchool?.code || formData.schoolCode;
      const response = await fetch(`${API_URL}/subjects/grade-subjects/${gradeId}?schoolCode=${schoolCode}`);
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

  const extractGradeNumber = (gradeString) => {
    if (!gradeString) return '';
    const match = gradeString.toString().match(/\d+/);
    return match ? match[0] : gradeString;
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

    const existingIndex = formData.assignments.findIndex(a => a.gradeId === selectedGradeForSubjects.id);
    
    if (existingIndex >= 0) {
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
      const gradeNumber = formData.role === 'learner' ? extractGradeNumber(formData.grade) : null;
      
      const requestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        grade: gradeNumber,
        schoolId: formData.schoolId
      };

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

      const registerResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'Registration failed');
      }

      if (formData.role === 'teacher' && registerData.pending) {
        setStep(4);
        addToast('Registration submitted for admin approval!', 'success');
        return;
      }

      if (formData.role === 'learner') {
        if (!registerData.token) {
          throw new Error('Registration successful but no token received. Please login manually.');
        }

        localStorage.setItem('token', registerData.token);

        if (formData.grade) {
          const selectGradeResponse = await fetch(`${API_URL}/subjects/select-grade`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${registerData.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ grade: formData.grade })
          });

          const gradeData = await selectGradeResponse.json();
          
          if (selectGradeResponse.ok) {
            addToast(`Welcome! You are now enrolled in ${gradeData.autoEnrolled} subjects.`, 'success');
          }
        }

        setStep(4);
      }

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Left side branding component
  const LeftBranding = ({ title, subtitle, features }) => (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 animate-gradient" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      <FloatingShapes />
      
      <div className="relative z-10 flex flex-col justify-center p-12 text-white w-full">
        <div className="max-w-md mx-auto">
          <div className="relative mb-8 animate-fade-in-up">
            <div className="absolute inset-0 bg-white/30 blur-3xl rounded-full animate-pulse" />
            <img 
              src="/E-tab logo.png" 
              alt="E-tab Logo" 
              className="relative h-28 w-auto mx-auto drop-shadow-2xl filter brightness-110"
            />
          </div>
          
          <h1 className="text-5xl font-bold mb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {title}
          </h1>
          
          <p className="text-xl text-blue-100 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {subtitle}
          </p>
          
          <div className="space-y-3">
            {features.map((feature, idx) => (
              <FeatureCard 
                key={idx}
                icon={feature.icon} 
                title={feature.title} 
                delay={300 + idx * 100} 
              />
            ))}
          </div>
          
          <div className="mt-10 pt-8 border-t border-white/20 grid grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="text-center">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-blue-200">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-blue-200">Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100+</div>
              <div className="text-sm text-blue-200">Schools</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 1: School Selection
  if (step === 1) {
    return (
      <div className="min-h-screen flex">
        <LeftBranding 
          title="Join E-tab"
          subtitle="Start your learning journey today. Connect with your school and access world-class education."
          features={[
            { icon: School, title: 'Connect with Your School' },
            { icon: BookOpen, title: 'Access Learning Materials' },
            { icon: Users, title: 'Learn with Peers' }
          ]}
        />

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-slate-50">
          <div className="w-full max-w-md animate-slide-in">
            <div className="text-center mb-8">
              <img src="/E-tab logo.png" alt="E-tab" className="h-16 w-auto mx-auto mb-4 lg:hidden" />
              <h2 className="text-3xl font-bold text-slate-900">Find Your School</h2>
              <p className="text-slate-500 mt-2">Enter your school code to get started</p>
            </div>

            <StepIndicator 
              currentStep={1} 
              totalSteps={4} 
              labels={['School', 'Account', 'Details', 'Done']} 
            />

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="space-y-6">
                <SchoolCodeInput 
                  onSchoolFound={(school) => {
                    setSelectedSchool(school);
                    setFormData({ 
                      ...formData, 
                      schoolCode: school.code,
                      schoolId: school.id 
                    });
                  }}
                  onError={() => {
                    setSelectedSchool(null);
                    setFormData({ ...formData, schoolCode: '', schoolId: '' });
                  }}
                />

                {selectedSchool && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200 animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">{selectedSchool.name}</p>
                        <p className="text-sm text-green-600">School verified</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => selectedSchool && setStep(2)} 
                  className="w-full py-3 text-lg"
                  disabled={!selectedSchool}
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <div className="text-center space-y-3">
                  <p className="text-sm text-slate-500">
                    Don't know your school code?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                      Ask your teacher
                    </Link>
                  </p>
                  <p className="text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Basic Info
  if (step === 2) {
    return (
      <div className="min-h-screen flex">
        <LeftBranding 
          title="Create Account"
          subtitle={`Registering for ${selectedSchool?.name}`}
          features={[
            { icon: UserPlus, title: 'Create Your Profile' },
            { icon: Shield, title: 'Secure Account' },
            { icon: Sparkles, title: 'Start Learning' }
          ]}
        />

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-slate-50">
          <div className="w-full max-w-md animate-slide-in">
            <div className="text-center mb-8">
              <img src="/E-tab logo.png" alt="E-tab" className="h-16 w-auto mx-auto mb-4 lg:hidden" />
              <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
              <p className="text-sm text-slate-500 mt-1">{selectedSchool?.name}</p>
            </div>

            <StepIndicator 
              currentStep={2} 
              totalSteps={4} 
              labels={['School', 'Account', 'Details', 'Done']} 
            />

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                    <div className="relative">
                      <UserCircle className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 sm:pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                    <div className="relative">
                      <UserCircle className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 sm:pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@school.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-4 sm:pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 sm:pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm</label>
                    <div className="relative">
                      <Lock className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 sm:pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">I am a</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'learner', label: 'Learner', icon: GraduationCap },
                      { id: 'teacher', label: 'Teacher', icon: Briefcase }
                    ].map((role) => {
                      const Icon = role.icon;
                      const isSelected = formData.role === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setFormData({ 
                            ...formData, 
                            role: role.id, 
                            grade: '', 
                            assignments: []
                          })}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 text-blue-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="font-medium">{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)} 
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    className="flex-1"
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Role-specific details
  if (step === 3) {
    return (
      <div className="min-h-screen flex">
        <LeftBranding 
          title={formData.role === 'learner' ? 'Select Grade' : 'Teacher Profile'}
          subtitle={formData.role === 'learner' 
            ? 'Choose your current grade level' 
            : 'Tell us about your teaching experience'}
          features={[
            { icon: Award, title: 'Quality Education' },
            { icon: BookOpenCheck, title: 'Expert Teachers' },
            { icon: Users, title: 'Collaborative Learning' }
          ]}
        />

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-slate-50">
          <div className="w-full max-w-lg animate-slide-in">
            <div className="text-center mb-8">
              <img src="/E-tab logo.png" alt="E-tab" className="h-16 w-auto mx-auto mb-4 lg:hidden" />
              <h2 className="text-3xl font-bold text-slate-900">
                {formData.role === 'learner' ? 'Select Your Grade' : 'Teacher Registration'}
              </h2>
            </div>

            <StepIndicator 
              currentStep={3} 
              totalSteps={4} 
              labels={['School', 'Account', 'Details', 'Done']} 
            />

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              {/* LEARNER: Grade Selection */}
              {formData.role === 'learner' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Current Grade</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availableGrades.map((grade) => {
                        const isSelected = formData.grade === grade.grade;
                        return (
                          <button
                            key={grade.grade}
                            type="button"
                            onClick={() => setFormData({ ...formData, grade: grade.grade })}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <div className="font-medium text-sm">{grade.grade}</div>
                            <div className={`text-xs ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>
                              {grade.phase}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {gradeDetails && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 animate-fade-in-up">
                      <h4 className="font-semibold text-blue-900 mb-2">Grade Information</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-blue-600">Phase:</span>
                          <span className="ml-2 text-blue-900">{gradeDetails.phase}</span>
                        </div>
                        <div>
                          <span className="text-blue-600">Subjects:</span>
                          <span className="ml-2 text-blue-900">{gradeDetails.total_modules}</span>
                        </div>
                        <div>
                          <span className="text-blue-600">Compulsory:</span>
                          <span className="ml-2 text-blue-900">{gradeDetails.compulsory_count}</span>
                        </div>
                        {gradeDetails.optional_count > 0 && (
                          <div>
                            <span className="text-blue-600">Optional:</span>
                            <span className="ml-2 text-blue-900">{gradeDetails.optional_count}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TEACHER: Teacher-specific fields */}
              {formData.role === 'teacher' && (
                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee Number</label>
                      <input
                        type="text"
                        placeholder="TCH001"
                        value={formData.employeeNumber}
                        onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Years Experience</label>
                      <input
                        type="number"
                        placeholder="5"
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Qualification</label>
                    <input
                      type="text"
                      placeholder="Bachelor of Education"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Specialization</label>
                    <input
                      type="text"
                      placeholder="Mathematics, Science"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>

                  {/* Subject Assignments */}
                  <div className="border-t border-slate-200 pt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Subject Assignments</label>
                    
                    {formData.assignments.map((assignment, idx) => (
                      <div key={assignment.gradeId} className="mb-3 p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-700">{assignment.gradeName}</span>
                          <button
                            onClick={() => removeAssignment(assignment.gradeId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {assignment.subjectIds.map(subjectId => {
                            const subject = getSubjectDetails(subjectId);
                            return (
                              <Badge key={subjectId} variant="info" className="text-xs">
                                {subject.name || subject.subject_name || 'Subject'}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {!showSubjectSelector ? (
                      <button
                        onClick={() => {
                          setShowSubjectSelector(true);
                          if (availableGrades.length > 0) {
                            fetchSubjectsForGrade(availableGrades[0].id);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Subject Assignment
                      </button>
                    ) : (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Select Grade</label>
                          <select
                            onChange={(e) => fetchSubjectsForGrade(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200"
                            defaultValue=""
                          >
                            <option value="" disabled>Choose grade...</option>
                            {availableGrades.map(grade => (
                              <option key={grade.id} value={grade.id}>{grade.grade}</option>
                            ))}
                          </select>
                        </div>

                        {availableSubjects.length > 0 && (
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Select Subjects</label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                              {availableSubjects.map(subject => (
                                <label
                                  key={subject.id}
                                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                    selectedSubjects.includes(subject.id)
                                      ? 'bg-blue-100 border border-blue-300'
                                      : 'bg-white border border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedSubjects.includes(subject.id)}
                                    onChange={() => toggleSubject(subject.id)}
                                    className="rounded text-blue-600"
                                  />
                                  <span className="text-sm">{subject.name || subject.subject_name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={addAssignment}
                            disabled={selectedSubjects.length === 0}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Add Assignment
                          </button>
                          <button
                            onClick={() => {
                              setShowSubjectSelector(false);
                              setSelectedSubjects([]);
                            }}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                    <textarea
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)} 
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="flex-1"
                  isLoading={isLoading}
                  disabled={formData.role === 'learner' ? !formData.grade : false}
                >
                  {isLoading ? 'Creating Account...' : 'Complete Registration'}
                  {!isLoading && <Check className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Success
  if (step === 4) {
    return (
      <div className="min-h-screen flex">
        <LeftBranding 
          title="Welcome!"
          subtitle="Your account has been created successfully."
          features={[
            { icon: CheckCircle2, title: 'Account Created' },
            { icon: BookOpen, title: 'Start Learning' },
            { icon: Users, title: 'Join Community' }
          ]}
        />

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-slate-50">
          <div className="w-full max-w-md text-center animate-slide-in">
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                {formData.role === 'teacher' ? 'Registration Submitted!' : 'Welcome to E-tab!'}
              </h2>
              
              <p className="text-slate-500 mb-8">
                {formData.role === 'teacher' 
                  ? 'Your account is pending admin approval. You will be notified once approved.'
                  : `Your account has been created successfully. You are now enrolled in ${formData.grade}.`
                }
              </p>

              <div className="space-y-3">
                {formData.role === 'learner' && (
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-3"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
