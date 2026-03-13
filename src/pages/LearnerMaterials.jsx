import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { materialAPI, enrollmentAPI, subjectAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BookOpen, FileText, Download, ChevronLeft, GraduationCap, Calendar, Award, ArrowLeft } from 'lucide-react';

export function LearnerMaterials() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for subjects sidebar
  const [currentSubjects, setCurrentSubjects] = useState([]);
  const [enrollmentHistory, setEnrollmentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // State for selected subject materials
  const [materials, setMaterials] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [enrollmentInfo, setEnrollmentInfo] = useState(null);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'
  const [selectedHistoryGrade, setSelectedHistoryGrade] = useState(null);

  // Fetch current subjects and enrollment history on mount
  useEffect(() => {
    fetchCurrentSubjects();
    fetchEnrollmentHistory();
  }, []);

  // Fetch materials when subjectId changes
  useEffect(() => {
    if (subjectId) {
      fetchSubjectMaterials(subjectId);
    }
  }, [subjectId]);

  const fetchCurrentSubjects = async () => {
    try {
      // Use the dedicated endpoint for current subjects
      const response = await subjectAPI.getMySubjects();
      if (response.success) {
        setCurrentSubjects(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch current subjects:', error);
    }
  };

  const fetchEnrollmentHistory = async () => {
    setHistoryLoading(true);
    try {
      // Fetch FET phase history (Grades 10-12)
      const response = await enrollmentAPI.getHistory('fet');
      if (response.success) {
        setEnrollmentHistory(response.data?.byGrade || []);
      }
    } catch (error) {
      console.error('Failed to fetch enrollment history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchSubjectMaterials = async (id) => {
    setMaterialsLoading(true);
    try {
      const response = await materialAPI.getBySubject(id);
      if (response.success) {
        setMaterials(response.data || []);
        setEnrollmentInfo(response.enrollment);
        
        // Find subject details from current or history
        const subject = findSubjectById(id);
        setSelectedSubject(subject);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const findSubjectById = (id) => {
    // Check current subjects
    const current = currentSubjects.find(s => s.subject_id === id || s.id === id);
    if (current) return current;
    
    // Check history
    for (const grade of enrollmentHistory) {
      const subject = grade.subjects.find(s => s.subject_id === id || s.id === id);
      if (subject) return subject;
    }
    return null;
  };

  const handleSubjectClick = (id) => {
    navigate(`/learner/materials/${id}`);
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('video')) return '🎬';
    if (type?.includes('image')) return '🖼️';
    if (type?.includes('audio')) return '🎵';
    return '📎';
  };

  const getFileTypeLabel = (url) => {
    if (!url) return 'Unknown';
    const ext = url.split('.').pop()?.toLowerCase();
    const types = {
      pdf: 'PDF Document',
      doc: 'Word Document',
      docx: 'Word Document',
      ppt: 'PowerPoint',
      pptx: 'PowerPoint',
      mp4: 'Video',
      mp3: 'Audio',
      jpg: 'Image',
      jpeg: 'Image',
      png: 'Image',
    };
    return types[ext] || 'File';
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h2 className="text-lg font-semibold text-slate-900">My Subjects</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'current'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Current
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FET History
          </button>
        </div>

        {/* Subject List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'current' ? (
            // Current Subjects
            currentSubjects.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No current subjects
              </div>
            ) : (
              currentSubjects.map((subject) => (
                <button
                  key={subject.subject_id || subject.id}
                  onClick={() => handleSubjectClick(subject.subject_id || subject.id)}
                  className={`w-full p-4 text-left border-b border-slate-100 transition-colors ${
                    (subject.subject_id || subject.id) === subjectId
                      ? 'bg-blue-50 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold">
                      {subject.subject_code?.charAt(0) || subject.subject_name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">
                        {subject.subject_name || subject.name}
                      </h3>
                      <p className="text-xs text-slate-500">{subject.subject_code || subject.code}</p>
                      <Badge variant="success" className="mt-1 text-xs">Current</Badge>
                    </div>
                  </div>
                </button>
              ))
            )
          ) : (
            // FET History
            historyLoading ? (
              <div className="p-4 flex justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : enrollmentHistory.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No FET phase history
              </div>
            ) : (
              enrollmentHistory.map((grade) => (
                <div key={grade.grade} className="border-b border-slate-200">
                  {/* Grade Header */}
                  <button
                    onClick={() => setSelectedHistoryGrade(
                      selectedHistoryGrade === grade.grade ? null : grade.grade
                    )}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-700">{grade.grade}</span>
                      <span className="text-xs text-slate-500">({grade.academic_year})</span>
                    </div>
                    <ChevronLeft
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        selectedHistoryGrade === grade.grade ? '-rotate-90' : ''
                      }`}
                    />
                  </button>
                  
                  {/* Grade Subjects */}
                  {selectedHistoryGrade === grade.grade && (
                    <div className="bg-white">
                      {grade.subjects.map((subject) => (
                        <button
                          key={subject.subject_id || subject.id}
                          onClick={() => handleSubjectClick(subject.subject_id || subject.id)}
                          className={`w-full p-3 pl-8 text-left border-b border-slate-50 transition-colors ${
                            (subject.subject_id || subject.id) === subjectId
                              ? 'bg-blue-50 border-l-4 border-l-blue-600'
                              : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900">
                                {subject.subject_name || subject.name}
                              </h4>
                              <p className="text-xs text-slate-500">{subject.subject_code || subject.code}</p>
                            </div>
                            {subject.final_mark && (
                              <Badge 
                                variant={subject.final_mark >= 50 ? 'success' : 'error'}
                                className="text-xs"
                              >
                                {subject.final_mark}%
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!subjectId ? (
          // No subject selected
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl mx-auto mb-4">
                <BookOpen className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Select a Subject
              </h3>
              <p className="text-slate-500 max-w-md">
                Choose a subject from the sidebar to view its materials and resources.
              </p>
            </div>
          </div>
        ) : materialsLoading ? (
          // Loading
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          // Subject Materials
          <div>
            {/* Subject Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {selectedSubject?.subject_name || selectedSubject?.name || 'Subject Materials'}
                  </h1>
                  <p className="text-slate-500">
                    {selectedSubject?.subject_code || selectedSubject?.code}
                  </p>
                </div>
                {enrollmentInfo && (
                  <div className="text-right">
                    <Badge variant="info" className="mb-1">
                      {enrollmentInfo.grade}
                    </Badge>
                    <p className="text-xs text-slate-500">{enrollmentInfo.academic_year}</p>
                  </div>
                )}
              </div>
              
              {/* Marks Display (if from history) */}
              {selectedSubject?.final_mark && (
                <Card className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <div className="flex items-center gap-4">
                    <Award className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Final Mark</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedSubject.final_mark}%
                        <span className={`ml-2 text-sm ${selectedSubject.final_mark >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedSubject.final_mark >= 50 ? '(Passed)' : '(Failed)'}
                        </span>
                      </p>
                    </div>
                    {selectedSubject.teacher_name && (
                      <div className="ml-auto text-right">
                        <p className="text-sm text-slate-600">Teacher</p>
                        <p className="font-medium text-slate-900">{selectedSubject.teacher_name}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Materials List */}
            {materials.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No Materials Available</h3>
                <p className="text-slate-500">There are no materials uploaded for this subject yet.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {materials.map((material) => (
                  <Card key={material.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl">
                        {getFileIcon(material.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {material.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                          {material.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>{getFileTypeLabel(material.file_url)}</span>
                          <span>•</span>
                          <span>Grade {material.grade_applicability?.join(', ') || 'All'}</span>
                          <span>•</span>
                          <span>{new Date(material.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <a
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Open
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LearnerMaterials;
