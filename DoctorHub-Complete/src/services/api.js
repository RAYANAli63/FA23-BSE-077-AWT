import { supabase } from './supabase';

// ── Auth ────────────────────────────────────────────────────
export const registerUser = async (formData) => {
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
        role: formData.role || 'patient',
        specialization: formData.specialization || null,
        treatment_type: formData.treatmentType || null,
      }
    }
  });
  if (error) throw { response: { data: { message: error.message } } };
  return { data };
};

export const loginUser = async (formData) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });
  if (error) throw { response: { data: { message: error.message } } };

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return { data: { token: data.session.access_token, user: profile } };
};

export const getMe = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw { response: { data: { message: 'Not authenticated' } } };
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { data: { user: data } };
};

export const createStaff = async (formData) => {
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
        role: formData.role,
        specialization: formData.specialization || null,
        treatment_type: formData.treatmentType || null,
      }
    }
  });
  if (error) throw { response: { data: { message: error.message } } };
  return { data };
};

// ── Doctors ─────────────────────────────────────────────────
export const getDoctors = async ({ treatmentType, disease, city, search, page = 1, limit = 9 } = {}) => {
  const from = (page - 1) * limit;

  let query = supabase
    .from('doctor_profiles')
    .select('*', { count: 'exact' })
    .eq('is_verified', true)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .range(from, from + limit - 1);

  if (treatmentType) query = query.eq('treatment_type', treatmentType);
  if (disease) query = query.contains('diseases', [disease]);

  const { data, error, count } = await query;
  if (error) throw { response: { data: { message: error.message } } };

  let doctors = data || [];
  if (city) doctors = doctors.filter(d => d.clinics?.some(c => c.city?.toLowerCase().includes(city.toLowerCase())));
  if (search) {
    const rx = new RegExp(search, 'i');
    doctors = doctors.filter(d => rx.test(d.name) || rx.test(d.specialization));
  }

  return { data: { doctors, total: count, totalPages: Math.ceil((count || 0) / limit), currentPage: page } };
};

export const getDoctorById = async (id) => {
  const { data, error } = await supabase.from('doctor_profiles').select('*').eq('doctor_id', id).single();
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { doctor: data } };
};

export const getMyDoctorProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('doctor_profiles').select('*').eq('user_id', user.id).single();
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { doctor: data } };
};

export const updateDoctorProfile = async (updates) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();
  const { data, error } = await supabase.from('doctors').update(updates).eq('id', doc.id).select().single();
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { doctor: data } };
};

export const addClinic = async (clinicData) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();
  const { data, error } = await supabase.from('clinics').insert({ doctor_id: doc.id, ...clinicData }).select().single();
  if (error) throw { response: { data: { message: error.message } } };
  return { data };
};

export const verifyDoctor = async (doctorId, { isVerified }) => {
  const { data, error } = await supabase.from('doctors').update({ is_verified: isVerified }).eq('id', doctorId).select().single();
  if (error) throw { response: { data: { message: error.message } } };
  return { data };
};

// ── Appointments ─────────────────────────────────────────────
export const bookAppointment = async ({ doctorId, appointmentDate, timeSlot, symptoms, clinicIndex }) => {
  const { data: { user } } = await supabase.auth.getUser();

  // Get doctor profile
  const { data: doc } = await supabase.from('doctors').select('id, user_id, clinics(*)').eq('id', doctorId).single();
  if (!doc) throw { response: { data: { message: 'Doctor not found' } } };

  const clinic = doc.clinics?.[clinicIndex || 0];

  const { data, error } = await supabase.from('appointments').insert({
    patient_id: user.id,
    doctor_id: doc.user_id,
    doctor_profile_id: doc.id,
    clinic_id: clinic?.id || null,
    appointment_date: appointmentDate,
    time_slot: timeSlot,
    symptoms: symptoms || null,
    fee: clinic?.fee || 0,
    status: 'payment_pending',
  }).select().single();

  if (error) throw { response: { data: { message: error.message } } };
  return { data: { appointment: data } };
};

export const getMyAppointments = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('appointment_details')
    .select('*')
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { appointments: data || [] } };
};

export const getDoctorAppointments = async (params = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  let query = supabase.from('appointment_details').select('*').eq('doctor_id', user.id).order('appointment_date');
  if (params.status) query = query.eq('status', params.status);
  const { data, error } = await query;
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { appointments: data || [] } };
};

