import React, { useState, useEffect } from 'react';
import { assignmentAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FileText, Upload, CheckCircle, Clock, AlertCircle, Calendar, X, File, Link as LinkIcon, Type } from 'lucide-react';

export function LearnerAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({ text: '', url: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [filter]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? null : filter;
      const response = await assignmentAPI.getMyAssignments(status);
      if (response.success) {
        setAssignments(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (default max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert('File size exceeds 10MB limit');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    // Validation
    if (selectedAssignment.submission_type === 'text' && !submissionData.text.trim()) {
      alert('Please enter your answer');
      return;
    }
    if (selectedAssignment.submission_type === 'link' && !submissionData.url.trim()) {
      alert('Please enter a URL');
      return;
    }
    if (selectedAssignment.submission_type === 'file' && !selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      
      if (selectedAssignment.submission_type === 'text') {
        formData.append('submissionText', submissionData.text);
      } else if (selectedAssignment.submission_type === 'link') {
        formData.append('submissionUrl', submissionData.url);
      }
      
      if (selectedFile) {
        formData.append('file', selectedFile);
        console.log('Uploading file:', selectedFile.name, selectedFile.size);
      }

      console.log('Submitting assignment:', selectedAssignment.id);
      const response = await assignmentAPI.submit(selectedAssignment.id, formData);
      console.log('Submission response:', response);
      
      if (response.success) {
        setShowSubmitModal(false);
        setSubmissionData({ text: '', url: '' });
        setSelectedFile(null);
        setSelectedAssignment(null);
        fetchAssignments();
        alert('Assignment submitted successfully!');
      } else {
        alert(response.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to submit';
      alert('Error: ' + errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionData({ text: '', url: '' });
    setSelectedFile(null);
    setShowSubmitModal(true);
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();
  
  const getTimeRemaining = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffMs = due - now;
    
    if (diffMs < 0) return 'Overdue';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays} day(s) left`;
    return `${diffHours} hour(s) left`;
  };

  const getStatusBadge = (assignment) => {
    if (assignment.submission_status === 'graded') {
      return <Badge variant="success">Graded: {assignment.marks_obtained}/{assignment.max_marks}</Badge>;
    }
    if (assignment.submission_status === 'submitted') {
      return <Badge variant="info">Submitted</Badge>;
    }
    if (assignment.learner_status === 'overdue') {
      return <Badge variant="error">Overdue</Badge>;
    }
    return <Badge variant="warning">Pending</Badge>;
  };

  const getSubmissionTypeIcon = (type) => {
    switch (type) {
      case 'file': return <File className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Assignments</h1>
        <p className="text-slate-500">View and submit your assignments</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'pending', 'submitted', 'overdue'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === tab
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No Assignments</h3>
          <p className="text-slate-500">You have no {filter !== 'all' ? filter : ''} assignments</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{assignment.subject_name}</Badge>
                    {getStatusBadge(assignment)}
                    {assignment.is_late && <Badge variant="error">Late</Badge>}
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      {getSubmissionTypeIcon(assignment.submission_type)}
                      {assignment.submission_type}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-1">{assignment.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{assignment.description}</p>

                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {new Date(assignment.due_date).toLocaleString()}
                    </span>
                    <span className={`flex items-center gap-1 ${
                      isOverdue(assignment.due_date) ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      <Clock className="w-4 h-4" />
                      {getTimeRemaining(assignment.due_date)}
                    </span>
                    <span>{assignment.max_marks} marks</span>
                  </div>

                  {assignment.feedback && (
                    <div className="p-3 bg-blue-50 rounded-lg mb-3">
                      <p className="text-sm font-medium text-blue-900">Feedback:</p>
                      <p className="text-sm text-blue-700">{assignment.feedback}</p>
                    </div>
                  )}

                  {/* Show submitted file/info if already submitted */}
                  {assignment.submission_id && (
                    <div className="p-3 bg-green-50 rounded-lg mb-3">
                      <p className="text-sm font-medium text-green-900">Your Submission:</p>
                      {assignment.file_name && (
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <File className="w-4 h-4" />
                          {assignment.file_name}
                          {assignment.file_url && (
                            <a href={assignment.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              View
                            </a>
                          )}
                        </p>
                      )}
                      {assignment.submission_url && (
                        <p className="text-sm text-green-700">
                          <a href={assignment.submission_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            <LinkIcon className="w-4 h-4" />
                            Submitted Link
                          </a>
                        </p>
                      )}
                      {assignment.submission_text && (
                        <p className="text-sm text-green-700 mt-1">{assignment.submission_text.substring(0, 100)}...</p>
                      )}
                      <p className="text-xs text-green-600 mt-1">
                        Submitted: {new Date(assignment.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  {!assignment.submission_id && !isOverdue(assignment.due_date) ? (
                    <Button onClick={() => openSubmitModal(assignment)}>
                      Submit
                    </Button>
                  ) : assignment.submission_id ? (
                    <Button variant="outline" disabled>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Submitted
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Closed
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Assignment"
      >
        {selectedAssignment && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900">{selectedAssignment.title}</h3>
              <p className="text-sm text-slate-500">{selectedAssignment.subject_name}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700">Instructions:</p>
              <p className="text-sm text-slate-600">{selectedAssignment.instructions}</p>
            </div>

            {/* Text Submission */}
            {selectedAssignment.submission_type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Answer</label>
                <textarea
                  value={submissionData.text}
                  onChange={(e) => setSubmissionData({ ...submissionData, text: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your answer here..."
                  required
                />
              </div>
            )}

            {/* Link Submission */}
            {selectedAssignment.submission_type === 'link' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                <input
                  type="url"
                  value={submissionData.url}
                  onChange={(e) => setSubmissionData({ ...submissionData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                  required
                />
              </div>
            )}

            {/* File Upload */}
            {selectedAssignment.submission_type === 'file' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload File</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    required={!selectedFile}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">
                      {selectedFile ? selectedFile.name : 'Click to upload file'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Max size: {selectedAssignment.max_file_size_mb || 10}MB
                    </p>
                  </label>
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded">
                    <File className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 flex-1">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || (selectedAssignment.submission_type === 'file' && !selectedFile)}>
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default LearnerAssignments;
