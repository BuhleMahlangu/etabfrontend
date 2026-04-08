import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Award,
  FileText,
  HelpCircle,
  CheckCircle,
  XCircle,
  Clock,
  User
} from 'lucide-react';
import { teacherAPI, quizAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const TeacherLearnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStudentDetail();
  }, [id]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      
      // Get all students and find the one we're looking for
      const studentsRes = await teacherAPI.getMyStudents();
      if (studentsRes.success) {
        const foundStudent = studentsRes.data.find(s => s.id === parseInt(id) || s.id === id);
        if (foundStudent) {
          setStudent(foundStudent);
          
          // Fetch quiz results for this student
          await fetchStudentQuizResults(foundStudent.id);
        } else {
          addToast('Student not found', 'error');
          navigate('/teacher/learners');
        }
      }
    } catch (err) {
      console.error('Failed to fetch student detail:', err);
      addToast('Failed to load student details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentQuizResults = async (studentId) => {
    try {
      // Get student's quiz results using the teacher endpoint
      const resultsRes = await quizAPI.getStudentResults(studentId);
      if (resultsRes.success) {
        setQuizResults(resultsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch quiz results:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Student Not Found</h2>
        <button 
          onClick={() => navigate('/teacher/learners')}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </button>
      </div>
    );
  }

  const getStatusBadge = (progress) => {
    if (progress >= 80) return { text: 'Excellent', class: 'bg-green-100 text-green-700' };
    if (progress >= 60) return { text: 'Good', class: 'bg-blue-100 text-blue-700' };
    if (progress >= 50) return { text: 'Average', class: 'bg-yellow-100 text-yellow-700' };
    return { text: 'At Risk', class: 'bg-red-100 text-red-700' };
  };

  const status = getStatusBadge(student.overall_progress || 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/teacher/learners')}
        className="mb-6 text-slate-600 hover:text-slate-900 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      {/* Student Header Card */}
      <Card className="mb-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
            {student.first_name?.[0]}{student.last_name?.[0]}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {student.first_name} {student.last_name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {student.email}
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                {student.grade_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Enrolled: {new Date(student.enrolled_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-4 py-2 rounded-lg ${status.class}`}>
            <span className="font-medium">{status.text}</span>
          </div>
        </div>
      </Card>

      {/* Stats Grid - Progress Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Overall Progress</p>
              <p className="text-xl font-bold">{student.overall_progress || 0}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Assignments</p>
              <p className="text-xl font-bold">
                {student.progress_breakdown?.assignments?.completed || 0}/{student.progress_breakdown?.assignments?.total || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Quizzes</p>
              <p className="text-xl font-bold">
                {student.progress_breakdown?.quizzes?.completed || 0}/{student.progress_breakdown?.quizzes?.total || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Subjects</p>
              <p className="text-xl font-bold">{student.enrolled_subjects?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'subjects', label: 'Subjects', icon: BookOpen },
          { id: 'quizzes', label: 'Quiz Results', icon: HelpCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Progress Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Progress Breakdown</h3>
            <div className="space-y-4">
              {/* Assignments Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-600" />
                    Assignments Completed
                  </span>
                  <span className="text-slate-500">
                    {student.progress_breakdown?.assignments?.completed || 0} of {student.progress_breakdown?.assignments?.total || 0}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${student.progress_breakdown?.assignments?.total > 0 ? (student.progress_breakdown?.assignments?.completed / student.progress_breakdown?.assignments?.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Quizzes Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    Quizzes Completed
                  </span>
                  <span className="text-slate-500">
                    {student.progress_breakdown?.quizzes?.completed || 0} of {student.progress_breakdown?.quizzes?.total || 0}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${student.progress_breakdown?.quizzes?.total > 0 ? (student.progress_breakdown?.quizzes?.completed / student.progress_breakdown?.quizzes?.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Overall Progress */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Overall Progress</span>
                  <span className="font-medium text-blue-600">{student.overall_progress || 0}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${student.overall_progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {student.enrolled_subjects?.map((subject, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">{subject.subject_name}</h4>
                  <p className="text-sm text-slate-500">{subject.subject_code}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          {quizResults.length === 0 ? (
            <Card className="p-8 text-center">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No Quiz Results</h3>
              <p className="text-slate-500">This student has not taken any quizzes yet.</p>
            </Card>
          ) : (
            quizResults.map((result, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900">{result.quiz_title}</h4>
                      <Badge variant={result.passed ? 'success' : 'error'}>
                        {result.passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{result.subject_name}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Award className="w-4 h-4" />
                        Score: {result.percentage_score?.toFixed(1)}%
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <CheckCircle className="w-4 h-4" />
                        {result.total_score} / {result.max_possible_score} marks
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-4 h-4" />
                        {Math.floor((result.time_taken_seconds || 0) / 60)}m {(result.time_taken_seconds || 0) % 60}s
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">
                      {new Date(result.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            )))
          }
        </div>
      )}
    </div>
  );
};

export default TeacherLearnerDetail;
