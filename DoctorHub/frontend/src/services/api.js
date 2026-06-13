import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
const throwIfError = (error) => {
  if (error) throw new Error(error.message);
};

// ─────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────
export const getMe = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  throwIfError(error);
  return { data: { user: data } };
};

// Staff creation goes through backend (needs service role)
export const createStaff = async (payload) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/create-staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create staff');
  }
  return res.json();
};

// ─────────────────────────────────────────────────────────
// DOCTORS
// ─────────────────────────────────────────────────────────
export const getDoctors = async (params = {}) => {
  const { treatmentType, disease, city, search, page = 1, limit = 10 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('doctors')
    .select(`
      id, specialization, treatment_type, diseases, experience,
      qualification, bio, is_verified, rating, total_reviews,
      available_days, consultation_fee, created_at,
      user:profiles!doctors_user_id_fkey(id, name, email, phone, avatar_url),
      clinics(id, name, address, city, timings, fee)
    `, { count: 'exact' })
    .eq('is_verified', true)
    .range(from, to)
    .order('rating', { ascending: false });

  if (treatmentType) query = query.eq('treatment_type', treatmentType);
  if (disease) query = query.contains('diseases', [disease]);

  const { data, error, count } = await query;
  throwIfError(error);

  let doctors = data || [];

  // Client-side filter for city / search (after fetch)
  if (city) {
    doctors = doctors.filter(d =>
      d.clinics?.some(c => c.city?.toLowerCase().includes(city.toLowerCase()))
    );
  }
  if (search) {
    const re = new RegExp(search, 'i');
    doctors = doctors.filter(d => re.test(d.user?.name) || re.test(d.specialization));
  }

  return {
    data: {
      doctors,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
    }
  };
};

export const getDoctorById = async (id) => {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      user:profiles!doctors_user_id_fkey(id, name, email, phone, avatar_url),
      clinics(*),
      doctor_assistants(assistant:profiles!doctor_assistants_assistant_id_fkey(id, name, email, phone))
    `)
    .eq('id', id)
    .single();
  throwIfError(error);
  return { data: { doctor: data } };
};

export const getMyDoctorProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      user:profiles!doctors_user_id_fkey(id, name, email, phone, avatar_url),
      clinics(*),
      doctor_assistants(assistant:profiles!doctor_assistants_assistant_id_fkey(id, name, email))
    `)
    .eq('user_id', user.id)
    .single();
  throwIfError(error);
  return { data: { doctor: data } };
};

export const updateDoctorProfile = async (payload) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('doctors')
    .update({
      specialization: payload.specialization,
      treatment_type: payload.treatmentType || payload.treatment_type,
      diseases: payload.diseases,
      experience: payload.experience,
      qualification: payload.qualification,
      bio: payload.bio,
      available_days: payload.availableDays || payload.available_days,
      consultation_fee: payload.consultationFee || payload.consultation_fee,
    })
    .eq('user_id', user.id)
    .select()
    .single();
  throwIfError(error);
  return { data: { doctor: data } };
};

export const addClinic = async (payload) => {
  const { data: { user } } = await supabase.auth.getUser();
  // Get doctor id first
  const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();
  const { data, error } = await supabase
    .from('clinics')
    .insert({ ...payload, doctor_id: doc.id })
    .select()
    .single();
  throwIfError(error);
  return { data: { clinic: data } };
};

export const verifyDoctor = async (id, payload) => {
  const { data, error } = await supabase
    .from('doctors')
    .update({ is_verified: payload.isVerified })
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return { data: { doctor: data } };
};

// ─────────────────────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────────────────────
export const bookAppointment = async (payload) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { doctorId, appointmentDate, timeSlot, symptoms, clinicIndex } = payload;

  // Get doctor profile + clinic info
  const { data: doc } = await supabase
    .from('doctors')
    .select('*, clinics(*), user_id')
    .eq('id', doctorId)
    .single();

  const clinic = doc?.clinics?.[clinicIndex || 0] || {};
  const fee = clinic.fee || doc?.consultation_fee || 0;

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: user.id,
      doctor_id: doc.user_id,
      doctor_profile_id: doctorId,
      clinic_id: clinic.id || null,
      clinic_name: clinic.name || '',
      clinic_address: clinic.address || '',
      clinic_city: clinic.city || '',
      appointment_date: new Date(appointmentDate).toISOString(),
      time_slot: timeSlot,
      symptoms: symptoms || '',
      fee,
      status: 'payment_pending',
    })
    .select(`
      *,
      doctor:profiles!appointments_doctor_id_fkey(id, name, email, phone, avatar_url),
      doctor_profile:doctors!appointments_doctor_profile_id_fkey(specialization, treatment_type)
    `)
    .single();
  throwIfError(error);
  return { data: { appointment: data } };
};

