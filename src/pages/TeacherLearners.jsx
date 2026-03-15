import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Search,
  GraduationCap,
  Mail,
  TrendingUp,
  FileText,
  HelpCircle,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  UserCircle,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { teacherAPI, subjectAPI } from '../services/api';
import { useToast } from '../components/common/Toast';

export const TeacherLearners = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [mySubjects, setMySubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [viewMode, setViewMode] = useState('by-subject'); // 'by-subject' or 'list'

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      
      // Get teacher's assignments (subjects they teach)
      const assignmentsRes = await teacherAPI.getMyAssignments();
      
      // Get all students enrolled in those subjects
      const studentsRes = await teacherAPI.getMyStudents();
      
      if (assignmentsRes.success && studentsRes.success) {
        setMySubjects(assignmentsRes.grades || []);
        setStudents(studentsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch teacher data:', err);
      addToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get unique grades from students
  const grades = [...new Set(students.map(s => s.grade_name))].sort();

  // Filter students
  let filteredStudents = students.filter(student => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        student.first_name?.toLowerCase().includes(query) ||
        student.last_name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Subject filter
  if (selectedSubject !== 'all') {
    filteredStudents = filteredStudents.filter(s => 
      s.enrolled_subjects?.some(sub => sub.subject_id === selectedSubject)
    );
  }

  // Grade filter
  if (selectedGrade !== 'all') {
    filteredStudents = filteredStudents.filter(s => s.grade_name === selectedGrade);
  }

  // Group students by subject for the "by-subject" view
  const studentsBySubject = mySubjects.flatMap(grade => 
    grade.subjects?.map(subject => ({
      ...subject,
      gradeName: grade.gradeName,
      gradeId: grade.gradeId,
      students: filteredStudents.filter(student => 
        student.enrolled_subjects?.some(sub => sub.subject_id === subject.subjectId)
      )
    })) || []
  ).filter(s => s.students.length > 0);

  // Calculate stats
  const stats = {
    totalStudents: filteredStudents.length,
    totalSubjects: mySubjects.reduce((acc, g) => acc + (g.subjects?.length || 0), 0),
    avgProgress: filteredStudents.length > 0
      ? Math.round(filteredStudents.reduce((acc, s) => acc + (s.overall_progress || 0), 0) / filteredStudents.length)
      : 0,
    atRiskStudents: filteredStudents.filter(s => (s.overall_progress || 0) < 50).length
  };

  const handleViewStudent = (studentId) => {
    navigate(`/teacher/learners/${studentId}`);
  };

  const handleExportData = () => {
    // Create CSV data
    const csvContent = [
      ['Name', 'Email', 'Grade', 'Subjects', 'Progress', 'Status'].join(','),
      ...filteredStudents.map(s => [
        `${s.first_name} ${s.last_name}`,
        s.email,
        s.grade_name,
        s.enrolled_subjects?.map(sub => sub.subject_name).join('; '),
        `${s.overall_progress || 0}%`,
        (s.overall_progress || 0) >= 50 ? 'Passing' : 'At Risk'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    addToast('Student data exported', 'success');
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (progress) => {
    if (progress >= 80) return { text: 'Excellent', class: 'bg-green-100 text-green-700' };
    if (progress >= 60) return { text: 'Good', class: 'bg-blue-100 text-blue-700' };
    if (progress >= 50) return { text: 'Average', class: 'bg-yellow-100 text-yellow-700' };
    return { text: 'At Risk', class: 'bg-red-100 text-red-700' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">My Students</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              View and manage students across all your subjects
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={fetchTeacherData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Subjects Teaching</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalSubjects}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Avg Progress</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.avgProgress}%</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">At Risk</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.atRiskStudents}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Subjects</option>
              {mySubjects.map(grade => 
                grade.subjects?.map(subject => (
                  <option key={subject.subjectId} value={subject.subjectId}>
                    {grade.gradeName} - {subject.subjectName}
                  </option>
                ))
              )}
            </select>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
              <button
                onClick={() => setViewMode('by-subject')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'by-subject'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                By Subject
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Students
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'by-subject' ? (
        // Grouped by Subject View
        <div className="space-y-6">
          {studentsBySubject.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No students found</h3>
              <p className="text-slate-500">Try adjusting your filters</p>
            </div>
          ) : (
            studentsBySubject.map((subject) => (
              <div key={subject.subjectId} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
                {/* Subject Header */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{subject.subjectName}</h3>
                        <p className="text-sm text-slate-500">{subject.gradeName} • {subject.students.length} students</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/teacher/materials?subject=${subject.subjectId}`)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      View Materials
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Students List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {subject.students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleViewStudent(student.id)}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                            {student.first_name} {student.last_name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {student.email}
                            </span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="hidden md:block w-32">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-medium">{student.overall_progress || 0}%</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressColor(student.overall_progress)} transition-all duration-500`}
                              style={{ width: `${student.overall_progress || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Status */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(student.overall_progress).class}`}>
                          {getStatusBadge(student.overall_progress).text}
                        </span>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // All Students List View
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => handleViewStudent(student.id)}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {student.first_name} {student.last_name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {student.grade_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {student.enrolled_subjects?.length} subjects
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {student.email}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    {student.enrolled_subjects?.slice(0, 3).map((sub, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                        {sub.subject_name}
                      </span>
                    ))}
                    {student.enrolled_subjects?.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                        +{student.enrolled_subjects.length - 3}
                      </span>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(student.overall_progress).class}`}>
                    {student.overall_progress || 0}%
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
