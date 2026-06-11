import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally — auto logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const registerUser    = (data) => API.post('/auth/register', data);
export const loginUser       = (data) => API.post('/auth/login', data);
export const getMe           = ()     => API.get('/auth/me');
export const createStaff     = (data) => API.post('/auth/create-staff', data);

// ── Doctors ───────────────────────────────────────────
export const getDoctors            = (params) => API.get('/doctors', { params });
export const getDoctorById         = (id)     => API.get(`/doctors/${id}`);
export const getMyDoctorProfile    = ()       => API.get('/doctors/me');
export const updateDoctorProfile   = (data)   => API.put('/doctors/profile', data);
export const addClinic             = (data)   => API.post('/doctors/clinic', data);
export const verifyDoctor          = (id, data) => API.put(`/doctors/${id}/verify`, data);

// ── Appointments ──────────────────────────────────────
export const bookAppointment       = (data)   => API.post('/appointments', data);
export const getMyAppointments     = ()       => API.get('/appointments/my');
export const getDoctorAppointments = (params) => API.get('/appointments/doctor', { params });
export const getPendingAppointments= ()       => API.get('/appointments/pending');
export const getAllAppointments     = (params) => API.get('/appointments', { params });
export const confirmAppointment    = (id)     => API.put(`/appointments/${id}/confirm`);
export const cancelAppointment     = (id)     => API.put(`/appointments/${id}/cancel`);
export const completeAppointment   = (id)     => API.put(`/appointments/${id}/complete`);

// ── Payments ──────────────────────────────────────────
export const uploadPayment    = (data) => API.post('/payments', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getPendingPayments = () => API.get('/payments/pending');
export const getMyPayments      = () => API.get('/payments/my');
export const verifyPayment      = (id, data) => API.put(`/payments/${id}/verify`, data);

// ── Medical History ───────────────────────────────────
export const addMedicalHistory = (data) => API.post('/history', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getMedicalHistory = (params) => API.get('/history', { params });
export const addPrescription   = (data)   => API.post('/history/prescription', data);
export const getPrescriptions  = (params) => API.get('/history/prescriptions', { params });

// ── Admin ─────────────────────────────────────────────
export const getDashboardStats   = ()       => API.get('/admin/stats');
export const getAllUsers          = (params) => API.get('/admin/users', { params });
export const toggleUserStatus    = (id)     => API.put(`/admin/users/${id}/toggle`);
export const getUnverifiedDoctors= ()       => API.get('/admin/doctors/unverified');

export default API;
