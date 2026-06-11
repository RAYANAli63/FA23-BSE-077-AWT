import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import Unauthorized from './pages/Unauthorized';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import BookAppointment from './pages/patient/BookAppointment';
import PaymentUploadPage from './pages/patient/PaymentUploadPage';
import MedicalHistoryPage from './pages/patient/MedicalHistoryPage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';
import AddMedicalRecord from './pages/doctor/AddMedicalRecord';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';

// Assistant Pages
import AssistantDashboard from './pages/assistant/AssistantDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateStaff from './pages/admin/CreateStaff';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

const WithNav = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const P = ({ roles, children }) => (
  <ProtectedRoute roles={roles}>
    <WithNav>{children}</WithNav>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#14b8a6', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<WithNav><LandingPage /></WithNav>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/doctors" element={<WithNav><DoctorsPage /></WithNav>} />
          <Route path="/doctors/:id" element={<WithNav><DoctorDetailPage /></WithNav>} />
          <Route path="/unauthorized" element={<WithNav><Unauthorized /></WithNav>} />

          {/* ── Patient ── */}
          <Route path="/patient/dashboard" element={<P roles={['patient']}><PatientDashboard /></P>} />
          <Route path="/patient/appointments" element={<P roles={['patient']}><PatientAppointments /></P>} />
          <Route path="/patient/history" element={<P roles={['patient']}><MedicalHistoryPage /></P>} />
          <Route path="/patient/prescriptions" element={<P roles={['patient']}><MedicalHistoryPage /></P>} />
          <Route path="/patient/pay/:appointmentId" element={<P roles={['patient']}><PaymentUploadPage /></P>} />
          <Route path="/book/:doctorId" element={<P roles={['patient']}><BookAppointment /></P>} />

          {/* ── Doctor ── */}
          <Route path="/doctor/dashboard" element={<P roles={['doctor']}><DoctorDashboard /></P>} />
          <Route path="/doctor/profile" element={<P roles={['doctor']}><DoctorProfile /></P>} />
          <Route path="/doctor/prescriptions" element={<P roles={['doctor']}><DoctorPrescriptions /></P>} />
          <Route path="/doctor/add-history/:appointmentId" element={<P roles={['doctor']}><AddMedicalRecord /></P>} />

          {/* ── Assistant ── */}
          <Route path="/assistant/dashboard" element={<P roles={['assistant']}><AssistantDashboard /></P>} />

          {/* ── Admin ── */}
          <Route path="/admin/dashboard" element={<P roles={['admin', 'super_admin']}><AdminDashboard /></P>} />
          <Route path="/admin/create-staff" element={<P roles={['admin', 'super_admin']}><CreateStaff /></P>} />

          {/* ── Super Admin ── */}
          <Route path="/superadmin/dashboard" element={<P roles={['super_admin']}><SuperAdminDashboard /></P>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
