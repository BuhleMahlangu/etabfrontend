import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { announcementAPI, teacherAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Megaphone, Plus, Trash2, Edit2, Pin, Calendar, Eye } from 'lucide-react';

export function TeacherAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    content: '',
    applicableGrades: [],
    isPinned: false
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchTeacherSubjects();
    fetchGrades();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementAPI.getAll();
      if (response.success) {
        setAnnouncements(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherSubjects = async () => {
    try {
      // Get subjects from teacher assignments
      const response = await teacherAPI.getMyAssignments();
      if (response.success) {
        // Flatten subjects from all grades
        const allSubjects = [];
        response.grades?.forEach(grade => {
          grade.subjects?.forEach(subject => {
            allSubjects.push({
              id: subject.subjectId,
              name: subject.name,
              code: subject.code,
              department: subject.department,
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await announcementAPI.create(formData);
      if (response.success) {
        setShowCreateModal(false);
        setFormData({ subjectId: '', title: '', content: '', applicableGrades: [], isPinned: false });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Failed to create announcement:', error);
      alert('Failed to create announcement');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await announcementAPI.update(editingAnnouncement.id, formData);
      if (response.success) {
        setEditingAnnouncement(null);
        setFormData({ subjectId: '', title: '', content: '', applicableGrades: [], isPinned: false });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Failed to update announcement:', error);
      alert('Failed to update announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementAPI.delete(id);
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const openEditModal = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      subjectId: announcement.subject_id,
      title: announcement.title,
      content: announcement.content,
      applicableGrades: announcement.applicable_grades || [],
      isPinned: announcement.is_pinned
    });
    setShowCreateModal(true);
  };

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    setFormData({ subjectId: '', title: '', content: '', applicableGrades: [], isPinned: false });
    setShowCreateModal(true);
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
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-500">Create and manage announcements for your students</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <Card className="p-8 text-center">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No Announcements Yet</h3>
          <p className="text-slate-500 mb-4">Create your first announcement to notify students</p>
          <Button onClick={openCreateModal} variant="outline">Create Announcement</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className={`p-5 ${announcement.is_pinned ? 'border-l-4 border-l-blue-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.is_pinned && (
                      <Badge variant="info" className="flex items-center gap-1">
                        <Pin className="w-3 h-3" />
                        Pinned
                      </Badge>
                    )}
                    <Badge variant="secondary">{announcement.subject_name}</Badge>
                    <span className="text-xs text-slate-400">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{announcement.title}</h3>
                  <p className="text-slate-600 whitespace-pre-wrap mb-3">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {announcement.view_count || 0} views
                    </span>
                    {announcement.applicable_grades?.length > 0 && (
                      <span>Grades: {announcement.applicable_grades.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openEditModal(announcement)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(announcement.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
      >
        <form onSubmit={editingAnnouncement ? handleUpdate : handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <select
              value={formData.subjectId}
              onChange={(e) => {
                const selectedSubject = subjects.find(s => s.id === e.target.value);
                setFormData({ 
                  ...formData, 
                  subjectId: e.target.value,
                  // Auto-select the grade of the selected subject
                  applicableGrades: selectedSubject ? [selectedSubject.gradeName] : []
                });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">{subjects.length === 0 ? 'Loading subjects...' : 'Select a subject'}</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code}) - {subject.gradeName}
                </option>
              ))}
            </select>
            {subjects.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No subjects found. You may not have any subject assignments.</p>
            )}
          </div>

          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter announcement title"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter announcement content"
              required
            />
          </div>

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
            <p className="text-xs text-slate-500 mt-1">Leave empty to apply to all grades</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPinned" className="text-sm text-slate-700">Pin this announcement</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAnnouncement ? 'Update' : 'Create'} Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TeacherAnnouncements;
