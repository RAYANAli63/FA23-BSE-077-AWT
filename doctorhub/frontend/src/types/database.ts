// ============================================================
// Doctor Hub - Complete TypeScript Types
// ============================================================

export type UserRole = 'super_admin' | 'admin' | 'doctor' | 'assistant' | 'patient';
export type TreatmentType = 'allopathic' | 'homeopathic' | 'herbal';
export type AppointmentStatus =
  | 'pending' | 'payment_pending' | 'payment_uploaded'
  | 'confirmed' | 'completed' | 'cancelled';
export type PaymentMethod = 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'cash';
export type PaymentStatus = 'pending' | 'verified' | 'rejected';

// ── Database Row Types ──────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  treatment_type: TreatmentType;
  diseases: string[];
  experience: number;
  qualification: string | null;
  bio: string | null;
  consultation_fee: number;
  available_days: string[];
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  id: string;
  doctor_id: string;
  name: string;
  address: string;
  city: string;
  timings: string | null;
  fee: number;
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  blood_group: string | null;
  address: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  emergency_relation: string | null;
  allergies: string[];
  chronic_diseases: string[];
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  doctor_profile_id: string;
  clinic_id: string | null;
  appointment_date: string;
  time_slot: string;
  status: AppointmentStatus;
  symptoms: string | null;
  notes: string | null;
  fee: number;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  appointment_id: string;
  patient_id: string;
  amount: number;
  method: PaymentMethod;
  transaction_id: string | null;
  screenshot_url: string | null;
  status: PaymentStatus;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalHistory {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  diagnosis: string;
  symptoms: string[];
  notes: string | null;
  report_urls: string[];
  created_at: string;
  // No updated_at - immutable
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  medicines: Medicine[];
  advice: string | null;
  follow_up_date: string | null;
  treatment_type: TreatmentType;
  created_at: string;
  // No updated_at - immutable
}

// ── View Types (joined data) ────────────────────────────────

export interface DoctorProfile extends Doctor {
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  doctor_id: string;
  clinics: Clinic[];
}

export interface AppointmentDetail extends Appointment {
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  patient_avatar: string | null;
  doctor_name: string;
  doctor_email: string;
  doctor_phone: string | null;
  specialization: string;
  treatment_type: TreatmentType;
  clinic_name: string | null;
  clinic_address: string | null;
  clinic_city: string | null;
  payment_id: string | null;
  payment_status: PaymentStatus | null;
  payment_amount: number | null;
  payment_method: PaymentMethod | null;
  screenshot_url: string | null;
}

// ── API Response Types ──────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Form Types ──────────────────────────────────────────────

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  specialization?: string;
  treatment_type?: TreatmentType;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface BookAppointmentForm {
  doctor_profile_id: string;
  clinic_id?: string;
  appointment_date: string;
  time_slot: string;
  symptoms?: string;
  fee: number;
}

export interface UploadPaymentForm {
  appointment_id: string;
  amount: number;
  method: PaymentMethod;
  transaction_id?: string;
  screenshot?: File;
}

export interface AddHistoryForm {
  patient_id: string;
  appointment_id?: string;
  diagnosis: string;
  symptoms?: string;
  notes?: string;
  report_files?: File[];
}

export interface AddPrescriptionForm {
  patient_id: string;
  appointment_id?: string;
  medicines: Medicine[];
  advice?: string;
  follow_up_date?: string;
  treatment_type: TreatmentType;
}
