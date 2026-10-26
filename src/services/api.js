import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally. Redirect hanya ketika pengguna sedang berada di
// area admin dan kegagalan bukan berasal dari pemeriksaan sesi (/auth/me),
// supaya pengunjung publik dengan token kedaluwarsa tidak ikut terlempar.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAdminArea = window.location.pathname.startsWith('/admin')
      && window.location.pathname !== '/admin/login';
    if (status === 401 && isAdminArea && !url.includes('/auth/me')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================================
// AUTH
// ============================================================
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ============================================================
// SETTINGS (public)
// ============================================================
export const settingsAPI = {
  getAll: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  uploadPhoto: (key, file) => {
    const formData = new FormData();
    formData.append('key', key);
    formData.append('photo', file);
    return api.post('/settings/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deletePhoto: (key) => api.delete(`/settings/photo/${key}`),
};

// ============================================================
// STAFF / PEGAWAI
// ============================================================
export const staffAPI = {
  getAll: (params) => api.get('/staff', { params }),
  create: (formData) => api.post('/staff', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/staff/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/staff/${id}`),
};

// ============================================================
// NEWS
// ============================================================
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getBySlug: (slug) => api.get(`/news/${slug}`),
  create: (formData) => api.post('/news', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/news/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/news/${id}`),
};

// ============================================================
// ANNOUNCEMENTS
// ============================================================
export const announcementsAPI = {
  getAll: (params) => api.get('/announcements', { params }),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// ============================================================
// AGENDAS
// ============================================================
export const agendasAPI = {
  getAll: (params) => api.get('/agendas', { params }),
  create: (formData) => api.post('/agendas', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/agendas/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/agendas/${id}`),
};

// ============================================================
// SERVICES
// ============================================================
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// ============================================================
// FAQs
// ============================================================
export const faqsAPI = {
  getAll: (params) => api.get('/faqs', { params }),
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.put(`/faqs/${id}`, data),
  delete: (id) => api.delete(`/faqs/${id}`),
};

// ============================================================
// COMPLAINTS
// ============================================================
export const complaintsAPI = {
  submit: (data) => api.post('/complaints', data),
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  exportData: (params) => api.get('/complaints/export', {
    params,
    responseType: 'blob',
    // Pembuatan PDF/Excel untuk ribuan baris bisa melebihi timeout API biasa.
    timeout: 120000,
  }),
};

// ============================================================
// USERS
// ============================================================
export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  changePassword: (data) => api.put('/users/me/password', data),
};

// ============================================================
// STATS (dashboard)
// ============================================================
export const statsAPI = {
  get: () => api.get('/stats'),
};

// ============================================================
// ACTIVITY LOGS
// ============================================================
export const activityAPI = {
  getAll: (params) => api.get('/activity', { params }),
};
