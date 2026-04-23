import axios from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
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

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh_token: refreshToken,
          });

          // Handle different response formats
          const tokens = response.data?.data?.tokens || response.data?.tokens || response.data;
          const access = tokens?.access || tokens?.access_token || access;
          
          if (access) {
            localStorage.setItem('access_token', access);
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and force page reload to reset auth state
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Force page reload to reset authentication state
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh_token: refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh/', { refresh_token: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  health: () => api.get('/auth/health/'),
};

export const profilesAPI = {
  getMyProfile: () => api.get('/profiles/me/'),
  updateProfile: (data) => api.patch('/profiles/update_me/', data),
  getProfile: (id) => api.get(`/profiles/${id}/`),
  searchAgents: (params) => api.get('/profiles/search_agents/', { params }),
  getAgentProperties: (id, params) => api.get(`/profiles/${id}/properties/`, { params }),
  getAgentReviews: (id, params) => api.get(`/profiles/${id}/reviews/`, { params }),
  toggleAgentStatus: () => api.post('/profiles/toggle_agent/'),
};

export const propertiesAPI = {
  getProperties: (params) => api.get('/properties/', { params }),
  getProperty: (id) => api.get(`/properties/${id}/`),
  createProperty: (data, isFormData = false) => api.post('/properties/', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  updateProperty: (id, data) => api.patch(`/properties/${id}/`, data),
  deleteProperty: (id) => api.delete(`/properties/${id}/`),
  addImage: (id, data, isFormData = false) => api.post(`/properties/${id}/images/`, data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  getPropertyImages: (id) => api.get(`/properties/${id}/images_list/`),
  getMyProperties: (params) => api.get('/my_properties/', { params }),
};

export const reviewsAPI = {
  getReviews: (params) => api.get('/reviews/', { params }),
  getReview: (id) => api.get(`/reviews/${id}/`),
  createReview: (data) => api.post('/reviews/', data),
  updateReview: (id, data) => api.patch(`/reviews/${id}/`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}/`),
  getMyReviews: (params) => api.get('/reviews/my_reviews/', { params }),
  getAgentSummary: (params) => api.get('/reviews/agent_summary/', { params }),
  canReview: (params) => api.get('/reviews/can_review/', { params }),
  getReceivedReviews: (agentId, params) => api.get(`/profiles/${agentId}/reviews/`, { params }),
};

export const visitsAPI = {
  getVisitRequests: (params) => api.get('/visit-requests/', { params }),
  getVisitRequest: (id) => api.get(`/visit-requests/${id}/`),
  createVisitRequest: (data) => api.post('/visit-requests/', data),
  updateVisitRequest: (id, data) => api.patch(`/visit-requests/${id}/`, data),
  cancelVisitRequest: (id) => api.post(`/visit-requests/${id}/cancel/`),
  getMyRequests: (params) => api.get('/my_requests/', { params }),
  getAgentRequests: (params) => api.get('/agent_requests/', { params }),
  getPropertyRequests: (params) => api.get('/property_requests/', { params }),
  getSummary: (params) => api.get('/summary/', { params }),
};

export default api;
