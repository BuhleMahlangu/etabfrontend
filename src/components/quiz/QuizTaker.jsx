import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import { useToast } from '../common/Toast';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Timer
} from 'lucide-react';

export const QuizTaker = ({ quizId, onComplete }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const submitInProgress = useRef(false);

  // Start quiz attempt
  useEffect(() => {
    const startQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizAPI.startAttempt(quizId);
        
        if (response.success) {
          setQuiz(response.data.quiz);
          setAttemptId(response.data.attemptId);
          setQuestions(response.data.questions);
          setTimeRemaining(response.data.timeRemaining);
        }
      } catch (err) {
        console.error('Failed to start quiz:', err);
        addToast(err.response?.data?.message || 'Failed to start quiz', 'error');
        navigate('/learner/quizzes');
      } finally {
        setLoading(false);
      }
    };

    startQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || !attemptId || submitInProgress.current) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit
          clearInterval(timer);
          if (!submitInProgress.current) {
            submitInProgress.current = true;
            handleAutoSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, attemptId]);

  // Auto-submit function
  const handleAutoSubmit = async () => {
    if (submitInProgress.current) return;
    submitInProgress.current = true;
    
    setSubmitting(true);
    try {
      const response = await quizAPI.submitQuiz(attemptId, {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer: typeof answer === 'string' ? answer : null,
          selectedOptions: Array.isArray(answer) ? answer : answer ? [answer] : []
        }))
      });

      if (response.success) {
        addToast('Time expired! Quiz auto-submitted.', 'success');
        if (onComplete) {
          onComplete(response.data);
        } else {
          navigate('/progress');
        }
      }
    } catch (err) {
      console.error('Failed to auto-submit quiz:', err);
      addToast('Failed to submit quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (timeRemaining < 60) return 'text-red-600 animate-pulse';
    if (timeRemaining < 300) return 'text-orange-600';
    return 'text-blue-600';
  };

  // Handle answer selection
  const handleAnswerChange = async (questionId, answer) => {
    // Update local state first
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    // Auto-save answer to server
    try {
      const question = questions.find(q => q.id === questionId);
      const selectedOptions = question.question_type === 'multiple_choice' || question.question_type === 'true_false'
        ? (Array.isArray(answer) ? answer : answer ? [answer.toString()] : [])
        : [];
      
      await quizAPI.submitAnswer(attemptId, {
        questionId,
        answer: question.question_type === 'short_answer' || question.question_type === 'fill_blank' 
          ? answer 
          : null,
        selectedOptions: selectedOptions
      });
    } catch (err) {
      console.error('Failed to save answer:', err);
      // Don't show error to user, just log it
    }
  };

  // Navigate to question
  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Submit quiz
  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitInProgress.current) return;
    
    if (!isAutoSubmit && !showConfirmSubmit) {
      setShowConfirmSubmit(true);
      return;
    }

    submitInProgress.current = true;
    setSubmitting(true);
    
    try {
      const response = await quizAPI.submitQuiz(attemptId, {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer: typeof answer === 'string' ? answer : null,
          selectedOptions: Array.isArray(answer) ? answer : answer ? [answer] : []
        }))
      });

      if (response.success) {
        addToast(
          isAutoSubmit 
            ? 'Time expired! Quiz auto-submitted.' 
            : 'Quiz submitted successfully!', 
          'success'
        );
        
        if (onComplete) {
          onComplete(response.data);
        } else {
          navigate('/progress');
        }
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      addToast('Failed to submit quiz', 'error');
    } finally {
      setSubmitting(false);
      submitInProgress.current = false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {quiz?.title}
              </h1>
              <p className="text-sm text-slate-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            
            {/* Timer */}
            <div className={`flex items-center gap-2 text-2xl font-mono font-bold ${getTimerColor()}`}>
              <Timer className="w-6 h-6" />
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentQuestion && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            {/* Question */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
                {currentQuestion.question_type === 'multiple_choice' && 'Multiple Choice'}
                {currentQuestion.question_type === 'true_false' && 'True/False'}
                {currentQuestion.question_type === 'short_answer' && 'Short Answer'}
                {currentQuestion.question_type === 'fill_blank' && 'Fill in the Blank'}
                • {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </span>
              
              <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">
                {currentQuestion.question_text}
              </h2>
            </div>

            {/* Answer options */}
            <div className="space-y-3">
              {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[currentQuestion.id]?.includes(idx.toString())
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={`question-${currentQuestion.id}`}
                      value={idx}
                      checked={answers[currentQuestion.id]?.includes(idx.toString()) || false}
                      onChange={(e) => {
                        const currentAnswers = answers[currentQuestion.id] || [];
                        const newAnswers = e.target.checked
                          ? [...currentAnswers, idx.toString()]
                          : currentAnswers.filter(a => a !== idx.toString());
                        handleAnswerChange(currentQuestion.id, newAnswers);
                      }}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-slate-700 dark:text-slate-300">{option}</span>
                  </label>
                ))
              )}

              {currentQuestion.question_type === 'true_false' && (
                ['True', 'False'].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[currentQuestion.id] === option.toLowerCase()
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.toLowerCase()}
                      checked={answers[currentQuestion.id] === option.toLowerCase()}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-slate-700 dark:text-slate-300">{option}</span>
                  </label>
                ))
              )}

              {(currentQuestion.question_type === 'short_answer' || currentQuestion.question_type === 'fill_blank') && (
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100"
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="flex gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToQuestion(idx)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      idx === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[questions[idx].id]
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Quiz
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Summary card */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500">
                <span className="font-medium text-slate-900">{answeredCount}</span> of{' '}
                <span className="font-medium text-slate-900">{questions.length}</span> answered
              </div>
              {answeredCount < questions.length && (
                <span className="text-sm text-orange-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {questions.length - answeredCount} unanswered
                </span>
              )}
            </div>
            
            <button
              onClick={() => handleSubmit()}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      </main>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Submit Quiz?
            </h3>
            
            {answeredCount < questions.length ? (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                <p className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  You have {questions.length - answeredCount} unanswered question(s).
                </p>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <CheckCircle className="w-5 h-5 inline text-green-600 mr-2" />
                You have answered all questions.
              </p>
            )}
            
            <p className="text-slate-500 mb-6">
              Are you sure you want to submit? You cannot change your answers after submission.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Continue Quiz
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
