import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080'
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-logout for password change errors
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/api/auth/change-password')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const generateAISummary = async (startDate, endDate, query) => {
  try {
    const response = await api.post('/api/ai/summary', {
      startDate,
      endDate,
      query
    });
    return response.data;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};



export default api;
