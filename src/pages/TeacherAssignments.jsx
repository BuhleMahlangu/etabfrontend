import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI, teacherAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FileText, Plus, Trash2, Edit2, Calendar, CheckCircle, Clock, Users, X, File, Download, User, Star } from 'lucide-react';

const SUBMISSION_TYPES = [
  { value: 'file', label: 'File Upload' },
  { value: 'text', label: 'Text Entry' },
  { value: 'link', label: 'Website URL' }
];

export function TeacherAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ marks: '', feedback: '' });
  
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    description: '',
    instructions: '',
    maxMarks: 100,
    passingMarks: 50,
    dueDate: '',
    allowLateSubmission: false,
    latePenaltyPercent: 0,
    submissionType: 'file',
    maxFileSizeMb: 10,
    applicableGrades: []
  });

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
    fetchGrades();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await assignmentAPI.getAll();
      if (response.success) {
        setAssignments(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await teacherAPI.getMyAssignments();
      if (response.success) {
        const allSubjects = [];
        response.grades?.forEach(grade => {
          grade.subjects?.forEach(subject => {
            allSubjects.push({
              id: subject.subjectId,
              name: subject.subjectName,
              code: subject.subjectCode,
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

  const fetchSubmissions = async (assignmentId) => {
    setLoadingSubmissions(true);
    try {
      // Get assignment details
      const response = await assignmentAPI.getById(assignmentId);
      if (response.success) {
        setSelectedAssignment(response.data);
        // Fetch all submissions for this assignment
        const submissionsRes = await assignmentAPI.getSubmissions(assignmentId);
        setSubmissions(submissionsRes.data || []);
        setShowSubmissionsModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await assignmentAPI.create(formData);
      if (response.success) {
        setShowCreateModal(false);
        resetForm();
        fetchAssignments();
      }
    } catch (error) {
      console.error('Failed to create assignment:', error);
      alert('Failed to create assignment');
    }
  };

  const handlePublish = async (id) => {
    try {
      await assignmentAPI.update(id, { isPublished: true, status: 'published' });
      fetchAssignments();
    } catch (error) {
      console.error('Failed to publish assignment:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await assignmentAPI.delete(id);
      fetchAssignments();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      await assignmentAPI.gradeSubmission(gradingSubmission.id, {
        marksObtained: parseInt(gradeData.marks),
        feedback: gradeData.feedback
      });
      
      // Refresh submissions
      fetchSubmissions(selectedAssignment.id);
      setGradingSubmission(null);
      setGradeData({ marks: '', feedback: '' });
      alert('Grade saved successfully!');
    } catch (error) {
      console.error('Failed to grade:', error);
      alert('Failed to save grade');
    }
  };

  const resetForm = () => {
    setFormData({
      subjectId: '',
      title: '',
      description: '',
      instructions: '',
      maxMarks: 100,
      passingMarks: 50,
      dueDate: '',
      allowLateSubmission: false,
      latePenaltyPercent: 0,
      submissionType: 'file',
      maxFileSizeMb: 10,
      applicableGrades: []
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();
  const isDueSoon = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffHours = (due - now) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
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
          <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
          <p className="text-slate-500">Create and manage assignments for your students</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Assignment
        </Button>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No Assignments Yet</h3>
          <p className="text-slate-500 mb-4">Create your first assignment for students</p>
          <Button onClick={openCreateModal} variant="outline">Create Assignment</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={assignment.status === 'published' ? 'success' : 'warning'}>
                  {assignment.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
                {isOverdue(assignment.due_date) ? (
                  <Badge variant="error">Overdue</Badge>
                ) : isDueSoon(assignment.due_date) ? (
                  <Badge variant="warning">Due Soon</Badge>
                ) : null}
              </div>

              <h3 className="font-semibold text-slate-900 mb-1">{assignment.title}</h3>
              <p className="text-sm text-slate-500 mb-2">{assignment.subject_name}</p>
              
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <Calendar className="w-3 h-3" />
                Due: {new Date(assignment.due_date).toLocaleString()}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {assignment.submission_count || 0} submissions
                </span>
                <span>{assignment.max_marks} marks</span>
              </div>

              <div className="flex items-center justify-between">
                {assignment.status !== 'published' ? (
                  <Button size="sm" onClick={() => handlePublish(assignment.id)}>
                    Publish
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => fetchSubmissions(assignment.id)}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    View Submissions
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(assignment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Assignment"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <select
              value={formData.subjectId}
              onChange={(e) => {
                const selectedSubject = subjects.find(s => s.id === e.target.value);
                setFormData({ 
                  ...formData, 
                  subjectId: e.target.value,
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
          </div>

          <Input
            label="Assignment Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Research Paper: Climate Change"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the assignment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Instructions</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed instructions for students"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Max Marks"
              type="number"
              min={1}
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) })}
            />
            <Input
              label="Passing Marks"
              type="number"
              min={1}
              value={formData.passingMarks}
              onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
            />
            <Input
              label="Due Date"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Submission Type</label>
            <select
              value={formData.submissionType}
              onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {SUBMISSION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {formData.submissionType === 'file' && (
            <Input
              label="Max File Size (MB)"
              type="number"
              min={1}
              max={100}
              value={formData.maxFileSizeMb}
              onChange={(e) => setFormData({ ...formData, maxFileSizeMb: parseInt(e.target.value) })}
            />
          )}

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.allowLateSubmission}
                onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-slate-700">Allow late submissions</span>
            </label>
          </div>

          {formData.allowLateSubmission && (
            <Input
              label="Late Penalty (%)"
              type="number"
              min={0}
              max={100}
              value={formData.latePenaltyPercent}
              onChange={(e) => setFormData({ ...formData, latePenaltyPercent: parseInt(e.target.value) })}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Applicable Grades</label>
            <div className="flex flex-wrap gap-2">
              {grades.map((grade) => (
                <label key={grade.id} className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.applicableGrades.includes(grade.grade)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          applicableGrades: [...formData.applicableGrades, grade.grade]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          applicableGrades: formData.applicableGrades.filter(g => g !== grade.grade)
                        });
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{grade.grade}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Submissions Modal */}
      <Modal
        isOpen={showSubmissionsModal}
        onClose={() => {
          setShowSubmissionsModal(false);
          setSelectedAssignment(null);
          setSubmissions([]);
          setGradingSubmission(null);
        }}
        title={selectedAssignment ? `Submissions: ${selectedAssignment.title}` : 'Submissions'}
        size="xl"
      >
        {loadingSubmissions ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {submissions.map((submission) => (
              <Card key={submission.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{submission.first_name} {submission.last_name}</span>
                      <span className="text-sm text-slate-500">({submission.email})</span>
                      {submission.is_late && <Badge variant="error">Late</Badge>}
                    </div>

                    <div className="text-xs text-slate-500 mb-2">
                      Submitted: {new Date(submission.submitted_at).toLocaleString()}
                    </div>

                    {/* Show submitted content */}
                    {submission.file_name && (
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded mb-2">
                        <File className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{submission.file_name}</span>
                        {submission.file_url && (
                          <a 
                            href={submission.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        )}
                      </div>
                    )}

                    {submission.submission_url && (
                      <a 
                        href={submission.submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm block mb-2"
                      >
                        Submitted Link
                      </a>
                    )}

                    {submission.submission_text && (
                      <div className="p-2 bg-slate-50 rounded mb-2 max-h-32 overflow-y-auto">
                        <p className="text-sm text-slate-700">{submission.submission_text}</p>
                      </div>
                    )}

                    {/* Show grade if already graded */}
                    {submission.status === 'graded' && (
                      <div className="p-3 bg-green-50 rounded-lg mb-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-900">
                            Grade: {submission.marks_obtained}/{selectedAssignment?.max_marks}
                          </span>
                        </div>
                        {submission.feedback && (
                          <p className="text-sm text-green-700 mt-1">
                            Feedback: {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    {submission.status !== 'graded' ? (
                      <Button 
                        size="sm"
                        onClick={() => {
                          setGradingSubmission(submission);
                          setGradeData({ marks: '', feedback: '' });
                        }}
                      >
                        Grade
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setGradingSubmission(submission);
                          setGradeData({ 
                            marks: submission.marks_obtained, 
                            feedback: submission.feedback || '' 
                          });
                        }}
                      >
                        Edit Grade
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Grade Modal */}
        {gradingSubmission && (
          <div className="mt-4 p-4 border-t">
            <h4 className="font-medium mb-3">
              Grade: {gradingSubmission.first_name} {gradingSubmission.last_name}
            </h4>
            <form onSubmit={handleGrade} className="space-y-3">
              <Input
                label={`Marks (out of ${selectedAssignment?.max_marks})`}
                type="number"
                min={0}
                max={selectedAssignment?.max_marks}
                value={gradeData.marks}
                onChange={(e) => setGradeData({ ...gradeData, marks: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Feedback</label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Enter feedback for the student..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Grade</Button>
                <Button type="button" variant="outline" onClick={() => setGradingSubmission(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default TeacherAssignments;
