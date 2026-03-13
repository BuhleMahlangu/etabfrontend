import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { quizAPI, teacherAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { HelpCircle, Plus, Trash2, Edit2, Play, BarChart2, Clock, CheckCircle, X } from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'short_answer', label: 'Short Answer' }
];

export function TeacherQuizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    subjectId: '',
    title: '',
    description: '',
    timeLimit: 30,
    maxAttempts: 1,
    passingScore: 50,
    shuffleQuestions: false,
    showCorrectAnswers: true,
    applicableGrades: [],
    questions: []
  });

  // Current question being added
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    type: 'multiple_choice',
    options: ['', ''],
    correctAnswer: '',
    marks: 1,
    explanation: ''
  });

  useEffect(() => {
    fetchQuizzes();
    fetchSubjects();
    fetchGrades();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getAll();
      if (response.success) {
        setQuizzes(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await teacherAPI.getMyAssignments();
      if (response.success) {
        // Flatten subjects from all grades
        const allSubjects = [];
        response.grades?.forEach(grade => {
          grade.subjects?.forEach(subject => {
            allSubjects.push({
              id: subject.subjectId,
              name: subject.name,
              code: subject.code,
              department: subject.department,
              gradeName: grade.gradeName,
              gradeId: grade.gradeId
            });
          });
        });
        setSubjects(allSubjects);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/subjects/available-grades`);
      const data = await response.json();
      if (data.success) {
        setGrades(data.grades || []);
      }
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    }
  };

  const fetchQuizStats = async (quizId) => {
    try {
      const response = await quizAPI.getStatistics(quizId);
      if (response.success) {
        setStats(response.data);
        setShowStatsModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (quizForm.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    try {
      const response = await quizAPI.create({
        subjectId: quizForm.subjectId,
        title: quizForm.title,
        description: quizForm.description,
        timeLimit: quizForm.timeLimit,
        maxAttempts: quizForm.maxAttempts,
        passingScore: quizForm.passingScore,
        shuffleQuestions: quizForm.shuffleQuestions,
        showCorrectAnswers: quizForm.showCorrectAnswers,
        applicableGrades: quizForm.applicableGrades,
        questions: quizForm.questions
      });

      if (response.success) {
        setShowCreateModal(false);
        resetForm();
        fetchQuizzes();
      }
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert('Failed to create quiz');
    }
  };

  const handlePublish = async (quizId) => {
    try {
      await quizAPI.update(quizId, { isPublished: true, status: 'published' });
      fetchQuizzes();
    } catch (error) {
      console.error('Failed to publish quiz:', error);
    }
  };

  const handleDelete = async (quizId) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await quizAPI.delete(quizId);
      fetchQuizzes();
    } catch (error) {
      console.error('Failed to delete quiz:', error);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.text.trim()) {
      alert('Please enter a question');
      return;
    }
    if (currentQuestion.type === 'multiple_choice' && currentQuestion.options.some(o => !o.trim())) {
      alert('Please fill in all options');
      return;
    }
    if (!currentQuestion.correctAnswer) {
      alert('Please select the correct answer');
      return;
    }

    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, { ...currentQuestion }]
    });

    setCurrentQuestion({
      text: '',
      type: 'multiple_choice',
      options: ['', ''],
      correctAnswer: '',
      marks: 1,
      explanation: ''
    });
  };

  const removeQuestion = (index) => {
    setQuizForm({
      ...quizForm,
      questions: quizForm.questions.filter((_, i) => i !== index)
    });
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, '']
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) return;
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const resetForm = () => {
    setQuizForm({
      subjectId: '',
      title: '',
      description: '',
      timeLimit: 30,
      maxAttempts: 1,
      passingScore: 50,
      shuffleQuestions: false,
      showCorrectAnswers: true,
      applicableGrades: [],
      questions: []
    });
    setCurrentQuestion({
      text: '',
      type: 'multiple_choice',
      options: ['', ''],
      correctAnswer: '',
      marks: 1,
      explanation: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
          <p className="text-slate-500">Create and manage quizzes for your students</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Quiz
        </Button>
      </div>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <Card className="p-8 text-center">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No Quizzes Yet</h3>
          <p className="text-slate-500 mb-4">Create your first quiz to assess your students</p>
          <Button onClick={() => setShowCreateModal(true)} variant="outline">Create Quiz</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={quiz.status === 'published' ? 'success' : 'warning'}>
                  {quiz.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => fetchQuizStats(quiz.id)}
                    title="View Statistics"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(quiz.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-900 mb-1">{quiz.title}</h3>
              <p className="text-sm text-slate-500 mb-3">{quiz.subject_name}</p>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  {quiz.question_count} questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {quiz.time_limit_minutes} min
                </span>
                <span>{quiz.total_marks} marks</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {quiz.attempt_count} attempt(s)
                </span>
                {quiz.status !== 'published' && (
                  <Button 
                    size="sm" 
                    onClick={() => handlePublish(quiz.id)}
                    className="flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Publish
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Quiz"
        size="lg"
      >
        <form onSubmit={handleCreateQuiz} className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <select
                value={quizForm.subjectId}
                onChange={(e) => {
                  const selectedSubject = subjects.find(s => s.id === e.target.value);
                  setQuizForm({ 
                    ...quizForm, 
                    subjectId: e.target.value,
                    // Auto-select the grade of the selected subject
                    applicableGrades: selectedSubject ? [selectedSubject.gradeName] : []
                  });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">{subjects.length === 0 ? 'Loading subjects...' : 'Select a subject'}</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code}) - {subject.gradeName}
                  </option>
                ))}
              </select>
              {subjects.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No subjects found. You may not have any subject assignments.</p>
              )}
            </div>

            <Input
              label="Quiz Title"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              placeholder="e.g., Chapter 1 Assessment"
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={quizForm.description}
                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the quiz"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Time Limit (min)"
                type="number"
                min={1}
                value={quizForm.timeLimit}
                onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
              />
              <Input
                label="Max Attempts"
                type="number"
                min={1}
                value={quizForm.maxAttempts}
                onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: parseInt(e.target.value) })}
              />
              <Input
                label="Passing Score (%)"
                type="number"
                min={0}
                max={100}
                value={quizForm.passingScore}
                onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={quizForm.shuffleQuestions}
                  onChange={(e) => setQuizForm({ ...quizForm, shuffleQuestions: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-slate-700">Shuffle questions</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={quizForm.showCorrectAnswers}
                  onChange={(e) => setQuizForm({ ...quizForm, showCorrectAnswers: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-slate-700">Show correct answers after submission</span>
              </label>
            </div>

            {/* Grade Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Applicable Grades</label>
              <div className="flex flex-wrap gap-2">
                {grades.map((grade) => (
                  <label key={grade.id} className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={quizForm.applicableGrades.includes(grade.grade)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setQuizForm({
                            ...quizForm,
                            applicableGrades: [...quizForm.applicableGrades, grade.grade]
                          });
                        } else {
                          setQuizForm({
                            ...quizForm,
                            applicableGrades: quizForm.applicableGrades.filter(g => g !== grade.grade)
                          });
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{grade.grade}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">Leave empty to make quiz available to all grades</p>
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-slate-900">Questions ({quizForm.questions.length})</h3>
            
            {/* Added Questions */}
            {quizForm.questions.length > 0 && (
              <div className="space-y-2">
                {quizForm.questions.map((q, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-lg flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{index + 1}. {q.text}</p>
                      <p className="text-xs text-slate-500">{q.type} • {q.marks} mark(s)</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeQuestion(index)}
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Question */}
            <Card className="p-4 border-dashed">
              <h4 className="font-medium text-sm mb-3">Add Question</h4>
              
              <div className="space-y-3">
                <div>
                  <textarea
                    value={currentQuestion.text}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="Enter your question"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={currentQuestion.type}
                    onChange={(e) => setCurrentQuestion({ 
                      ...currentQuestion, 
                      type: e.target.value,
                      options: e.target.value === 'true_false' ? ['True', 'False'] : ['', ''],
                      correctAnswer: ''
                    })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min={1}
                    value={currentQuestion.marks}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 1 })}
                    placeholder="Marks"
                  />
                </div>

                {currentQuestion.type !== 'short_answer' && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-600">Options</p>
                    {currentQuestion.options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === option}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: option })}
                          className="text-blue-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                          placeholder={`Option ${idx + 1}`}
                        />
                        {currentQuestion.options.length > 2 && (
                          <Button variant="ghost" size="sm" onClick={() => removeOption(idx)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Option
                    </Button>
                  </div>
                )}

                {currentQuestion.type === 'short_answer' && (
                  <div>
                    <input
                      type="text"
                      value={currentQuestion.correctAnswer}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="Correct answer"
                    />
                  </div>
                )}

                <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </Card>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={quizForm.questions.length === 0}>
              Create Quiz
            </Button>
          </div>
        </form>
      </Modal>

      {/* Statistics Modal */}
      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title="Quiz Statistics"
      >
        {stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.statistics.total_attempts}</p>
                <p className="text-sm text-slate-500">Total Attempts</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{stats.statistics.passRate}%</p>
                <p className="text-sm text-slate-500">Pass Rate</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{parseFloat(stats.statistics.average_score).toFixed(1)}%</p>
                <p className="text-sm text-slate-500">Average Score</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">{parseFloat(stats.statistics.highest_score).toFixed(1)}%</p>
                <p className="text-sm text-slate-500">Highest Score</p>
              </Card>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-3">Recent Attempts</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {stats.recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{attempt.first_name} {attempt.last_name}</p>
                      <p className="text-xs text-slate-500">{new Date(attempt.completed_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={attempt.passed ? 'success' : 'error'}>
                        {attempt.percentage}%
                      </Badge>
                      <p className="text-xs text-slate-500">{attempt.score}/{attempt.total_marks}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default TeacherQuizzes;
