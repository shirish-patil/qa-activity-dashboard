import { jwtDecode } from "jwt-decode";
import axios from 'axios';

const AUTH_TOKEN_KEY = 'qa_dashboard_token';
const API_URL = 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const auth = {
  login: async (email, password) => {
    try {
      // Test connection first
      const testResponse = await api.get('/api/test');
      console.log('Backend connection test:', testResponse.data);

      // Proceed with login
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);
      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      
      // Set token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (error) {
      console.error('Login error details:', error);
      if (error.response) {
        // The request was made and server responded with error
        throw new Error(error.response.data.message || 'Login failed');
      } else if (error.request) {
        // The request was made but no response received
        throw new Error('No response from server. Please try again.');
      } else {
        // Error in setting up the request
        throw new Error('Error connecting to server. Please try again.');
      }
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
  },

  getCurrentUser: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  }
};

export default auth;