export const getPendingAppointments = async () => {
  const { data, error } = await supabase
    .from('appointment_details').select('*').eq('status', 'payment_uploaded').order('created_at', { ascending: false });
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { appointments: data || [] } };
};

export const getAllAppointments = async (params = {}) => {
  const { status, page = 1, limit = 20 } = params;
  const from = (page - 1) * limit;
  let query = supabase.from('appointment_details').select('*', { count: 'exact' })
    .order('created_at', { ascending: false }).range(from, from + limit - 1);
  if (status) query = query.eq('status', status);
  const { data, error, count } = await query;
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { appointments: data || [], total: count } };
};

export const confirmAppointment = async (id) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('appointments')
    .update({ status: 'confirmed', verified_by: user.id, verified_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { appointment: data } };
};

export const cancelAppointment = async (id) => {
  const { data, error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id).select().single();
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { appointment: data } };
};

export const completeAppointment = async (id) => {
  const { data, error } = await supabase.from('appointments').update({ status: 'completed' }).eq('id', id).select().single();
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { appointment: data } };
};

// ── Payments ─────────────────────────────────────────────────
export const uploadPayment = async (formData) => {
  const { data: { user } } = await supabase.auth.getUser();

  const appointmentId = formData.get('appointmentId');
  const method = formData.get('method');
  const transactionId = formData.get('transactionId');
  const amount = formData.get('amount');
  const screenshot = formData.get('screenshot');

  let screenshot_url = null;
  if (screenshot && screenshot.size > 0) {
    const ext = screenshot.name.split('.').pop();
    const path = `${user.id}/${appointmentId}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('payment-screenshots').upload(path, screenshot, { upsert: true });
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from('payment-screenshots').getPublicUrl(path);
      screenshot_url = urlData.publicUrl;
    }
  }

  // Remove old pending payment
  await supabase.from('payments').delete().eq('appointment_id', appointmentId).eq('status', 'pending');

  const { data, error } = await supabase.from('payments').insert({
    appointment_id: appointmentId,
    patient_id: user.id,
    amount: Number(amount),
    method,
    transaction_id: transactionId || null,
    screenshot_url,
    status: 'pending',
  }).select().single();

  if (error) throw { response: { data: { message: error.message } } };

  await supabase.from('appointments').update({ status: 'payment_uploaded' }).eq('id', appointmentId);
  return { data: { payment: data } };
};

export const getPendingPayments = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select(`*, patient:profiles!payments_patient_id_fkey(name,email,phone), appointment:appointments(appointment_date,time_slot,fee,doctor:profiles!appointments_doctor_id_fkey(name))`)
    .eq('status', 'pending').order('created_at', { ascending: false });
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { payments: data || [] } };
};

export const getMyPayments = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('payments')
    .select('*, appointment:appointments(appointment_date, time_slot)')
    .eq('patient_id', user.id).order('created_at', { ascending: false });
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { payments: data || [] } };
};

export const verifyPayment = async (id, { action, rejectionReason }) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: pay } = await supabase.from('payments').select('appointment_id').eq('id', id).single();

  const { data, error } = await supabase.from('payments').update({
    status: action === 'verify' ? 'verified' : 'rejected',
    verified_by: user.id,
    verified_at: new Date().toISOString(),
    rejection_reason: rejectionReason || null,
  }).eq('id', id).select().single();

  if (error) throw { response: { data: { message: error.message } } };

  await supabase.from('appointments').update({
    status: action === 'verify' ? 'confirmed' : 'payment_pending',
    verified_by: action === 'verify' ? user.id : null,
  }).eq('id', pay.appointment_id);

  return { data: { payment: data } };
};

// ── Medical History ──────────────────────────────────────────
export const addMedicalHistory = async (formData) => {
  const { data: { user } } = await supabase.auth.getUser();
  const patientId = formData.get('patientId');
  const appointmentId = formData.get('appointmentId');
  const diagnosis = formData.get('diagnosis');
  const symptoms = formData.get('symptoms');
  const notes = formData.get('notes');
  const reportFiles = formData.getAll('reportFiles').filter(f => f.size > 0);

  const reportUrls = [];
  for (const file of reportFiles) {
    const path = `${patientId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('medical-reports').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('medical-reports').getPublicUrl(path);
      reportUrls.push(data.publicUrl);
    }
  }

  const { data, error } = await supabase.from('medical_history').insert({
    patient_id: patientId,
    doctor_id: user.id,
    appointment_id: appointmentId || null,
    diagnosis,
    symptoms: symptoms ? symptoms.split(',').map(s => s.trim()).filter(Boolean) : [],
    notes: notes || null,
    report_urls: reportUrls,
  }).select(`*, doctor:profiles!medical_history_doctor_id_fkey(name,email,avatar_url), patient:profiles!medical_history_patient_id_fkey(name,email)`).single();

  if (error) throw { response: { data: { message: error.message } } };
  if (appointmentId) await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointmentId);
  return { data: { record: data } };
};

