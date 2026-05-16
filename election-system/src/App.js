import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import ElectionDetailPage from './pages/public/ElectionDetailPage';
import ResultsPage from './pages/public/ResultsPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequests from './pages/admin/AdminRequests';
import AdminElections from './pages/admin/AdminElections';
import AdminUsers from './pages/admin/AdminUsers';
import AuditLogs from './pages/admin/AuditLogs';

// Creator Pages
import CreatorDashboard from './pages/creator/CreatorDashboard';
import CreateElection from './pages/creator/CreateElection';
import ManageCandidates from './pages/creator/ManageCandidates';
import VoterList from './pages/creator/VoterList';
import ElectionControl from './pages/creator/ElectionControl';

// Voter Pages
import VoterDashboard from './pages/voter/VoterDashboard';
import VotingPage from './pages/voter/VotingPage';
import MyElections from './pages/voter/MyElections';

import Navbar from './components/shared/Navbar';
import LoadingSpinner from './components/shared/LoadingSpinner';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(profile?.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
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
        <Route path="/creator/election/:id/candidates" element={<ProtectedRoute allowedRoles={['election_creator','super_admin']}><ManageCandidates /></ProtectedRoute>} />
        <Route path="/creator/election/:id/voters" element={<ProtectedRoute allowedRoles={['election_creator','super_admin']}><VoterList /></ProtectedRoute>} />
        <Route path="/creator/election/:id/control" element={<ProtectedRoute allowedRoles={['election_creator','super_admin']}><ElectionControl /></ProtectedRoute>} />

        {/* Voter */}
        <Route path="/voter" element={<ProtectedRoute allowedRoles={['voter','election_creator','super_admin']}><VoterDashboard /></ProtectedRoute>} />
        <Route path="/vote/:id" element={<ProtectedRoute allowedRoles={['voter','election_creator','super_admin']}><VotingPage /></ProtectedRoute>} />
        <Route path="/voter/my-elections" element={<ProtectedRoute allowedRoles={['voter','election_creator','super_admin']}><MyElections /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer position="top-right" theme="dark" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
