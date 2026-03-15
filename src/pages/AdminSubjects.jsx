import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  Users,
  FolderOpen,
  RefreshCw,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useToast } from '../components/common/Toast';

export const AdminSubjects = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  
  // Form states
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: '',
    department: 'General',
    credits: 1,
    isActive: true
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, gradesRes] = await Promise.all([
        adminAPI.getAllSubjects(),
        adminAPI.getAllGrades()
      ]);
      
      if (subjectsRes.success) setSubjects(subjectsRes.data || []);
      if (gradesRes.success) setGrades(gradesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await adminAPI.deleteSubject(subjectId);
      setSubjects(subjects.filter(s => s.id !== subjectId));
      addToast('Subject deleted successfully', 'success');
    } catch (err) {
      addToast('Failed to delete subject', 'error');
    }
  };

  const handleToggleStatus = async (subjectId, currentStatus) => {
    try {
      await adminAPI.updateSubjectStatus(subjectId, !currentStatus);
      setSubjects(subjects.map(s => 
        s.id === subjectId ? { ...s, is_active: !currentStatus } : s
      ));
      addToast('Subject status updated', 'success');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleAddClick = () => {
    setSubjectForm({
      name: '',
      code: '',
      description: '',
      department: 'General',
      credits: 1,
      isActive: true
    });
    setShowAddModal(true);
  };

  const handleEditClick = (subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      name: subject.name || '',
      code: subject.code || '',
      description: subject.description || '',
      department: subject.department || 'General',
      credits: subject.credits || 1,
      isActive: subject.is_active !== false
    });
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await adminAPI.createSubject(subjectForm);
      
      if (response.success) {
        setSubjects([...subjects, response.data]);
        addToast('Subject created successfully', 'success');
        setShowAddModal(false);
      }
    } catch (err) {
      console.error('Failed to create subject:', err);
      addToast('Failed to create subject', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    if (!editingSubject) return;
    
    setIsSaving(true);
    try {
      await adminAPI.updateSubject(editingSubject.id, subjectForm);
      
      // Update local state
      setSubjects(subjects.map(s => 
        s.id === editingSubject.id 
          ? { 
              ...s, 
              name: subjectForm.name,
              code: subjectForm.code,
              description: subjectForm.description,
              department: subjectForm.department,
              credits: subjectForm.credits,
              is_active: subjectForm.isActive
            } 
          : s
      ));
      
      addToast('Subject updated successfully', 'success');
      setEditingSubject(null);
    } catch (err) {
      console.error('Failed to update subject:', err);
      addToast('Failed to update subject', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      subject.name?.toLowerCase().includes(query) ||
      subject.code?.toLowerCase().includes(query) ||
      subject.description?.toLowerCase().includes(query)
    );
  });

  // No grade grouping since modules don't have grade_id
  const subjectsList = filteredSubjects;

  const stats = {
    total: subjects.length,
    active: subjects.filter(s => s.is_active).length,
    inactive: subjects.filter(s => !s.is_active).length,
    totalGrades: grades.length
  };

  // Subject Form Modal Component (used for both add and edit)
  const SubjectFormModal = ({ isEdit = false, onClose, onSubmit }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isEdit ? 'Edit Subject' : 'Add New Subject'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Mathematics"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., MATH-10"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={subjectForm.description}
                onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Brief description of the subject..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={subjectForm.department}
                  onChange={(e) => setSubjectForm({...subjectForm, department: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={subjectForm.credits}
                  onChange={(e) => setSubjectForm({...subjectForm, credits: parseInt(e.target.value) || 1})}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={subjectForm.isActive}
                onChange={(e) => setSubjectForm({...subjectForm, isActive: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">
                Subject Active
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {isEdit ? 'Save Changes' : 'Add Subject'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Manage Subjects</h1>
            <p className="text-slate-500 dark:text-slate-400">Organize subjects and modules</p>
          </div>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Subjects</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Inactive</p>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Grades</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalGrades}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
          <button
            onClick={fetchData}
            className="p-2 text-slate-400 hover:text-slate-600"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Subjects List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : subjectsList.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No subjects found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {subjectsList.map((subject) => (
              <div key={subject.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                      {subject.code?.[0] || subject.name?.[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{subject.name}</h4>
                      <p className="text-sm text-slate-500">Code: {subject.code}</p>
                      {subject.description && (
                        <p className="text-sm text-slate-400 mt-1">{subject.description}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {subject.department} • {subject.credits} credit{subject.credits !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {subject.student_count || 0} students
                      </span>
                      <span className="flex items-center gap-1">
                        <FolderOpen className="w-4 h-4" />
                        {subject.material_count || 0} materials
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(subject.id, subject.is_active)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        subject.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {subject.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {subject.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEditClick(subject)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <SubjectFormModal
          isEdit={false}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateSubject}
        />
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <SubjectFormModal
          isEdit={true}
          onClose={() => setEditingSubject(null)}
          onSubmit={handleUpdateSubject}
        />
      )}
    </div>
  );
};