export const getMyAppointments = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:profiles!appointments_doctor_id_fkey(id, name, email, phone, avatar_url),
      doctor_profile:doctors!appointments_doctor_profile_id_fkey(id, specialization, treatment_type)
    `)
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false });
  throwIfError(error);
  return { data: { appointments: data || [] } };
};

export const getDoctorAppointments = async (params = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { status } = params;
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patient:profiles!appointments_patient_id_fkey(id, name, email, phone, avatar_url)
    `)
    .eq('doctor_id', user.id)
    .order('appointment_date', { ascending: true });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  throwIfError(error);
  return { data: { appointments: data || [] } };
};

export const getPendingAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:profiles!appointments_patient_id_fkey(id, name, email, phone),
      doctor:profiles!appointments_doctor_id_fkey(id, name, email, phone)
    `)
    .eq('status', 'payment_uploaded')
    .order('created_at', { ascending: false });
  throwIfError(error);
  return { data: { appointments: data || [] } };
};

export const getAllAppointments = async (params = {}) => {
  const { status, page = 1, limit = 20 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('appointments')
    .select(`
      *,
      patient:profiles!appointments_patient_id_fkey(id, name, email),
      doctor:profiles!appointments_doctor_id_fkey(id, name, email)
    `, { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  throwIfError(error);
  return { data: { appointments: data || [], total: count } };
};

export const confirmAppointment = async (id) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'confirmed', verified_by: user.id, verified_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return { data: { appointment: data } };
};

export const cancelAppointment = async (id) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return { data: { appointment: data } };
};

export const completeAppointment = async (id) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'completed' })
    .eq('id', id)
    .eq('doctor_id', user.id)
    .eq('status', 'confirmed')
    .select()
    .single();
  throwIfError(error);
  return { data: { appointment: data } };
};

// ─────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────
export const uploadPayment = async (formData) => {
  const { data: { user } } = await supabase.auth.getUser();

  const appointmentId = formData.get('appointmentId');
  const method = formData.get('method');
  const transactionId = formData.get('transactionId');
  const amount = formData.get('amount');
  const screenshotFile = formData.get('screenshot');

  // Upload screenshot to Supabase Storage
  let screenshotUrl = null;
  if (screenshotFile && screenshotFile.size > 0) {
    const ext = screenshotFile.name.split('.').pop();
    const path = `${user.id}/${appointmentId}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('payment-screenshots')
      .upload(path, screenshotFile, { upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
      .from('payment-screenshots')
      .getPublicUrl(path);
    screenshotUrl = urlData.publicUrl;
  }

  // Delete old pending payments for this appointment
  await supabase.from('payments')
    .delete()
    .eq('appointment_id', appointmentId)
    .eq('status', 'pending');

  const { data, error } = await supabase
    .from('payments')
    .insert({
      appointment_id: appointmentId,
      patient_id: user.id,
      amount: Number(amount) || 0,
      method,
      transaction_id: transactionId || '',
      screenshot_url: screenshotUrl,
      status: 'pending',
    })
    .select()
    .single();
  throwIfError(error);

  // Update appointment status
  await supabase.from('appointments')
    .update({ status: 'payment_uploaded' })
    .eq('id', appointmentId);

  return { data: { payment: data } };
};

export const getPendingPayments = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      patient:profiles!payments_patient_id_fkey(id, name, email, phone),
      appointment:appointments!payments_appointment_id_fkey(
        *,
        doctor:profiles!appointments_doctor_id_fkey(id, name, email),
        doctor_profile:doctors!appointments_doctor_profile_id_fkey(specialization)
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  throwIfError(error);
  return { data: { payments: data || [] } };
};

