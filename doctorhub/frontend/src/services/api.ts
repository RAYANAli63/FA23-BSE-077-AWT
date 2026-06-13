import { supabase } from './supabase';
import type {
  Profile, DoctorProfile, AppointmentDetail, Payment,
  MedicalHistory, Prescription, PaginatedResponse,
  BookAppointmentForm, UploadPaymentForm,
  AddHistoryForm, AddPrescriptionForm,
} from '../types/database';

// ── Auth ────────────────────────────────────────────────────

export const authService = {
  async register(name: string, email: string, password: string, role: string, extra?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, ...extra },
      },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ── Doctors ─────────────────────────────────────────────────

export const doctorService = {
  // Get paginated doctors with filters - uses view to prevent N+1
  async getDoctors(params: {
    page?: number;
    limit?: number;
    treatmentType?: string;
    disease?: string;
    city?: string;
    search?: string;
  }): Promise<PaginatedResponse<DoctorProfile>> {
    const { page = 1, limit = 9, treatmentType, disease, city, search } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('doctor_profiles')
      .select('*', { count: 'exact' })
      .eq('is_verified', true)
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .range(from, to);

    if (treatmentType) query = query.eq('treatment_type', treatmentType);
    if (disease) query = query.contains('diseases', [disease]);
    if (search) query = query.ilike('specialization', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    let result = data || [];

    // City filter (on clinics array)
    if (city) {
      result = result.filter((d: DoctorProfile) =>
        d.clinics?.some((c: any) => c.city?.toLowerCase().includes(city.toLowerCase()))
      );
    }

    // Name search
    if (search) {
      const regex = new RegExp(search, 'i');
      result = result.filter((d: DoctorProfile) => regex.test(d.name) || regex.test(d.specialization));
    }

    return {
      data: result,
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  async getDoctorById(doctorId: string): Promise<DoctorProfile> {
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('doctor_id', doctorId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getMyDoctorProfile(): Promise<DoctorProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateDoctorProfile(doctorId: string, updates: any) {
    const { data, error } = await supabase
      .from('doctors')
      .update(updates)
      .eq('id', doctorId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async addClinic(doctorId: string, clinic: any) {
    const { data, error } = await supabase
      .from('clinics')
      .insert({ doctor_id: doctorId, ...clinic })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async verifyDoctor(doctorId: string, isVerified: boolean) {
    const { data, error } = await supabase
      .from('doctors')
      .update({ is_verified: isVerified })
      .eq('id', doctorId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getUnverifiedDoctors(): Promise<DoctorProfile[]> {
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('is_verified', false)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },
};

// ── Appointments ─────────────────────────────────────────────

export const appointmentService = {
  async bookAppointment(form: BookAppointmentForm) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get doctor user_id from doctor_profile_id
    const { data: doctor } = await supabase
      .from('doctors')
      .select('user_id')
      .eq('id', form.doctor_profile_id)
      .single();

    if (!doctor) throw new Error('Doctor not found');

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.id,
        doctor_id: doctor.user_id,
        doctor_profile_id: form.doctor_profile_id,
        clinic_id: form.clinic_id || null,
        appointment_date: form.appointment_date,
        time_slot: form.time_slot,
        symptoms: form.symptoms || null,
        fee: form.fee,
        status: 'payment_pending',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getMyAppointments(): Promise<AppointmentDetail[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('appointment_details')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getDoctorAppointments(status?: string): Promise<AppointmentDetail[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('appointment_details')
      .select('*')
      .eq('doctor_id', user.id)
      .order('appointment_date', { ascending: true });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getPendingAppointments(): Promise<AppointmentDetail[]> {
    const { data, error } = await supabase
      .from('appointment_details')
      .select('*')
      .eq('status', 'payment_uploaded')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getAllAppointments(params: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = params;
    const from = (page - 1) * limit;

    let query = supabase
      .from('appointment_details')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return { data: data || [], count: count || 0 };
  },

  async updateStatus(appointmentId: string, status: string, extra?: any) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('appointments')
      .update({ status, verified_by: user?.id, verified_at: new Date().toISOString(), ...extra })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async cancelAppointment(appointmentId: string) {
    return this.updateStatus(appointmentId, 'cancelled');
  },

  async completeAppointment(appointmentId: string) {
    return this.updateStatus(appointmentId, 'completed');
  },
};

// ── Payments ─────────────────────────────────────────────────

export const paymentService = {
  async uploadPayment(form: UploadPaymentForm) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let screenshot_url: string | null = null;

    // Upload screenshot to Supabase Storage
    if (form.screenshot) {
      const ext = form.screenshot.name.split('.').pop();
      const path = `${user.id}/${form.appointment_id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(path, form.screenshot, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(path);

      screenshot_url = urlData.publicUrl;
    }

    // Delete any existing pending payment
    await supabase
      .from('payments')
      .delete()
      .eq('appointment_id', form.appointment_id)
      .eq('status', 'pending');

    // Create payment record
    const { data, error } = await supabase
      .from('payments')
      .insert({
        appointment_id: form.appointment_id,
        patient_id: user.id,
        amount: form.amount,
        method: form.method,
        transaction_id: form.transaction_id || null,
        screenshot_url,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update appointment status
    await supabase
      .from('appointments')
      .update({ status: 'payment_uploaded' })
      .eq('id', form.appointment_id);

    return data;
  },

  async getPendingPayments(): Promise<any[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        patient:profiles!payments_patient_id_fkey(name, email, phone),
        appointment:appointments(
          appointment_date, time_slot, fee,
          doctor:profiles!appointments_doctor_id_fkey(name)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async verifyPayment(paymentId: string, action: 'verify' | 'reject', rejectionReason?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const payment = await supabase
      .from('payments')
      .select('appointment_id')
      .eq('id', paymentId)
      .single();

    if (payment.error) throw new Error(payment.error.message);

    const newStatus = action === 'verify' ? 'verified' : 'rejected';
    const appointmentStatus = action === 'verify' ? 'confirmed' : 'payment_pending';

    const { data, error } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        rejection_reason: rejectionReason || null,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update appointment status
    await supabase
      .from('appointments')
      .update({
        status: appointmentStatus,
        verified_by: action === 'verify' ? user.id : null,
        verified_at: action === 'verify' ? new Date().toISOString() : null,
      })
      .eq('id', payment.data.appointment_id);

    return data;
  },

  async getMyPayments(): Promise<Payment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('payments')
      .select('*, appointment:appointments(appointment_date, time_slot)')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },
};

// ── Medical History ──────────────────────────────────────────

export const historyService = {
  async addMedicalHistory(form: AddHistoryForm) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const reportUrls: string[] = [];

    // Upload report files
    if (form.report_files?.length) {
      for (const file of form.report_files) {
        const path = `${form.patient_id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from('medical-reports')
          .upload(path, file);

        if (!error) {
          const { data } = supabase.storage.from('medical-reports').getPublicUrl(path);
          reportUrls.push(data.publicUrl);
        }
      }
    }

    const symptoms = form.symptoms
      ? form.symptoms.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const { data, error } = await supabase
      .from('medical_history')
      .insert({
        patient_id: form.patient_id,
        doctor_id: user.id,
        appointment_id: form.appointment_id || null,
        diagnosis: form.diagnosis,
        symptoms,
        notes: form.notes || null,
        report_urls: reportUrls,
      })
      .select(`
        *,
        doctor:profiles!medical_history_doctor_id_fkey(name, email, avatar_url),
        patient:profiles!medical_history_patient_id_fkey(name, email)
      `)
      .single();

    if (error) throw new Error(error.message);

    // Mark appointment completed
    if (form.appointment_id) {
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', form.appointment_id);
    }

    return data;
  },

  async getMedicalHistory(patientId?: string): Promise<MedicalHistory[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('medical_history')
      .select(`
        *,
        doctor:profiles!medical_history_doctor_id_fkey(name, email, avatar_url),
        patient:profiles!medical_history_patient_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false });

    if (profile?.role === 'patient') {
      query = query.eq('patient_id', user.id);
    } else if (profile?.role === 'doctor') {
      query = patientId
        ? query.eq('patient_id', patientId).eq('doctor_id', user.id)
        : query.eq('doctor_id', user.id);
    } else if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addPrescription(form: AddPrescriptionForm) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: form.patient_id,
        doctor_id: user.id,
        appointment_id: form.appointment_id || null,
        medicines: form.medicines,
        advice: form.advice || null,
        follow_up_date: form.follow_up_date || null,
        treatment_type: form.treatment_type,
      })
      .select(`
        *,
        doctor:profiles!prescriptions_doctor_id_fkey(name, email, avatar_url),
        patient:profiles!prescriptions_patient_id_fkey(name, email)
      `)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getPrescriptions(patientId?: string): Promise<Prescription[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:profiles!prescriptions_doctor_id_fkey(name, email, avatar_url),
        patient:profiles!prescriptions_patient_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false });

    if (profile?.role === 'patient') {
      query = query.eq('patient_id', user.id);
    } else if (profile?.role === 'doctor') {
      query = patientId
        ? query.eq('patient_id', patientId).eq('doctor_id', user.id)
        : query.eq('doctor_id', user.id);
    } else if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },
};

// ── Admin ────────────────────────────────────────────────────

export const adminService = {
  async getDashboardStats() {
    const [users, doctors, patients, appointments, pendingPayments] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const [pending, confirmed, completed] = await Promise.all([
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'payment_uploaded'),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    ]);

    return {
      totalUsers: users.count || 0,
      totalDoctors: doctors.count || 0,
      totalPatients: patients.count || 0,
      totalAppointments: appointments.count || 0,
      pendingPayments: pendingPayments.count || 0,
      pendingAppointments: pending.count || 0,
      confirmedAppointments: confirmed.count || 0,
      completedAppointments: completed.count || 0,
    };
  },

  async getAllUsers(role?: string, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (role) query = query.eq('role', role);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { users: data || [], total: count || 0 };
  },

  async toggleUserStatus(userId: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
