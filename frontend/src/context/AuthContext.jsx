import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile to restore session on load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/profile');
          setUser(data);
        } catch (error) {
          console.error('Session restoration failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    
    // Fetch complete profile details (with doctor profile details if doctor)
    const profileRes = await api.get('/auth/profile');
    setUser(profileRes.data);
    return profileRes.data;
  };

  // Register handler
  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    
    // Fetch profile
    const profileRes = await api.get('/auth/profile');
    setUser(profileRes.data);
    return profileRes.data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update profile details
  const updateProfile = async (formData, isMultipart = false) => {
    const headers = isMultipart ? { 'Content-Type': 'multipart/form-data' } : {};
    const { data } = await api.put('/auth/profile', formData, { headers });
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