export const getMyPayments = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      appointment:appointments!payments_appointment_id_fkey(
        *,
        doctor:profiles!appointments_doctor_id_fkey(id, name, email)
      )
    `)
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false });
  throwIfError(error);
  return { data: { payments: data || [] } };
};

export const verifyPayment = async (id, payload) => {
  const { action, rejectionReason } = payload;
  const { data: { user } } = await supabase.auth.getUser();

  const { data: payment, error: fetchErr } = await supabase
    .from('payments').select('*').eq('id', id).single();
  throwIfError(fetchErr);

  if (action === 'verify') {
    const { error } = await supabase.from('payments').update({
      status: 'verified',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    }).eq('id', id);
    throwIfError(error);

    await supabase.from('appointments').update({
      status: 'confirmed',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    }).eq('id', payment.appointment_id);

  } else if (action === 'reject') {
    const { error } = await supabase.from('payments').update({
      status: 'rejected',
      rejection_reason: rejectionReason || 'Rejected',
    }).eq('id', id);
    throwIfError(error);

    await supabase.from('appointments').update({
      status: 'payment_pending',
    }).eq('id', payment.appointment_id);
  }

  return { data: { success: true } };
};

// ─────────────────────────────────────────────────────────
// MEDICAL HISTORY
// ─────────────────────────────────────────────────────────
export const addMedicalHistory = async (formData) => {
  const { data: { user } } = await supabase.auth.getUser();

  const patientId = formData.get('patientId');
  const appointmentId = formData.get('appointmentId');
  const diagnosis = formData.get('diagnosis');
  const symptoms = formData.get('symptoms');
  const notes = formData.get('notes');
  const reportFilesArr = formData.getAll('reportFiles');

  // Upload report files
  const reportUrls = [];
  for (const file of reportFilesArr) {
    if (file && file.size > 0) {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage
        .from('medical-files').upload(path, file);
      if (!upErr) {
        const { data: ud } = supabase.storage.from('medical-files').getPublicUrl(path);
        reportUrls.push(ud.publicUrl);
      }
    }
  }

  const symptomsArr = symptoms
    ? symptoms.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const { data, error } = await supabase
    .from('medical_history')
    .insert({
      patient_id: patientId,
      doctor_id: user.id,
      appointment_id: appointmentId || null,
      diagnosis,
      symptoms: symptomsArr,
      notes: notes || '',
      report_files: reportUrls,
    })
    .select(`
      *,
      doctor:profiles!medical_history_doctor_id_fkey(id, name, email, avatar_url),
      patient:profiles!medical_history_patient_id_fkey(id, name, email)
    `)
    .single();
  throwIfError(error);

  // Mark appointment completed
  if (appointmentId) {
    await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointmentId);
  }

  return { data: { record: data } };
};

export const getMedicalHistory = async (params = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { patientId } = params;

  // Profile to check role
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  let query = supabase
    .from('medical_history')
    .select(`
      *,
      doctor:profiles!medical_history_doctor_id_fkey(id, name, email, avatar_url),
      patient:profiles!medical_history_patient_id_fkey(id, name, email)
    `)
    .order('created_at', { ascending: false });

  if (prof?.role === 'patient') {
    query = query.eq('patient_id', user.id);
  } else if (prof?.role === 'doctor') {
    query = patientId
      ? query.eq('patient_id', patientId).eq('doctor_id', user.id)
      : query.eq('doctor_id', user.id);
  } else if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data, error } = await query;
  throwIfError(error);
  return { data: { history: data || [] } };
};

export const addPrescription = async (payload) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { patientId, appointmentId, medicines, advice, followUpDate, treatmentType } = payload;

  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      patient_id: patientId,
      doctor_id: user.id,
      appointment_id: appointmentId || null,
      medicines: medicines || [],
      advice: advice || '',
      follow_up_date: followUpDate || null,
      treatment_type: treatmentType || 'allopathic',
    })
    .select(`
      *,
      doctor:profiles!prescriptions_doctor_id_fkey(id, name, email, avatar_url),
      patient:profiles!prescriptions_patient_id_fkey(id, name, email)
    `)
    .single();
  throwIfError(error);
  return { data: { prescription: data } };
};

export const getPrescriptions = async (params = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { patientId } = params;

  const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  let query = supabase
    .from('prescriptions')
    .select(`
      *,
      doctor:profiles!prescriptions_doctor_id_fkey(id, name, email, avatar_url),
      patient:profiles!prescriptions_patient_id_fkey(id, name, email)
    `)
    .order('created_at', { ascending: false });

  if (prof?.role === 'patient') {
    query = query.eq('patient_id', user.id);
  } else if (prof?.role === 'doctor') {
    query = patientId
      ? query.eq('patient_id', patientId).eq('doctor_id', user.id)
      : query.eq('doctor_id', user.id);
  } else if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data, error } = await query;
  throwIfError(error);
  return { data: { prescriptions: data || [] } };
};

// ─────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const [
    { count: totalUsers },
    { count: totalDoctors },
    { count: totalPatients },
    { count: totalAppointments },
    { count: pendingAppointments },
    { count: confirmedAppointments },
    { count: totalPayments },
    { count: pendingPayments },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'payment_uploaded'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('payments').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return {
    data: {
      stats: {
        totalUsers, totalDoctors, totalPatients,
        totalAppointments, pendingAppointments, confirmedAppointments,
        totalPayments, pendingPayments,
      }
    }
  };
};

export const getAllUsers = async (params = {}) => {
  const { role, page = 1, limit = 20 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (role) query = query.eq('role', role);

  const { data, error, count } = await query;
  throwIfError(error);
  return { data: { users: data || [], total: count } };
};

export const toggleUserStatus = async (id) => {
  const { data: user } = await supabase.from('profiles').select('is_active, role').eq('id', id).single();
  if (user?.role === 'super_admin') throw new Error('Cannot deactivate Super Admin');

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: !user.is_active })
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return { data: { user: data, message: `User ${data.is_active ? 'activated' : 'deactivated'}.` } };
};

export const getUnverifiedDoctors = async () => {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      user:profiles!doctors_user_id_fkey(id, name, email, phone)
    `)
    .eq('is_verified', false);
  throwIfError(error);
  return { data: { doctors: data || [] } };
};
