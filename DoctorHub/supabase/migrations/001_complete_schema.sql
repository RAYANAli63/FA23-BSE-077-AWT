-- ============================================================
-- DOCTOR HUB - Complete Supabase Schema
-- Run this ONCE in Supabase SQL Editor
-- All tables, RLS, indexes, triggers in one file
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin','admin','doctor','assistant','patient');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE treatment_type AS ENUM ('allopathic','homeopathic','herbal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'pending','payment_pending','payment_uploaded',
    'confirmed','completed','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('jazzcash','easypaisa','bank_transfer','cash');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','verified','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABLE: profiles (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  role          user_role NOT NULL DEFAULT 'patient',
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: doctors
-- ============================================================
CREATE TABLE IF NOT EXISTS doctors (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  specialization    TEXT NOT NULL DEFAULT 'General',
  treatment_type    treatment_type NOT NULL DEFAULT 'allopathic',
  diseases          TEXT[] DEFAULT '{}',
  experience        INTEGER DEFAULT 0,
  qualification     TEXT,
  bio               TEXT,
  consultation_fee  INTEGER DEFAULT 0,
  available_days    TEXT[] DEFAULT '{}',
  is_verified       BOOLEAN NOT NULL DEFAULT false,
  rating            NUMERIC(3,2) DEFAULT 0,
  total_reviews     INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: clinics (separate from doctors for normalization)
-- ============================================================
CREATE TABLE IF NOT EXISTS clinics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id   UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  city        TEXT NOT NULL,
  timings     TEXT,
  fee         INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: patients
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth       DATE,
  gender              TEXT CHECK (gender IN ('male','female','other')),
  blood_group         TEXT,
  address             TEXT,
  emergency_name      TEXT,
  emergency_phone     TEXT,
  emergency_relation  TEXT,
  allergies           TEXT[] DEFAULT '{}',
  chronic_diseases    TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: appointments
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  doctor_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  doctor_profile_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  clinic_id         UUID REFERENCES clinics(id) ON DELETE SET NULL,
  appointment_date  DATE NOT NULL,
  time_slot         TEXT NOT NULL,
  status            appointment_status NOT NULL DEFAULT 'payment_pending',
  symptoms          TEXT,
  notes             TEXT,
  fee               INTEGER DEFAULT 0,
  verified_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent duplicate booking same slot
  CONSTRAINT unique_doctor_slot UNIQUE (doctor_id, appointment_date, time_slot, status)
);

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id    UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE RESTRICT,
  patient_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount            INTEGER NOT NULL,
  method            payment_method NOT NULL DEFAULT 'jazzcash',
  transaction_id    TEXT,
  screenshot_url    TEXT,
  status            payment_status NOT NULL DEFAULT 'pending',
  verified_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at       TIMESTAMPTZ,
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: medical_history (IMMUTABLE - no updates/deletes)
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  doctor_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  diagnosis       TEXT NOT NULL,
  symptoms        TEXT[] DEFAULT '{}',
  notes           TEXT,
  report_urls     TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- NO updated_at intentionally - immutable record
);

-- ============================================================
-- TABLE: prescriptions (IMMUTABLE - no updates/deletes)
-- ============================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  doctor_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  medicines       JSONB NOT NULL DEFAULT '[]',
  advice          TEXT,
  follow_up_date  DATE,
  treatment_type  treatment_type NOT NULL DEFAULT 'allopathic',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- NO updated_at intentionally - immutable record
);

-- ============================================================
-- TABLE: audit_logs (for HIPAA-style compliance)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  table_name  TEXT NOT NULL,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- doctors
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_treatment_type ON doctors(treatment_type);
CREATE INDEX IF NOT EXISTS idx_doctors_is_verified ON doctors(is_verified);
CREATE INDEX IF NOT EXISTS idx_doctors_rating ON doctors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_doctors_diseases ON doctors USING GIN(diseases);
CREATE INDEX IF NOT EXISTS idx_doctors_search ON doctors USING GIN(specialization gin_trgm_ops);

-- clinics
CREATE INDEX IF NOT EXISTS idx_clinics_doctor_id ON clinics(doctor_id);
CREATE INDEX IF NOT EXISTS idx_clinics_city ON clinics(city);

-- appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_created ON appointments(created_at DESC);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- medical_history
CREATE INDEX IF NOT EXISTS idx_history_patient_id ON medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_history_doctor_id ON medical_history(doctor_id);
CREATE INDEX IF NOT EXISTS idx_history_created ON medical_history(created_at DESC);

-- prescriptions
CREATE INDEX IF NOT EXISTS idx_rx_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_rx_doctor_id ON prescriptions(doctor_id);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Prevent UPDATE/DELETE on medical_history (immutable)
CREATE OR REPLACE FUNCTION prevent_history_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Medical history records are immutable and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_history_immutable_update
  BEFORE UPDATE ON medical_history
  FOR EACH ROW EXECUTE FUNCTION prevent_history_mutation();

