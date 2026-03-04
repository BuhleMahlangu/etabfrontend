import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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