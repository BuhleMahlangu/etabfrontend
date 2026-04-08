import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');
  
  console.log('🔍 [API] Raw token from localStorage:', token ? 'exists' : 'missing');
  console.log('🔍 [API] Token type:', typeof token);
  
  if (token) {
    // Log first/last chars to see if there are quotes
    console.log('🔍 [API] Token starts with:', token.charAt(0));
    console.log('🔍 [API] Token ends with:', token.charAt(token.length - 1));
    
    // Aggressive cleaning - remove ALL quotes, whitespace, and newlines
    token = token
      .replace(/^["']|["']$/g, '')  // Remove surrounding quotes
      .replace(/\\"/g, '"')         // Remove escaped quotes
      .trim();                      // Remove whitespace
    
    console.log('🔍 [API] Cleaned token length:', token.length);
    console.log('🔍 [API] Cleaned token starts with:', token.substring(0, 20));
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ [API] Token attached to:', config.url);
    } else {
      console.log('❌ [API] Token became empty after cleaning');
    }
  } else {
    console.log('⚠️ [API] No token found for:', config.url);
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('❌ [API] Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('🚫 [API] 401 error - clearing token and redirecting');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const subjectAPI = {
  getMySubjects: () => api.get('/subjects/my-subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  getMaterials: (subjectId) => api.get(`/subjects/${subjectId}/materials`),
};

export const materialAPI = {
  getAll: (params) => api.get('/materials', { params }),
  getById: (id) => api.get(`/materials/${id}`),
  getBySubject: (subjectId) => api.get(`/materials/subject/${subjectId}`),
  upload: (formData) => api.post('/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/materials/${id}`),
};

// Download API - uses proxy endpoint for proper filename support
export const downloadAPI = {
  material: (id) => `${API_URL}/download/materials/${id}`,
};

export const deadlineAPI = {
  getMyDeadlines: () => api.get('/deadlines/my-deadlines'),
  getBySubject: (subjectId) => api.get(`/deadlines/subject/${subjectId}`),
};

export const notificationAPI = {
  getMyNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getStats: () => api.get('/notifications/stats'),
  sendGlobal: (data) => api.post('/notifications/global', data),
};

export const supportAPI = {
  // User routes
  sendMessage: (data) => api.post('/support/messages', data),
  getMyMessages: () => api.get('/support/my-messages'),
};

export const subjectMessageAPI = {
  // Send message in a subject
  sendMessage: (data) => api.post('/subject-messages/messages', data),
  // Get conversations for current user
  getConversations: () => api.get('/subject-messages/conversations'),
  // Get messages for a specific subject
  getSubjectMessages: (subjectId, otherUserId) => api.get(`/subject-messages/subject/${subjectId}`, { params: { otherUserId } }),
  // Get unread count
  getUnreadCount: () => api.get('/subject-messages/unread-count'),
  // Mark messages as read
  markAsRead: (data) => api.put('/subject-messages/mark-read', data),
  // Teacher routes
  getTeacherSubjects: () => api.get('/subject-messages/teacher/subjects'),
  getSubjectLearners: (subjectId) => api.get(`/subject-messages/teacher/subject/${subjectId}/learners`),
};

export const announcementAPI = {
  getAll: (params) => api.get('/announcements', { params }),
  getMyAnnouncements: () => api.get('/announcements/my-announcements'),
  getRecent: (limit) => api.get(`/announcements/recent?limit=${limit || 5}`),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const assignmentAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  getMyAssignments: (status) => api.get('/assignments/my-assignments', { params: status ? { status } : {} }),
  getUpcomingDeadlines: (limit) => api.get(`/assignments/upcoming-deadlines?limit=${limit || 5}`),
  getById: (id) => api.get(`/assignments/${id}`),
  getSubmissions: (assignmentId) => api.get(`/assignments/${assignmentId}/submissions`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  submit: (assignmentId, formData) => api.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  gradeSubmission: (submissionId, data) => api.post(`/assignments/submissions/${submissionId}/grade`, data),
  extendDueDate: (id, data) => api.post(`/assignments/${id}/extend-due-date`, data),
  // Download submission file - returns URL to the proxy endpoint
  downloadSubmission: (submissionId) => `${API_URL}/assignments/submissions/${submissionId}/download`,
};

export const quizAPI = {
  getAll: (params) => api.get('/quizzes', { params }),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  publish: (id) => api.post(`/quizzes/${id}/publish`),
  unpublish: (id) => api.post(`/quizzes/${id}/unpublish`),
  startAttempt: (quizId) => api.post(`/quizzes/${quizId}/start`),
  submitAnswer: (attemptId, data) => api.post(`/quizzes/attempts/${attemptId}/answer`, data),
  submitQuiz: (attemptId, data) => api.post(`/quizzes/attempts/${attemptId}/submit`, data),
  getMyResults: () => api.get('/quizzes/my-results/all'),
  getStudentResults: (studentId) => api.get(`/quizzes/student/${studentId}/results`),
  getStatistics: (quizId) => api.get(`/quizzes/${quizId}/statistics`),
  // Teacher review
  getAttempts: (quizId) => api.get(`/quizzes/${quizId}/attempts`),
  resetStudentAttempt: (quizId, learnerId) => api.post(`/quizzes/${quizId}/reset/${learnerId}`),
  getAttemptForReview: (attemptId) => api.get(`/quizzes/attempts/${attemptId}/review`),
  overrideAnswerMark: (answerId, data) => api.put(`/quizzes/answers/${answerId}/override`, data),
  extendDueDate: (id, data) => api.post(`/quizzes/${id}/extend-due-date`, data),
};

export const teacherAPI = {
  getMyAssignments: () => api.get('/teachers/my-assignments'),
  getDashboard: () => api.get('/teachers/dashboard'),
  getMyStudents: () => api.get('/teachers/my-students'),
};

export const enrollmentAPI = {
  getMyEnrollments: () => api.get('/enrollments/my-enrollments'),
  getMyReport: () => api.get('/enrollments/my-report'),
  getHistory: (phase) => api.get(`/enrollments/history${phase ? `?phase=${phase}` : ''}`),
  updateMarks: (enrollmentId, marks) => api.put(`/enrollments/${enrollmentId}/marks`, marks),
};

export const progressAPI = {
  getMyProgress: () => api.get('/progress/my-progress'),
  getSubjectProgress: (subjectId) => api.get(`/progress/subject/${subjectId}`),
  getProgressHistory: (months = 6) => api.get(`/progress/history?months=${months}`),
};

export const aiTutorAPI = {
  ask: (data) => api.post('/ai-tutor/ask', data),
  getHistory: (subject) => api.get(`/ai-tutor/history${subject ? `?subject=${subject}` : ''}`),
};

export const schoolAPI = {
  register: (data) => api.post('/schools/register', data), // Public endpoint
  getMySchool: () => api.get('/schools/my'),
  updateMySchool: (data) => api.put('/schools/my', data),
  getAllSchools: () => api.get('/schools'),
  updateSubscription: (schoolId, data) => api.put(`/schools/${schoolId}/subscription`, data),
};

export const adminAPI = {
  // Users
  getAllUsers: () => api.get('/admin/users'),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  
  // Subjects
  getAllSubjects: () => api.get('/admin/subjects'),
  getSubject: (id) => api.get(`/admin/subjects/${id}`),
  createSubject: (data) => api.post('/admin/subjects', data),
  updateSubject: (id, data) => api.put(`/admin/subjects/${id}`, data),
  getAllGrades: () => api.get('/admin/grades'),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),
  updateSubjectStatus: (id, isActive) => api.put(`/admin/subjects/${id}/status`, { isActive }),
  
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),
  getPendingTeachers: () => api.get('/admin/teachers/pending'),
  approveTeacher: (id) => api.post(`/admin/teachers/${id}/approve`),
  rejectTeacher: (id, reason) => api.post(`/admin/teachers/${id}/reject`, { reason }),
  
  // Support Messages
  getAllSupportMessages: (params) => api.get('/support/admin/messages', { params }),
  getSupportMessage: (id) => api.get(`/support/admin/messages/${id}`),
  respondToMessage: (id, data) => api.put(`/support/admin/messages/${id}/respond`, data),
  updateMessageStatus: (id, status) => api.put(`/support/admin/messages/${id}/status`, { status }),
  deleteMessage: (id) => api.delete(`/support/admin/messages/${id}`),
};

export const settingsAPI = {
  // Get current user settings
  getSettings: () => api.get('/settings'),
  
  // Update profile (works for both teachers and learners)
  updateProfile: (data) => api.put('/settings/profile', data),
  
  // Password change with 2-step verification
  requestPasswordChange: (currentPassword) => api.post('/settings/password/request-change', { currentPassword }),
  verifyAndChangePassword: (verificationCode, newPassword) => api.post('/settings/password/verify-change', { 
    verificationCode, 
    newPassword 
  }),
  resend2FACode: () => api.post('/settings/password/resend-code'),
  
  // Notification preferences
  updateNotificationPreferences: (emailNotifications) => api.put('/settings/notifications', { emailNotifications }),
};

export default api;