CREATE TRIGGER trg_history_immutable_delete
  BEFORE DELETE ON medical_history
  FOR EACH ROW EXECUTE FUNCTION prevent_history_mutation();

-- Prevent UPDATE/DELETE on prescriptions (immutable)
CREATE TRIGGER trg_rx_immutable_update
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION prevent_history_mutation();

CREATE TRIGGER trg_rx_immutable_delete
  BEFORE DELETE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION prevent_history_mutation();

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-create patient profile when role=patient
CREATE OR REPLACE FUNCTION handle_patient_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'patient' AND NOT EXISTS (
    SELECT 1 FROM patients WHERE user_id = NEW.id
  ) THEN
    INSERT INTO patients (user_id) VALUES (NEW.id);
  END IF;

  IF NEW.role = 'doctor' AND NOT EXISTS (
    SELECT 1 FROM doctors WHERE user_id = NEW.id
  ) THEN
    INSERT INTO doctors (
      user_id,
      specialization,
      treatment_type
    ) VALUES (
      NEW.id,
      COALESCE(NEW.name, 'General'),
      'allopathic'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_role_profile
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_patient_profile();

-- Audit log function
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW)::jsonb ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit to sensitive tables
CREATE TRIGGER trg_audit_appointments
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER trg_audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER trg_audit_medical_history
  AFTER INSERT ON medical_history
  FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================================
-- HELPER FUNCTIONS (used by RLS policies)
-- ============================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is admin or super_admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is doctor
CREATE OR REPLACE FUNCTION is_doctor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'doctor' AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is assistant
CREATE OR REPLACE FUNCTION is_assistant()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'assistant' AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors         ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics         ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: profiles
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "profiles_select_public_doctors" ON profiles
  FOR SELECT USING (role = 'doctor');

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (is_admin());

-- ============================================================
-- RLS POLICIES: doctors
-- ============================================================
DROP POLICY IF EXISTS "doctors_select_all" ON doctors;
DROP POLICY IF EXISTS "doctors_insert_own" ON doctors;
DROP POLICY IF EXISTS "doctors_update_own" ON doctors;
DROP POLICY IF EXISTS "doctors_update_admin" ON doctors;

CREATE POLICY "doctors_select_all" ON doctors
  FOR SELECT USING (true); -- Public read for search

CREATE POLICY "doctors_insert_own" ON doctors
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "doctors_update_own" ON doctors
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "doctors_update_admin" ON doctors
  FOR UPDATE USING (is_admin());

-- ============================================================
-- RLS POLICIES: clinics
-- ============================================================
CREATE POLICY "clinics_select_all" ON clinics
  FOR SELECT USING (true);

CREATE POLICY "clinics_insert_doctor" ON clinics
  FOR INSERT WITH CHECK (
    doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "clinics_update_doctor" ON clinics
  FOR UPDATE USING (
    doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
  );

-- ============================================================
-- RLS POLICIES: patients
-- ============================================================
CREATE POLICY "patients_select_own" ON patients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "patients_select_doctor" ON patients
  FOR SELECT USING (is_doctor());

CREATE POLICY "patients_select_admin" ON patients
  FOR SELECT USING (is_admin());

CREATE POLICY "patients_insert_own" ON patients
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "patients_update_own" ON patients
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: appointments
-- ============================================================
CREATE POLICY "appt_select_patient" ON appointments
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "appt_select_doctor" ON appointments
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "appt_select_assistant" ON appointments
  FOR SELECT USING (is_assistant());

CREATE POLICY "appt_select_admin" ON appointments
  FOR SELECT USING (is_admin());

CREATE POLICY "appt_insert_patient" ON appointments
  FOR INSERT WITH CHECK (
    patient_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'patient')
  );

CREATE POLICY "appt_update_patient" ON appointments
  FOR UPDATE USING (
    patient_id = auth.uid() AND
    status IN ('payment_pending','payment_uploaded')
  );

CREATE POLICY "appt_update_doctor" ON appointments
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "appt_update_assistant" ON appointments
  FOR UPDATE USING (is_assistant());

CREATE POLICY "appt_update_admin" ON appointments
  FOR UPDATE USING (is_admin());

-- ============================================================
-- RLS POLICIES: payments
-- ============================================================
CREATE POLICY "pay_select_patient" ON payments
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "pay_select_assistant" ON payments
  FOR SELECT USING (is_assistant());

CREATE POLICY "pay_select_admin" ON payments
  FOR SELECT USING (is_admin());

CREATE POLICY "pay_insert_patient" ON payments
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "pay_update_assistant" ON payments
  FOR UPDATE USING (is_assistant());

CREATE POLICY "pay_update_admin" ON payments
  FOR UPDATE USING (is_admin());

-- ============================================================
-- RLS POLICIES: medical_history (INSERT only - no update/delete)
-- ============================================================
CREATE POLICY "history_select_patient" ON medical_history
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "history_select_doctor" ON medical_history
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "history_select_admin" ON medical_history
  FOR SELECT USING (is_admin());

CREATE POLICY "history_insert_doctor" ON medical_history
  FOR INSERT WITH CHECK (
    doctor_id = auth.uid() AND is_doctor()
  );

