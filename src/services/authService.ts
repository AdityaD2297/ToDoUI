import axios from 'axios';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

const api = axios.create({
  baseURL: '/', // Use Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<void> => {
    await api.post('/auth/register', userData);
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<any> => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      // If token is expired or invalid, clear it and throw error
      localStorage.removeItem('access_token');
      throw new Error('Session expired');
    }
  },
};
