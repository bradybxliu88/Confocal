import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  getCurrentUser: () => api.get('/auth/me'),
};

// Dashboard endpoints
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: (limit?: number) => api.get('/dashboard/activity', { params: { limit } }),
  getAlerts: () => api.get('/dashboard/alerts'),
  markAlertAsRead: (id: string) => api.patch(`/dashboard/alerts/${id}/read`),
  markAllAlertsAsRead: () => api.patch('/dashboard/alerts/read-all'),
};

// Projects endpoints
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMember: (id: string, userId: string, role?: string) =>
    api.post(`/projects/${id}/members`, { userId, role }),
  removeMember: (id: string, memberId: string) =>
    api.delete(`/projects/${id}/members/${memberId}`),
  addUpdate: (id: string, content: string, milestone?: boolean) =>
    api.post(`/projects/${id}/updates`, { content, milestone }),
  getInsights: (id: string) => api.get(`/projects/${id}/insights`),
};

// Protocols endpoints
export const protocolsAPI = {
  getAll: (params?: any) => api.get('/protocols', { params }),
  getById: (id: string) => api.get(`/protocols/${id}`),
  create: (data: any) => api.post('/protocols', data),
  update: (id: string, data: any) => api.put(`/protocols/${id}`, data),
  delete: (id: string) => api.delete(`/protocols/${id}`),
  getCategories: () => api.get('/protocols/categories/list'),
};

// Reagents endpoints
export const reagentsAPI = {
  getAll: (params?: any) => api.get('/reagents', { params }),
  getById: (id: string) => api.get(`/reagents/${id}`),
  create: (data: any) => api.post('/reagents', data),
  update: (id: string, data: any) => api.put(`/reagents/${id}`, data),
  delete: (id: string) => api.delete(`/reagents/${id}`),
  scanBarcode: (barcode: string) => api.get(`/reagents/scan/${barcode}`),
  getStorageSuggestions: (data: any) =>
    api.post('/reagents/suggestions/storage', data),
  getLowStockAlerts: () => api.get('/reagents/alerts/low-stock'),
  getExpiringReagents: () => api.get('/reagents/alerts/expiring'),
};

// Equipment endpoints
export const equipmentAPI = {
  getAll: () => api.get('/equipment'),
  getById: (id: string) => api.get(`/equipment/${id}`),
  create: (data: any) => api.post('/equipment', data),
  update: (id: string, data: any) => api.put(`/equipment/${id}`, data),
  delete: (id: string) => api.delete(`/equipment/${id}`),
  getSchedule: (id: string, startDate?: Date, endDate?: Date) =>
    api.get(`/equipment/${id}/schedule`, {
      params: { startDate, endDate },
    }),
  getAllBookings: (params?: any) => api.get('/equipment/bookings/all', { params }),
  createBooking: (data: any) => api.post('/equipment/bookings', data),
  updateBooking: (id: string, data: any) =>
    api.put(`/equipment/bookings/${id}`, data),
  deleteBooking: (id: string) => api.delete(`/equipment/bookings/${id}`),
};

// Orders endpoints
export const ordersAPI = {
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  update: (id: string, data: any) => api.put(`/orders/${id}`, data),
  delete: (id: string) => api.delete(`/orders/${id}`),
  updateStatus: (id: string, status: string, data?: any) =>
    api.patch(`/orders/${id}/status`, { status, ...data }),
  getPendingApprovals: () => api.get('/orders/pending-approvals'),
};

// Users endpoints
export const usersAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/users/change-password', { currentPassword, newPassword }),
};