-- NO UPDATE or DELETE policies = immutable at RLS level too

-- ============================================================
-- RLS POLICIES: prescriptions (INSERT only - no update/delete)
-- ============================================================
CREATE POLICY "rx_select_patient" ON prescriptions
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "rx_select_doctor" ON prescriptions
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "rx_select_admin" ON prescriptions
  FOR SELECT USING (is_admin());

CREATE POLICY "rx_insert_doctor" ON prescriptions
  FOR INSERT WITH CHECK (
    doctor_id = auth.uid() AND is_doctor()
  );

-- ============================================================
-- RLS POLICIES: audit_logs
-- ============================================================
CREATE POLICY "audit_select_admin" ON audit_logs
  FOR SELECT USING (is_admin());

-- Only system can insert audit logs (via SECURITY DEFINER function)
CREATE POLICY "audit_insert_system" ON audit_logs
  FOR INSERT WITH CHECK (false); -- blocked for direct insert

-- ============================================================
-- STORAGE BUCKETS (run after enabling storage)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('payment-screenshots', 'payment-screenshots', false, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('medical-reports', 'medical-reports', false, 10485760, ARRAY['image/jpeg','image/png','application/pdf']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_own_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "payment_screenshots_patient_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "payment_screenshots_assistant_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-screenshots' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR is_assistant() OR is_admin())
  );

CREATE POLICY "medical_reports_restricted" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-reports' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR is_doctor() OR is_admin())
  );

CREATE POLICY "medical_reports_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medical-reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- VIEWS (for optimized queries - prevent N+1)
-- ============================================================

-- Doctor full profile view (joins profiles + doctors + clinics)
CREATE OR REPLACE VIEW doctor_profiles AS
SELECT
  d.id AS doctor_id,
  d.user_id,
  p.name,
  p.email,
  p.phone,
  p.avatar_url,
  p.is_active,
  d.specialization,
  d.treatment_type,
  d.diseases,
  d.experience,
  d.qualification,
  d.bio,
  d.consultation_fee,
  d.available_days,
  d.is_verified,
  d.rating,
  d.total_reviews,
  d.created_at,
  COALESCE(
    json_agg(
      json_build_object(
        'id', c.id,
        'name', c.name,
        'address', c.address,
        'city', c.city,
        'timings', c.timings,
        'fee', c.fee
      )
    ) FILTER (WHERE c.id IS NOT NULL),
    '[]'
  ) AS clinics
FROM doctors d
JOIN profiles p ON p.id = d.user_id
LEFT JOIN clinics c ON c.doctor_id = d.id
GROUP BY d.id, d.user_id, p.name, p.email, p.phone, p.avatar_url,
         p.is_active, d.specialization, d.treatment_type, d.diseases,
         d.experience, d.qualification, d.bio, d.consultation_fee,
         d.available_days, d.is_verified, d.rating, d.total_reviews, d.created_at;

-- Appointment full view
CREATE OR REPLACE VIEW appointment_details AS
SELECT
  a.id,
  a.appointment_date,
  a.time_slot,
  a.status,
  a.symptoms,
  a.notes,
  a.fee,
  a.created_at,
  a.updated_at,
  -- Patient info
  a.patient_id,
  pp.name AS patient_name,
  pp.email AS patient_email,
  pp.phone AS patient_phone,
  pp.avatar_url AS patient_avatar,
  -- Doctor info
  a.doctor_id,
  dp.name AS doctor_name,
  dp.email AS doctor_email,
  dp.phone AS doctor_phone,
  -- Doctor profile
  a.doctor_profile_id,
  d.specialization,
  d.treatment_type,
  -- Clinic info
  a.clinic_id,
  c.name AS clinic_name,
  c.address AS clinic_address,
  c.city AS clinic_city,
  -- Payment info
  pay.id AS payment_id,
  pay.status AS payment_status,
  pay.amount AS payment_amount,
  pay.method AS payment_method,
  pay.screenshot_url
FROM appointments a
JOIN profiles pp ON pp.id = a.patient_id
JOIN profiles dp ON dp.id = a.doctor_id
JOIN doctors d ON d.id = a.doctor_profile_id
LEFT JOIN clinics c ON c.id = a.clinic_id
LEFT JOIN payments pay ON pay.appointment_id = a.id;

-- ============================================================
-- SEED DATA (Demo accounts)
-- ============================================================

-- NOTE: Actual auth users created via Supabase Auth API
-- These are placeholder profile inserts for demo
-- In production, profiles auto-created via handle_new_user trigger

-- Insert demo roles reference (actual inserts happen via Auth signup)
COMMENT ON TABLE profiles IS 'Auto-populated via Supabase Auth trigger. Demo logins via /register page.';
COMMENT ON TABLE medical_history IS 'IMMUTABLE: Records cannot be updated or deleted per healthcare compliance.';
COMMENT ON TABLE prescriptions IS 'IMMUTABLE: Records cannot be updated or deleted per healthcare compliance.';
