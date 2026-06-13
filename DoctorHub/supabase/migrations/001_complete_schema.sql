-- ================================================================
-- DOCTOR HUB - Complete Supabase Production Schema
-- Run this ONCE in Supabase SQL Editor → New Query → Run
-- ================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- ENUMS
-- ================================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('patient','doctor','assistant','admin','super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE treatment_type AS ENUM ('allopathic','homeopathic','herbal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('pending','payment_pending','payment_uploaded','confirmed','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM ('pending','verified','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM ('jazzcash','easypaisa','bank_transfer','cash');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ================================================================
-- PROFILES (extends auth.users)
-- ================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        user_role NOT NULL DEFAULT 'patient',
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- DOCTORS
-- ================================================================
CREATE TABLE IF NOT EXISTS doctors (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  specialization   TEXT NOT NULL DEFAULT 'General',
  treatment_type   treatment_type NOT NULL DEFAULT 'allopathic',
  diseases         TEXT[] DEFAULT '{}',
  experience       INTEGER DEFAULT 0,
  qualification    TEXT,
  bio              TEXT,
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  rating           NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews    INTEGER DEFAULT 0,
  available_days   TEXT[] DEFAULT '{}',
  consultation_fee NUMERIC(10,2) DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- CLINICS
-- ================================================================
CREATE TABLE IF NOT EXISTS clinics (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id  UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  city       TEXT NOT NULL,
  timings    TEXT,
  fee        NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- DOCTOR ASSISTANTS (junction)
-- ================================================================
CREATE TABLE IF NOT EXISTS doctor_assistants (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id    UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  assistant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, assistant_id)
);

-- ================================================================
-- PATIENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS patients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth     DATE,
  gender            TEXT CHECK (gender IN ('male','female','other')),
  blood_group       TEXT,
  address           TEXT,
  emergency_contact JSONB DEFAULT '{}',
  allergies         TEXT[] DEFAULT '{}',
  chronic_diseases  TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- APPOINTMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS appointments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  doctor_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  doctor_profile_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  clinic_id         UUID REFERENCES clinics(id) ON DELETE SET NULL,
  clinic_name       TEXT,
  clinic_address    TEXT,
  clinic_city       TEXT,
  appointment_date  TIMESTAMPTZ NOT NULL,
  time_slot         TEXT NOT NULL,
  status            appointment_status NOT NULL DEFAULT 'payment_pending',
  symptoms          TEXT,
  notes             TEXT,
  fee               NUMERIC(10,2) DEFAULT 0,
  verified_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- PAYMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id   UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount           NUMERIC(10,2) NOT NULL DEFAULT 0,
  method           payment_method_type NOT NULL DEFAULT 'jazzcash',
  transaction_id   TEXT,
  screenshot_url   TEXT,
  status           payment_status_type NOT NULL DEFAULT 'pending',
  verified_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- MEDICAL HISTORY (IMMUTABLE)
-- ================================================================
CREATE TABLE IF NOT EXISTS medical_history (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  diagnosis      TEXT NOT NULL,
  symptoms       TEXT[] DEFAULT '{}',
  notes          TEXT,
  report_files   TEXT[] DEFAULT '{}',
  visit_date     TIMESTAMPTZ DEFAULT NOW(),
  created_at     TIMESTAMPTZ DEFAULT NOW()
  -- No updated_at — IMMUTABLE
);

-- ================================================================
-- PRESCRIPTIONS (IMMUTABLE)
-- ================================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  medicines      JSONB NOT NULL DEFAULT '[]',
  advice         TEXT,
  follow_up_date DATE,
  treatment_type treatment_type DEFAULT 'allopathic',
  created_at     TIMESTAMPTZ DEFAULT NOW()
  -- No updated_at — IMMUTABLE
);

-- ================================================================
-- AUDIT LOGS
-- ================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  table_name TEXT,
  record_id  UUID,
  old_data   JSONB,
  new_data   JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email    ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role     ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active   ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id   ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_verified  ON doctors(is_verified);
CREATE INDEX IF NOT EXISTS idx_doctors_spec      ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_clinics_doctor    ON clinics(doctor_id);
CREATE INDEX IF NOT EXISTS idx_clinics_city      ON clinics(city);
CREATE INDEX IF NOT EXISTS idx_appt_patient      ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appt_doctor       ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appt_status       ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appt_date         ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appt_created      ON appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pay_appt          ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_pay_patient       ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_pay_status        ON payments(status);
CREATE INDEX IF NOT EXISTS idx_history_patient   ON medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_history_doctor    ON medical_history(doctor_id);
CREATE INDEX IF NOT EXISTS idx_rx_patient        ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_rx_doctor         ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_audit_user        ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created     ON audit_logs(created_at DESC);

-- Full-text search on doctors
CREATE INDEX IF NOT EXISTS idx_doctors_fts ON doctors
  USING gin(to_tsvector('english',
    specialization || ' ' ||
    COALESCE(bio,'') || ' ' ||
    COALESCE(qualification,'') || ' ' ||
    COALESCE(array_to_string(diseases,' '),'')
  ));

-- ================================================================
-- AUTO updated_at TRIGGER
-- ================================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DO $$ DECLARE t TEXT;
BEGIN FOR t IN SELECT unnest(ARRAY['profiles','doctors','patients','appointments','payments']) LOOP
  EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %s', t, t);
  EXECUTE format('CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()', t, t);
END LOOP; END; $$;

-- ================================================================
-- AUTO-CREATE PROFILE ON SIGNUP (Supabase Auth trigger)
-- ================================================================
CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_role user_role;
  v_spec TEXT;
  v_treat treatment_type;
BEGIN
  v_role  := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient');
  v_spec  := COALESCE(NEW.raw_user_meta_data->>'specialization', 'General');
  v_treat := COALESCE((NEW.raw_user_meta_data->>'treatment_type')::treatment_type, 'allopathic');

  INSERT INTO public.profiles (id, name, email, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    v_role,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  IF v_role = 'patient' THEN
    INSERT INTO public.patients (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  ELSIF v_role = 'doctor' THEN
    INSERT INTO public.doctors (user_id, specialization, treatment_type)
    VALUES (NEW.id, v_spec, v_treat) ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_handle_new_user();

-- ================================================================
-- HELPER: Get current user role
-- ================================================================
CREATE OR REPLACE FUNCTION fn_get_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- ================================================================
-- HELPER: Is user active
-- ================================================================
CREATE OR REPLACE FUNCTION fn_is_active()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT is_active FROM profiles WHERE id = auth.uid();
$$;

-- ================================================================
-- IMMUTABILITY — Prevent UPDATE/DELETE on medical records
-- ================================================================
CREATE OR REPLACE FUNCTION fn_prevent_medical_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Medical records are immutable. Operation not allowed.';
END; $$;

DROP TRIGGER IF EXISTS trg_history_immutable ON medical_history;
CREATE TRIGGER trg_history_immutable
  BEFORE UPDATE OR DELETE ON medical_history
  FOR EACH ROW EXECUTE FUNCTION fn_prevent_medical_mutation();

DROP TRIGGER IF EXISTS trg_rx_immutable ON prescriptions;
CREATE TRIGGER trg_rx_immutable
  BEFORE UPDATE OR DELETE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION fn_prevent_medical_mutation();

-- ================================================================
-- ENABLE ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history   ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS: PROFILES
-- ================================================================
DROP POLICY IF EXISTS "profiles_own"           ON profiles;
DROP POLICY IF EXISTS "profiles_doctors_public" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all"     ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update"  ON profiles;

CREATE POLICY "profiles_own"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_doctors_public"
  ON profiles FOR SELECT USING (role = 'doctor' AND is_active = TRUE);

CREATE POLICY "profiles_admin_all"
  ON profiles FOR SELECT
  USING (fn_get_role() IN ('admin','super_admin'));

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE USING (fn_get_role() IN ('admin','super_admin'));

-- ================================================================
-- RLS: DOCTORS
-- ================================================================
DROP POLICY IF EXISTS "doctors_select_all"    ON doctors;
DROP POLICY IF EXISTS "doctors_update_own"    ON doctors;
DROP POLICY IF EXISTS "doctors_update_admin"  ON doctors;
DROP POLICY IF EXISTS "doctors_insert_admin"  ON doctors;

CREATE POLICY "doctors_select_all"
  ON doctors FOR SELECT USING (TRUE);

CREATE POLICY "doctors_update_own"
  ON doctors FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "doctors_update_admin"
  ON doctors FOR UPDATE USING (fn_get_role() IN ('admin','super_admin'));

CREATE POLICY "doctors_insert_admin"
  ON doctors FOR INSERT WITH CHECK (fn_get_role() IN ('admin','super_admin') OR user_id = auth.uid());

-- ================================================================
-- RLS: CLINICS
-- ================================================================
DROP POLICY IF EXISTS "clinics_select_all"  ON clinics;
DROP POLICY IF EXISTS "clinics_own_write"   ON clinics;
DROP POLICY IF EXISTS "clinics_own_delete"  ON clinics;

CREATE POLICY "clinics_select_all"
  ON clinics FOR SELECT USING (TRUE);

CREATE POLICY "clinics_own_write"
  ON clinics FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM doctors WHERE id = doctor_id AND user_id = auth.uid())
  );

CREATE POLICY "clinics_own_update"
  ON clinics FOR UPDATE USING (
    EXISTS (SELECT 1 FROM doctors WHERE id = doctor_id AND user_id = auth.uid())
  );

CREATE POLICY "clinics_own_delete"
  ON clinics FOR DELETE USING (
    EXISTS (SELECT 1 FROM doctors WHERE id = doctor_id AND user_id = auth.uid())
  );

-- ================================================================
-- RLS: PATIENTS
-- ================================================================
DROP POLICY IF EXISTS "patients_own"        ON patients;
DROP POLICY IF EXISTS "patients_doctor"     ON patients;
DROP POLICY IF EXISTS "patients_admin"      ON patients;
DROP POLICY IF EXISTS "patients_update_own" ON patients;

CREATE POLICY "patients_own"
  ON patients FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "patients_doctor"
  ON patients FOR SELECT USING (
    fn_get_role() = 'doctor' AND
    EXISTS (SELECT 1 FROM appointments WHERE doctor_id = auth.uid() AND patient_id = patients.user_id)
  );

CREATE POLICY "patients_admin"
  ON patients FOR SELECT USING (fn_get_role() IN ('admin','super_admin'));

CREATE POLICY "patients_update_own"
  ON patients FOR UPDATE USING (user_id = auth.uid());

-- ================================================================
-- RLS: APPOINTMENTS
-- ================================================================
DROP POLICY IF EXISTS "appt_patient_select"    ON appointments;
DROP POLICY IF EXISTS "appt_doctor_select"     ON appointments;
DROP POLICY IF EXISTS "appt_assistant_select"  ON appointments;
DROP POLICY IF EXISTS "appt_admin_select"      ON appointments;
DROP POLICY IF EXISTS "appt_patient_insert"    ON appointments;
DROP POLICY IF EXISTS "appt_patient_cancel"    ON appointments;
DROP POLICY IF EXISTS "appt_doctor_update"     ON appointments;
DROP POLICY IF EXISTS "appt_assistant_update"  ON appointments;
DROP POLICY IF EXISTS "appt_admin_update"      ON appointments;

CREATE POLICY "appt_patient_select"
  ON appointments FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "appt_doctor_select"
  ON appointments FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "appt_assistant_select"
  ON appointments FOR SELECT USING (fn_get_role() = 'assistant');

CREATE POLICY "appt_admin_select"
  ON appointments FOR SELECT USING (fn_get_role() IN ('admin','super_admin'));

CREATE POLICY "appt_patient_insert"
  ON appointments FOR INSERT WITH CHECK (
    patient_id = auth.uid() AND fn_get_role() = 'patient' AND fn_is_active()
  );

CREATE POLICY "appt_patient_cancel"
  ON appointments FOR UPDATE USING (
    patient_id = auth.uid() AND status NOT IN ('completed','cancelled')
  );

CREATE POLICY "appt_doctor_update"
  ON appointments FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "appt_assistant_update"
  ON appointments FOR UPDATE USING (fn_get_role() = 'assistant');

CREATE POLICY "appt_admin_update"
  ON appointments FOR UPDATE USING (fn_get_role() IN ('admin','super_admin'));

-- ================================================================
-- RLS: PAYMENTS
-- ================================================================
DROP POLICY IF EXISTS "pay_patient_select"    ON payments;
DROP POLICY IF EXISTS "pay_assistant_select"  ON payments;
DROP POLICY IF EXISTS "pay_admin_select"      ON payments;
DROP POLICY IF EXISTS "pay_patient_insert"    ON payments;
DROP POLICY IF EXISTS "pay_assistant_update"  ON payments;
DROP POLICY IF EXISTS "pay_admin_update"      ON payments;

CREATE POLICY "pay_patient_select"
  ON payments FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "pay_assistant_select"
  ON payments FOR SELECT USING (fn_get_role() = 'assistant');

CREATE POLICY "pay_admin_select"
  ON payments FOR SELECT USING (fn_get_role() IN ('admin','super_admin'));

CREATE POLICY "pay_patient_insert"
  ON payments FOR INSERT WITH CHECK (
    patient_id = auth.uid() AND fn_get_role() = 'patient'
  );

CREATE POLICY "pay_assistant_update"
  ON payments FOR UPDATE USING (fn_get_role() = 'assistant');

CREATE POLICY "pay_admin_update"
  ON payments FOR UPDATE USING (fn_get_role() IN ('admin','super_admin'));

-- ================================================================
-- RLS: MEDICAL HISTORY
-- ================================================================
DROP POLICY IF EXISTS "hist_patient_select" ON medical_history;
DROP POLICY IF EXISTS "hist_doctor_select"  ON medical_history;
DROP POLICY IF EXISTS "hist_admin_select"   ON medical_history;
DROP POLICY IF EXISTS "hist_doctor_insert"  ON medical_history;

CREATE POLICY "hist_patient_select"
  ON medical_history FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "hist_doctor_select"
  ON medical_history FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "hist_admin_select"
  ON medical_history FOR SELECT USING (fn_get_role() IN ('admin','super_admin'));

CREATE POLICY "hist_doctor_insert"
  ON medical_history FOR INSERT WITH CHECK (
    doctor_id = auth.uid() AND fn_get_role() = 'doctor'
  );

-- ================================================================
-- RLS: PRESCRIPTIONS
-- ================================================================
DROP POLICY IF EXISTS "rx_patient_select" ON prescriptions;
DROP POLICY IF EXISTS "rx_doctor_select"  ON prescriptions;
DROP POLICY IF EXISTS "rx_admin_select"   ON prescriptions;
DROP POLICY IF EXISTS "rx_doctor_insert"  ON prescriptions;

CREATE POLICY "rx_patient_select"
  ON prescriptions FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "rx_doctor_select"
  ON prescriptions FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "rx_admin_select"
  ON prescriptions FOR SELECT USING (fn_get_role() IN ('admin','super_admin'));

CREATE POLICY "rx_doctor_insert"
  ON prescriptions FOR INSERT WITH CHECK (
    doctor_id = auth.uid() AND fn_get_role() = 'doctor'
  );

-- ================================================================
-- RLS: AUDIT LOGS
-- ================================================================
DROP POLICY IF EXISTS "audit_admin_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_insert_all"   ON audit_logs;

CREATE POLICY "audit_admin_select"
  ON audit_logs FOR SELECT USING (fn_get_role() IN ('admin','super_admin'));

CREATE POLICY "audit_insert_all"
  ON audit_logs FOR INSERT WITH CHECK (TRUE);

-- ================================================================
-- STORAGE BUCKETS
-- ================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',              'avatars',              TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('payment-screenshots',  'payment-screenshots',  FALSE, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('medical-files',        'medical-files',        FALSE, 20971520, ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
DROP POLICY IF EXISTS "avatars_public_read"         ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_upload"          ON storage.objects;
DROP POLICY IF EXISTS "payment_upload"               ON storage.objects;
DROP POLICY IF EXISTS "payment_authorized_read"      ON storage.objects;
DROP POLICY IF EXISTS "medical_upload"               ON storage.objects;
DROP POLICY IF EXISTS "medical_authorized_read"      ON storage.objects;

CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_upload"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "payment_upload"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'payment-screenshots' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "payment_authorized_read"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'payment-screenshots' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      fn_get_role() IN ('assistant','admin','super_admin')
    )
  );

CREATE POLICY "medical_upload"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'medical-files' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "medical_authorized_read"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'medical-files' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      fn_get_role() IN ('doctor','admin','super_admin')
    )
  );

-- ================================================================
-- DONE! After running:
-- 1. Sign up a user via your app
-- 2. Run: UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';
-- ================================================================
