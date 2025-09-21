import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import JobDetailPage from './pages/JobDetailPage';
import AllJobsPage from './pages/AllJobsPage';
import CandidatesPage from './pages/CandidatesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs"
            element={
              <ProtectedRoute>
                <AllJobsPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/candidates"
            element={
              <ProtectedRoute>
                <CandidatesPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/jobs/:jobId"
            element={
              <ProtectedRoute>
                <JobDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
