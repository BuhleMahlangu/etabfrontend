import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useToast } from '../components/common/Toast';
import { Check, X, User, BookOpen, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const PendingTeachers = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const fetchPendingTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/pending-teachers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingTeachers(data.teachers);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Failed to fetch pending teachers:', err);
      addToast('Failed to load pending teacher requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (teacherId) => {
    setProcessingId(teacherId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/approve-teacher/${teacherId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        addToast(`Teacher ${data.teacher.firstName} ${data.teacher.lastName} approved successfully!`, 'success');
        // Remove from list
        setPendingTeachers(prev => prev.filter(t => t.id !== teacherId));
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Failed to approve teacher:', err);
      addToast(err.message || 'Failed to approve teacher', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (teacherId, reason = '') => {
    setProcessingId(teacherId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/reject-teacher/${teacherId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      
      if (data.success) {
        addToast('Teacher registration rejected', 'success');
        // Remove from list
        setPendingTeachers(prev => prev.filter(t => t.id !== teacherId));
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Failed to reject teacher:', err);
      addToast(err.message || 'Failed to reject teacher', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const toggleExpand = (teacherId) => {
    setExpandedTeacher(expandedTeacher === teacherId ? null : teacherId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Pending Teacher Approvals</h1>
        <p className="text-slate-500 mt-2">
          Review and approve teacher registration requests. {pendingTeachers.length} pending.
        </p>
      </div>

      {pendingTeachers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
            <p className="text-slate-500">No pending teacher registration requests.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingTeachers.map((teacher) => (
            <Card key={teacher.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                      <p className="text-slate-500">{teacher.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="warning">Pending Approval</Badge>
                        <span className="text-sm text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Requested {formatDate(teacher.requestedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(teacher.id)}
                    >
                      {expandedTeacher === teacher.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleReject(teacher.id)}
                      disabled={processingId === teacher.id}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(teacher.id)}
                      disabled={processingId === teacher.id}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTeacher === teacher.id && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Personal Information
                        </h4>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Employee Number:</dt>
                            <dd className="font-medium">{teacher.employeeNumber}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Qualification:</dt>
                            <dd className="font-medium">{teacher.qualification}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Specialization:</dt>
                            <dd className="font-medium">{teacher.specialization}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Years Experience:</dt>
                            <dd className="font-medium">{teacher.yearsExperience}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Bio
                        </h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                          {teacher.bio || 'No bio provided'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Requested Subject Assignments ({teacher.assignments?.length || 0})
                      </h4>
                      {teacher.assignments && teacher.assignments.length > 0 ? (
                        <div className="space-y-2">
                          {teacher.assignments.map((assignment, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-lg flex items-center justify-between">
                              <div>
                                <span className="font-medium">{assignment.gradeName}</span>
                                <span className="text-slate-500 text-sm ml-2">
                                  ({assignment.subjectIds?.length || 0} subjects)
                                </span>
                                {assignment.isPrimary && (
                                  <Badge variant="primary" className="ml-2 text-xs">Primary</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No subject assignments requested</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};