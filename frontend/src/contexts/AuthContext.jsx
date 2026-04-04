import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure axios base URL and credentials
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true // Important for cookies (Refresh Token)
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  // Initial load: Try to refresh token if we have a refresh cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await api.post('/auth/refresh');
        const { user, accessToken } = response.data;
        setUser(user);
        setAccessToken(accessToken);
        // Setup axios interceptor for the new token
        setupInterceptors(accessToken);
      } catch (error) {
        // No valid refresh token, user stays null
        console.log('No active session found');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Interceptor to add Bearer token to all requests
  const setupInterceptors = (token) => {
    api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  };

  /**
   * Register a new user
   */
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, accessToken } = response.data;
      setUser(user);
      setAccessToken(accessToken);
      setupInterceptors(accessToken);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  /**
   * Login with Password
   */
  const login = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      const { user, accessToken } = response.data;
      setUser(user);
      setAccessToken(accessToken);
      setupInterceptors(accessToken);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  /**
   * Request OTP
   */
  const requestOTP = async (identifier) => {
    try {
      const response = await api.post('/auth/otp/request', { identifier });
      return { success: true, message: response.data.message };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'OTP request failed');
    }
  };

  /**
   * Verify OTP
   */
  const verifyOTP = async (identifier, otp) => {
    try {
      const response = await api.post('/auth/otp/verify', { identifier, otp });
      const { user, accessToken } = response.data;
      setUser(user);
      setAccessToken(accessToken);
      setupInterceptors(accessToken);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
  };

  /**
   * Forgot Password
   */
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  };

  /**
   * Reset Password
   */
  const resetPassword = async (token, password) => {
    try {
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      const { user, accessToken } = response.data;
      setUser(user);
      setAccessToken(accessToken);
      setupInterceptors(accessToken);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Reset failed');
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await api.get('/auth/logout');
      setUser(null);
      setAccessToken(null);
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    accessToken,
    register,
    login,
    requestOTP,
    verifyOTP,
    forgotPassword,
    resetPassword,
    logout,
    api // Expose api for other services to use with auth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
