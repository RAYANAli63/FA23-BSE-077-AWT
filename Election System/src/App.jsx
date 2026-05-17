import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'

import Navbar from './components/layout/Navbar.jsx'
import { LoadingPage } from './components/ui/index.jsx'

// Public
import LandingPage from './pages/public/LandingPage.jsx'
import ElectionDetailPage from './pages/public/ElectionDetailPage.jsx'
import ResultsPage from './pages/public/ResultsPage.jsx'

// Auth
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './pages/auth/AuthPages.jsx'

// Voter
import { VoterDashboard, VotingPage } from './pages/voter/VoterPages.jsx'

// Admin
import { AdminDashboard, AdminRequests, AdminElections, AdminUsers, AuditLogs } from './pages/admin/AdminPages.jsx'

// Creator
import { CreatorDashboard, CreateElection, EditElection, ManageCandidates, VoterListPage, ElectionControl } from './pages/creator/CreatorPages.jsx'

function ProtectedRoute({ children, roles }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingPage />
  if (!user) return <Navigate to="/login" replace />
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return <LoadingPage />

  const close = () => setSidebarOpen(false)
  const open  = () => setSidebarOpen(p => !p)

  const adminRoles = ['super_admin']
  const creatorRoles = ['election_creator', 'super_admin']

  return (
    <>
      <Navbar onMenuToggle={open} />
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

        {/* Voter */}
        <Route path="/voter" element={<ProtectedRoute><VoterDashboard /></ProtectedRoute>} />
        <Route path="/vote/:id" element={<ProtectedRoute><VotingPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={adminRoles}><AdminDashboard sidebarOpen={sidebarOpen} onClose={close} /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute roles={adminRoles}><AdminRequests sidebarOpen={sidebarOpen} onClose={close} /></ProtectedRoute>} />
        <Route path="/admin/elections" element={<ProtectedRoute roles={adminRoles}><AdminElections sidebarOpen={sidebarOpen} onClose={close} /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={adminRoles}><AdminUsers sidebarOpen={sidebarOpen} onClose={close} /></ProtectedRoute>} />
        <Route path="/admin/audit" element={<ProtectedRoute roles={adminRoles}><AuditLogs sidebarOpen={sidebarOpen} onClose={close} /></ProtectedRoute>} />

        {/* Creator */}
        <Route path="/creator" element={<ProtectedRoute><CreatorDashboard sidebarOpen={sidebarOpen} onClose={close} /></ProtectedRoute>} />
        <Route path="/creator/new" element={<ProtectedRoute roles={creatorRoles}><CreateElection sidebarOpen={sidebarOpen} onClose={close} /></ProtectedRoute>} />
        <Route path="/creator/election/:id/edit" element={<ProtectedRoute roles={creatorRoles}><EditElection sidebarOpen={sidebarOpen} onClose={close} /></ProtectedRoute>} />
        <Route path="/creator/election/:id/candidates" element={<ProtectedRoute roles={creatorRoles}><ManageCandidates sidebarOpen={sidebarOpen} onClose={close} /></ProtectedRoute>} />
        <Route path="/creator/election/:id/voters" element={<ProtectedRoute roles={creatorRoles}><VoterListPage sidebarOpen={sidebarOpen} onClose={close} /></ProtectedRoute>} />
        <Route path="/creator/election/:id/control" element={<ProtectedRoute roles={creatorRoles}><ElectionControl sidebarOpen={sidebarOpen} onClose={close} /></ProtectedRoute>} />

        {/* Dashboard redirect for old routes */}
        <Route path="/dashboard" element={<Navigate to="/voter" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  const [theme] = useState(localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Outfit, sans-serif',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
