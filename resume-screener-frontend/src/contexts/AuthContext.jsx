import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set the auth token for all requests
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data
          const response = await apiClient.get('/me');
          setUser(response.data);
        } catch (error) {
          console.error('Error initializing auth:', error);
          // If there's an error, clear the invalid token
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/login', { email, password });
    const { access_token, user } = response.data;
    
    localStorage.setItem('token', access_token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    setAuthToken(access_token);
    setUser(user);
    
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setAuthToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(prev => ({
      ...prev,
      ...userData
    }));
  };

  const value = {
    authToken,
    user,
    isAuthenticated: !!authToken,
    loading,
    login,
    logout,
    updateUser,
    setAuthToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
