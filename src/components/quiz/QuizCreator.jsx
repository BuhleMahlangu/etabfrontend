import { useState } from 'react';
import { quizAPI } from '../../services/api';
import { useToast } from '../common/Toast';
import { Plus, Trash2, CheckCircle, Clock, HelpCircle } from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'fill_blank', label: 'Fill in the Blank' }
];

export const QuizCreator = ({ subjectId, onSuccess }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 50,
    maxAttempts: 1,
    shuffleQuestions: false,
    showCorrectAnswers: true,
    questions: []
  });

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: Date.now(),
        text: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        correctAnswers: [],
        points: 1,
        explanation: ''
      }]
    }));
  };

  const removeQuestion = (index) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index, field, value) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const addOption = (questionIndex) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      questions[questionIndex].options.push('');
      return { ...prev, questions };
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      questions[questionIndex].options = questions[questionIndex].options.filter((_, i) => i !== optionIndex);
      return { ...prev, questions };
    });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      questions[questionIndex].options[optionIndex] = value;
      return { ...prev, questions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (quiz.questions.length === 0) {
      addToast('Please add at least one question', 'error');
      return;
    }

    // Validate questions
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.text.trim()) {
        addToast(`Question ${i + 1} is missing text`, 'error');
        return;
      }
      
      if ((q.type === 'multiple_choice' || q.type === 'true_false') && !q.correctAnswer) {
        addToast(`Question ${i + 1} needs a correct answer selected`, 'error');
        return;
      }
      
      if ((q.type === 'short_answer' || q.type === 'fill_blank') && !q.correctAnswer) {
        addToast(`Question ${i + 1} needs a correct answer`, 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await quizAPI.create({
        subjectId,
        title: quiz.title,
        description: quiz.description,
        timeLimit: parseInt(quiz.timeLimit),
        passingScore: parseInt(quiz.passingScore),
        maxAttempts: parseInt(quiz.maxAttempts),
        shuffleQuestions: quiz.shuffleQuestions,
        showCorrectAnswers: quiz.showCorrectAnswers,
        questions: quiz.questions.map(q => ({
          text: q.text,
          type: q.type,
          options: q.type === 'multiple_choice' ? q.options.filter(o => o.trim()) : 
                   q.type === 'true_false' ? ['True', 'False'] : [],
          correctAnswer: q.correctAnswer,
          correctAnswers: q.correctAnswers,
          points: parseInt(q.points) || 1,
          explanation: q.explanation
        }))
      });

      if (response.success) {
        addToast('Quiz created successfully!', 'success');
        onSuccess?.();
      }
    } catch (err) {
      console.error('Failed to create quiz:', err);
      addToast('Failed to create quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quiz Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Quiz Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Quiz Title *
            </label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Time Limit (minutes) *
            </label>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <input
                type="number"
                min="1"
                max="180"
                value={quiz.timeLimit}
                onChange={(e) => setQuiz(prev => ({ ...prev, timeLimit: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Passing Score (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={quiz.passingScore}
              onChange={(e) => setQuiz(prev => ({ ...prev, passingScore: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Max Attempts
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={quiz.maxAttempts}
              onChange={(e) => setQuiz(prev => ({ ...prev, maxAttempts: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            value={quiz.description}
            onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
            rows="2"
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-6 mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={quiz.shuffleQuestions}
              onChange={(e) => setQuiz(prev => ({ ...prev, shuffleQuestions: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Shuffle Questions</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={quiz.showCorrectAnswers}
              onChange={(e) => setQuiz(prev => ({ ...prev, showCorrectAnswers: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Show Correct Answers After</span>
          </label>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Questions ({quiz.questions.length})
          </h2>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {quiz.questions.map((question, qIndex) => (
          <div key={question.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                {/* Question Header */}
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-medium">
                    {qIndex + 1}
                  </span>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                    className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  >
                    {QUESTION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) => updateQuestion(qIndex, 'points', e.target.value)}
                    className="w-20 px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    placeholder="Points"
                  />
                </div>

                {/* Question Text */}
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                  placeholder="Enter question text..."
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                {/* Options for Multiple Choice */}
                {question.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Options (select correct answer):</p>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctAnswer === option}
                          onChange={() => updateQuestion(qIndex, 'correctAnswer', option)}
                          className="w-4 h-4 text-green-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const oldOption = question.options[oIndex];
                            updateOption(qIndex, oIndex, e.target.value);
                            // Update correctAnswer if it was the old option text
                            if (question.correctAnswer === oldOption) {
                              updateQuestion(qIndex, 'correctAnswer', e.target.value);
                            }
                          }}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        />
                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Option
                    </button>
                  </div>
                )}

                {/* True/False */}
                {question.type === 'true_false' && (
                  <div className="flex gap-4">
                    {['True', 'False'].map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctAnswer === option}
                          onChange={() => updateQuestion(qIndex, 'correctAnswer', option)}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Short Answer / Fill Blank */}
                {(question.type === 'short_answer' || question.type === 'fill_blank') && (
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Correct Answer (for auto-marking):
                    </label>
                    <input
                      type="text"
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                      placeholder="Enter correct answer..."
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={question.caseSensitive}
                        onChange={(e) => updateQuestion(qIndex, 'caseSensitive', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-500">Case sensitive</span>
                    </label>
                  </div>
                )}

                {/* Explanation */}
                <textarea
                  value={question.explanation}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  placeholder="Explanation (shown after quiz)..."
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || quiz.questions.length === 0}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Create Quiz
            </>
          )}
        </button>
      </div>
    </form>
  );
};