export const getMedicalHistory = async (params = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  let query = supabase.from('medical_history')
    .select(`*, doctor:profiles!medical_history_doctor_id_fkey(name,email,avatar_url), patient:profiles!medical_history_patient_id_fkey(name,email)`)
    .order('created_at', { ascending: false });

  if (profile?.role === 'patient') query = query.eq('patient_id', user.id);
  else if (profile?.role === 'doctor') {
    if (params.patientId) query = query.eq('patient_id', params.patientId).eq('doctor_id', user.id);
    else query = query.eq('doctor_id', user.id);
  } else if (params.patientId) query = query.eq('patient_id', params.patientId);

  const { data, error } = await query;
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { history: data || [] } };
};

export const addPrescription = async (formData) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('prescriptions').insert({
    patient_id: formData.patientId,
    doctor_id: user.id,
    appointment_id: formData.appointmentId || null,
    medicines: typeof formData.medicines === 'string' ? JSON.parse(formData.medicines) : formData.medicines,
    advice: formData.advice || null,
    follow_up_date: formData.followUpDate || null,
    treatment_type: formData.treatmentType || 'allopathic',
  }).select(`*, doctor:profiles!prescriptions_doctor_id_fkey(name,email,avatar_url), patient:profiles!prescriptions_patient_id_fkey(name,email)`).single();
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { prescription: data } };
};

export const getPrescriptions = async (params = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  let query = supabase.from('prescriptions')
    .select(`*, doctor:profiles!prescriptions_doctor_id_fkey(name,email,avatar_url), patient:profiles!prescriptions_patient_id_fkey(name,email)`)
    .order('created_at', { ascending: false });

  if (profile?.role === 'patient') query = query.eq('patient_id', user.id);
  else if (profile?.role === 'doctor') {
    if (params.patientId) query = query.eq('patient_id', params.patientId).eq('doctor_id', user.id);
    else query = query.eq('doctor_id', user.id);
  }

  const { data, error } = await query;
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { prescriptions: data || [] } };
};

// ── Admin ────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const [users, doctors, patients, appointments, pendingPay, pending, confirmed] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'payment_uploaded'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
  ]);
  return { data: { stats: {
    totalUsers: users.count || 0, totalDoctors: doctors.count || 0,
    totalPatients: patients.count || 0, totalAppointments: appointments.count || 0,
    pendingPayments: pendingPay.count || 0, pendingAppointments: pending.count || 0,
    confirmedAppointments: confirmed.count || 0,
  }}};
};

export const getAllUsers = async ({ role, page = 1, limit = 20 } = {}) => {
  const from = (page - 1) * limit;
  let query = supabase.from('profiles').select('*', { count: 'exact' })
    .order('created_at', { ascending: false }).range(from, from + limit - 1);
  if (role) query = query.eq('role', role);
  const { data, error, count } = await query;
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { users: data || [], total: count } };
};

export const toggleUserStatus = async (id) => {
  const { data: current } = await supabase.from('profiles').select('is_active').eq('id', id).single();
  const { data, error } = await supabase.from('profiles')
    .update({ is_active: !current.is_active }).eq('id', id).select().single();
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { user: data, message: `User ${data.is_active ? 'activated' : 'deactivated'}.` } };
};

export const getUnverifiedDoctors = async () => {
  const { data, error } = await supabase.from('doctor_profiles').select('*').eq('is_verified', false);
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { doctors: data || [] } };
};

export default { loginUser, registerUser };
