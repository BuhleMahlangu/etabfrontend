import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useQuizLock } from '../context/QuizLockContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { HelpCircle, Clock, Play, CheckCircle, XCircle, Trophy, AlertCircle, ChevronRight, Eye, BookOpen } from 'lucide-react';

export function LearnerQuizzes() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
  const { lockQuiz, unlockQuiz, updateTimeRemaining } = useQuizLock();

  useEffect(() => {
    fetchQuizzes();
  }, [subjectId]);

  useEffect(() => {
    let timer;
    if (attempt && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          // Update quiz lock context with remaining time
          updateTimeRemaining(newTime);
          if (newTime <= 0) {
            handleSubmit();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [attempt, timeRemaining, updateTimeRemaining]);

  const fetchQuizzes = async () => {
    try {
      const params = subjectId ? { subjectId } : {};
      const response = await quizAPI.getAll(params);
      if (response.success) {
        setQuizzes(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quiz) => {
    try {
      const response = await quizAPI.startAttempt(quiz.id);
      if (response.success) {
        setActiveQuiz(response.data.quiz);
        setAttempt({
          id: response.data.attemptId,
          ...response.data
        });
        setAnswers(response.data.answers || {});
        setTimeRemaining(response.data.timeRemaining); // Already in seconds from backend
        setCurrentQuestionIndex(0);
        setShowResults(false);
        setResults(null);
        
        // Lock the quiz - prevents navigation
        lockQuiz({
          title: response.data.quiz.title,
          timeRemaining: response.data.timeRemaining
        });
      }
    } catch (error) {
      console.error('Failed to start quiz:', error);
      alert(error.response?.data?.message || 'Failed to start quiz');
    }
  };

  const saveAnswer = async (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    try {
      // Send answer as text for all question types (simplified format)
      await quizAPI.saveAnswer(attempt.id, { 
        questionId, 
        answer: answer || '',
        selectedOptions: answer ? [answer] : [] // For backward compatibility
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Convert answers object to array format expected by backend
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer: answer || '',
        selectedOptions: answer ? [answer] : []
      }));
      
      const response = await quizAPI.submitQuiz(attempt.id, { answers: answersArray });
      if (response.success) {
        setResults(response.data);
        setShowResults(true);
        setAttempt(null);
        setActiveQuiz(null);
        
        // Unlock the quiz - allow navigation again
        unlockQuiz();
        
        fetchQuizzes();
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchFeedback = async (quizId) => {
    setFeedbackLoading(true);
    try {
      // Fetch quiz results/feedback
      const response = await quizAPI.getMyResults();
      if (response.success && response.data.length > 0) {
        // Get the most recent attempt for this quiz
        const attempts = response.data.filter(a => a.quiz_id === quizId || a.quizId === quizId);
        if (attempts.length > 0) {
          setFeedbackData(attempts[0]);
          setShowFeedback(true);
        } else {
          alert('No results found for this quiz');
        }
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      alert('Failed to load feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Quiz Taking Interface - Full screen lock mode
  if (activeQuiz && attempt) {
    const questions = attempt.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        {/* Quiz Header */}
        <Card className="mb-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">{activeQuiz.title}</h2>
              <p className="text-sm text-slate-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <div className="mt-3 h-2 bg-slate-200 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>

        {/* Question Card */}
        <Card className="p-6 mb-4">
          <div className="mb-6">
            <Badge className="mb-2">{currentQuestion.question_type === 'multiple_choice' ? 'Multiple Choice' : currentQuestion.question_type === 'true_false' ? 'True/False' : 'Short Answer'}</Badge>
            <h3 className="text-lg font-medium text-slate-900">{currentQuestion.question_text}</h3>
            <p className="text-sm text-slate-500 mt-1">{currentQuestion.marks} mark(s)</p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.question_type === 'short_answer' ? (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Type your answer here..."
              />
            ) : currentQuestion.question_type === 'true_false' ? (
              // True/False - store and compare the actual text
              ['True', 'False'].map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={answers[currentQuestion.id] === option}
                    onChange={() => saveAnswer(currentQuestion.id, option)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="flex-1">{option}</span>
                </label>
              ))
            ) : (
              // Multiple Choice - store and compare the actual option TEXT
              currentQuestion.options?.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={answers[currentQuestion.id] === option}
                    onChange={() => saveAnswer(currentQuestion.id, option)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="flex-1">{option}</span>
                </label>
              ))
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
                  handleSubmit();
                }
              }}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-6 flex flex-wrap gap-2">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                idx === currentQuestionIndex
                  ? 'bg-blue-600 text-white'
                  : answers[q.id]
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-300'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Results View
  if (showResults && results) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${results.passed ? 'bg-green-100' : 'bg-red-100'}`}>
            {results.passed ? (
              <Trophy className="w-10 h-10 text-green-600" />
            ) : (
              <AlertCircle className="w-10 h-10 text-red-600" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {results.passed ? 'Congratulations!' : 'Quiz Completed'}
          </h2>
          <p className="text-slate-500 mb-6">
            {results.passed 
              ? 'You passed the quiz!' 
              : 'Keep practicing to improve your score.'}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{results.percentage}%</p>
              <p className="text-sm text-slate-500">Score</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{results.score}</p>
              <p className="text-sm text-slate-500">Marks</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{results.totalMarks}</p>
              <p className="text-sm text-slate-500">Total</p>
            </div>
          </div>

          <Badge variant={results.passed ? 'success' : 'error'} className="mb-6 text-lg px-4 py-1">
            {results.passed ? 'PASSED' : 'FAILED'}
          </Badge>

          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setShowResults(false)}>
              Back to Quizzes
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Feedback/Review View
  if (showFeedback && feedbackData) {
    const answers = feedbackData.answers || [];
    const hasCorrectAnswers = answers.some(a => a.correct_answer !== null);
    
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card className="mb-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">{feedbackData.quiz_title}</h2>
              <p className="text-sm text-slate-500">Quiz Feedback</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={feedbackData.passed ? 'success' : 'error'}>
                {feedbackData.passed ? 'PASSED' : 'FAILED'}
              </Badge>
              <span className="text-sm font-medium">
                {feedbackData.percentage_score?.toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        {!hasCorrectAnswers ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">Feedback Not Available</h3>
            <p className="text-slate-500">The teacher has not made the correct answers available for this quiz.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {answers.map((answer, idx) => (
              <Card key={answer.id} className={`p-4 border-l-4 ${answer.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${answer.is_correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {answer.is_correct ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 mb-2">{idx + 1}. {answer.question_text}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Your answer:</span>
                        <span className={answer.is_correct ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {answer.answer_text || answer.selected_options || 'Not answered'}
                        </span>
                      </div>
                      
                      {!answer.is_correct && answer.correct_answer && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Correct answer:</span>
                          <span className="text-green-600 font-medium">
                            {Array.isArray(answer.correct_answer) 
                              ? answer.correct_answer.join(', ') 
                              : answer.correct_answer}
                          </span>
                        </div>
                      )}
                      
                      {answer.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg text-blue-700">
                          <span className="font-medium">Explanation:</span> {answer.explanation}
                        </div>
                      )}
                      
                      <div className="text-slate-400 text-xs">
                        Score: {answer.points_earned} / {answer.points_possible || answer.max_points} points
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setShowFeedback(false)}>
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  // Quizzes List
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Quizzes</h1>
        <p className="text-slate-500">Take quizzes to test your knowledge</p>
      </div>

      {quizzes.length === 0 ? (
        <Card className="p-8 text-center">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No Quizzes Available</h3>
          <p className="text-slate-500">Check back later for new quizzes</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="info">{quiz.subject_name}</Badge>
                {quiz.myAttempts?.length > 0 && (
                  quiz.myAttempts[0].passed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )
                )}
              </div>

              <h3 className="font-semibold text-slate-900 mb-1">{quiz.title}</h3>
              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{quiz.description}</p>

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  {quiz.question_count} questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {quiz.time_limit_minutes} min
                </span>
              </div>

              {quiz.myAttempts?.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Best Score:</span>
                    <span className="font-semibold">
                      {Math.max(...quiz.myAttempts.map(a => a.percentage_score || a.percentage || 0)).toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Feedback Button */}
                  <Button 
                    onClick={() => fetchFeedback(quiz.id)} 
                    variant="outline" 
                    className="w-full"
                    disabled={feedbackLoading}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {feedbackLoading ? 'Loading...' : 'View Feedback'}
                  </Button>
                  
                  {quiz.myAttempts.length < quiz.max_attempts && (
                    <Button 
                      onClick={() => startQuiz(quiz)} 
                      variant="outline" 
                      className="w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Retake ({quiz.max_attempts - quiz.myAttempts.length} left)
                    </Button>
                  )}
                </div>
              ) : (
                <Button onClick={() => startQuiz(quiz)} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Start Quiz
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default LearnerQuizzes;
