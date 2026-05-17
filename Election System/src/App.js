import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './hooks/useAuth';

import Navbar from './components/shared/Navbar';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Public
import LandingPage from './pages/public/LandingPage';
import ElectionDetailPage from './pages/public/ElectionDetailPage';
import ResultsPage from './pages/public/ResultsPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequests from './pages/admin/AdminRequests';
import AdminElections from './pages/admin/AdminElections';
import AdminUsers from './pages/admin/AdminUsers';
import AuditLogs from './pages/admin/AuditLogs';

// Creator
import CreatorDashboard from './pages/creator/CreatorDashboard';
import CreateElection from './pages/creator/CreateElection';
import EditElection from './pages/creator/EditElection';
import ManageCandidates from './pages/creator/ManageCandidates';
import VoterListPage from './pages/creator/VoterListPage';
import ElectionControl from './pages/creator/ElectionControl';

// Voter
import VoterDashboard from './pages/voter/VoterDashboard';
import VotingPage from './pages/voter/VotingPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && profile && !allowedRoles.includes(profile.role))
    return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  const { loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/election/:id" element={<ElectionDetailPage />} />
        <Route path="/results/:id" element={<ResultsPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminRequests /></ProtectedRoute>} />
        <Route path="/admin/elections" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminElections /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['super_admin']}><AuditLogs /></ProtectedRoute>} />

        {/* Creator */}
        <Route path="/creator" element={<ProtectedRoute allowedRoles={['election_creator','super_admin']}><CreatorDashboard /></ProtectedRoute>} />
        <Route path="/creator/new" element={<ProtectedRoute allowedRoles={['election_creator','super_admin']}><CreateElection /></ProtectedRoute>} />
        <Route path="/creator/election/:id/edit" element={<ProtectedRoute allowedRoles={['election_creator','super_admin']}><EditElection /></ProtectedRoute>} />
        <Route path="/creator/election/:id/candidates" element={<ProtectedRoute allowedRoles={['election_creator','super_admin']}><ManageCandidates /></ProtectedRoute>} />
        <Route path="/creator/election/:id/voters" element={<ProtectedRoute allowedRoles={['election_creator','super_admin']}><VoterListPage /></ProtectedRoute>} />
        <Route path="/creator/election/:id/control" element={<ProtectedRoute allowedRoles={['election_creator','super_admin']}><ElectionControl /></ProtectedRoute>} />

        {/* Voter */}
        <Route path="/dashboard" element={<ProtectedRoute><VoterDashboard /></ProtectedRoute>} />
        <Route path="/vote/:id" element={<ProtectedRoute><VotingPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <ToastContainer position="top-right" theme={theme} autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
}
