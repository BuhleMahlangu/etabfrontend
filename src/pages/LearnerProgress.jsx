import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  AlertCircle,
  ChevronRight,
  FileText,
  HelpCircle,
  BarChart3,
  Calendar,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Trophy
} from 'lucide-react';
import { progressAPI, quizAPI } from '../services/api';

export const LearnerProgress = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectDetail, setSubjectDetail] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    fetchProgress();
    fetchQuizResults();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await progressAPI.getMyProgress();
      if (response.success) {
        setProgressData(response.data);
      } else {
        setError(response.message || 'Failed to load progress');
      }
    } catch (err) {
      console.error('[Progress] Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizResults = async () => {
    try {
      const response = await quizAPI.getMyResults();
      if (response.success) {
        setQuizResults(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch quiz results:', err);
    }
  };

  const fetchSubjectDetail = async (subjectId) => {
    try {
      const response = await progressAPI.getSubjectProgress(subjectId);
      if (response.success) {
        setSubjectDetail(response.data);
        setSelectedSubject(subjectId);
      }
    } catch (err) {
      console.error('Failed to load subject detail:', err);
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-700';
    if (grade === 'B') return 'bg-blue-100 text-blue-700';
    if (grade === 'C') return 'bg-yellow-100 text-yellow-700';
    if (grade === 'D') return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
          <AlertCircle className="inline-block w-5 h-5 mr-2" />
          {error}
        </div>
        <button 
          onClick={fetchProgress}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  // No data state
  if (!progressData || !progressData.subjects || progressData.subjects.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">My Academic Progress</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <BookOpen className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Progress Data Yet</h2>
          <p className="text-slate-600 mb-4">
            You don't have any enrolled subjects or graded assignments yet.
          </p>
          <button 
            onClick={() => navigate('/subjects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Subjects
          </button>
        </div>
      </div>
    );
  }

  const { overall, subjects, recentActivity } = progressData;

  // Subject Detail View
  if (selectedSubject && subjectDetail) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <button
          onClick={() => {
            setSelectedSubject(null);
            setSubjectDetail(null);
          }}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Progress Overview
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{subjectDetail.subject.name}</h1>
              <p className="text-slate-500">{subjectDetail.subject.code}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${getGradeColor(subjectDetail.summary.letterGrade)}`}>
                {subjectDetail.summary.letterGrade}
              </span>
              <p className="text-sm text-slate-500 mt-1">{subjectDetail.summary.overallPercentage}% Overall</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-500">Assignments</p>
            <p className="text-2xl font-bold text-slate-900">{subjectDetail.assignments.stats.percentage}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-500">Quiz Average</p>
            <p className="text-2xl font-bold text-slate-900">{subjectDetail.quizzes.stats.averagePercentage}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-500">Status</p>
            <p className={`text-lg font-bold ${subjectDetail.summary.status === 'Passing' ? 'text-green-600' : 'text-red-600'}`}>
              {subjectDetail.summary.status}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-2xl font-bold text-orange-600">
              {subjectDetail.assignments.stats.total - subjectDetail.assignments.stats.submitted}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-slate-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Assignments
              </h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {subjectDetail.assignments.items.map((assignment) => (
                <div key={assignment.id} className="p-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{assignment.title}</p>
                      <p className="text-sm text-slate-500">Max Marks: {assignment.maxMarks}</p>
                    </div>
                    <div className="text-right">
                      {assignment.submission?.status === 'graded' ? (
                        <div>
                          <p className="text-2xl font-bold text-slate-900">
                            {assignment.submission.marksObtained}
                            <span className="text-sm text-slate-500">/{assignment.maxMarks}</span>
                          </p>
                          <p className="text-sm text-green-600 font-medium">{assignment.submission.percentage}%</p>
                        </div>
                      ) : assignment.submission ? (
                        <span className="text-sm text-yellow-600">Pending Grade</span>
                      ) : (
                        <span className="text-sm text-red-600">Not Submitted</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-slate-900 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Quizzes
              </h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {subjectDetail.quizzes.items.map((quiz) => (
                <div key={quiz.id} className="p-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{quiz.title}</p>
                    </div>
                    <div className="text-right">
                      {quiz.attempt?.status && ['submitted', 'auto_submitted', 'graded', 'completed'].includes(quiz.attempt.status) ? (
                        <div>
                          <p className={`text-2xl font-bold ${quiz.attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {quiz.attempt.percentage}%
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Not Attempted</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Overview
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Academic Progress</h1>
        <p className="text-slate-500 mt-1">Track your performance across all subjects</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Overall Grade</p>
              <p className="text-4xl font-bold">{overall.overallGrade}</p>
            </div>
            <Award className="w-12 h-12 text-blue-200" />
          </div>
          <p className="mt-2 text-blue-100">{overall.overallPercentage}% Average</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-slate-500 text-sm">Subjects</p>
          <p className="text-3xl font-bold text-slate-900">{overall.totalSubjects}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-slate-500 text-sm">Assignments</p>
          <p className="text-3xl font-bold text-slate-900">
            {overall.gradedAssignments}/{overall.totalAssignments}
          </p>
          <p className="text-sm text-slate-400">{overall.assignmentAverage}% Avg</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-slate-500 text-sm">Quizzes</p>
          <p className="text-3xl font-bold text-slate-900">
            {overall.completedQuizzes}/{overall.totalQuizzes}
          </p>
          <p className="text-sm text-slate-400">{overall.quizAverage}% Avg</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject Progress */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Subject Progress
          </h2>
          
          <div className="space-y-4">
            {subjects.map((subject) => (
              <div 
                key={subject.subjectId}
                onClick={() => fetchSubjectDetail(subject.subjectId)}
                className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{subject.subjectName}</h3>
                    <p className="text-sm text-slate-500">{subject.subjectCode}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full font-bold mr-3 ${getGradeColor(subject.letterGrade)}`}>
                      {subject.letterGrade}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Overall Progress</span>
                    <span className="font-medium text-slate-900">{subject.overallPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(subject.overallPercentage)}`}
                      style={{ width: `${Math.min(subject.overallPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500">Assignments</p>
                    <p className="font-semibold text-slate-900">
                      {subject.assignments.submitted}/{subject.assignments.total}
                      <span className="text-xs text-slate-400 ml-1">({subject.assignments.percentage}%)</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500">Quizzes</p>
                    <p className="font-semibold text-slate-900">
                      {subject.quizzes.completed}/{subject.quizzes.total}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500">Pending</p>
                    <p className="font-semibold text-orange-600">{subject.assignments.pending}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-sm">
            {recentActivity && recentActivity.length > 0 ? (
              <div className="divide-y">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-4">
                    <p className="font-medium text-slate-900 text-sm">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.subject_name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Results Section */}
      {quizResults.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Quiz Results
            </h2>
            <button
              onClick={() => setShowQuizResults(!showQuizResults)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showQuizResults ? 'Hide' : 'Show All'}
            </button>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
            showQuizResults ? '' : 'max-h-64'
          }`}>
            <div className="divide-y">
              {quizResults.slice(0, showQuizResults ? undefined : 3).map((result) => (
                <div key={result.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{result.quiz_title}</p>
                      <p className="text-sm text-slate-500">{result.subject_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`font-bold ${
                          result.passed ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.percentage_score}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {result.total_score}/{result.max_possible_score} points
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.floor(result.time_taken_seconds / 60)}m {result.time_taken_seconds % 60}s
                    </span>
                    <span>
                      {new Date(result.submitted_at).toLocaleDateString()}
                    </span>
                    {result.teacher_reviewed && (
                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                        Reviewed by Teacher
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
