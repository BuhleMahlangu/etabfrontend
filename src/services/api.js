import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('etab_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('etab_token');
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
  getAll: () => api.get('/materials'),
  getById: (id) => api.get(`/materials/${id}`),
  upload: (formData) => api.post('/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/materials/${id}`),
};

export const deadlineAPI = {
  getMyDeadlines: () => api.get('/deadlines/my-deadlines'),
  getBySubject: (subjectId) => api.get(`/deadlines/subject/${subjectId}`),
};

export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications/my-notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const enrollmentAPI = {
  getMyReport: () => api.get('/enrollments/my-report'),
  updateMarks: (enrollmentId, marks) => api.put(`/enrollments/${enrollmentId}/marks`, marks),
};

export default api;