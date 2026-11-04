/*
# Sense-Smart: Hospital Queue Management Schema

## Overview
Creates the database schema for a dentist-only hospital queue management system.
Patients register, book appointments, receive queue tokens (TN-001 format), and
track estimated wait times. Staff manage the queue from a separate dashboard.

## New Tables

### profiles
- `id` (uuid, PK, references auth.users) — linked to the authenticated user
- `full_name` (text, required) — patient or staff member's display name
- `phone` (text, optional) — contact phone number
- `role` (text, required, default 'patient') — either 'patient' or 'staff';
  protected by column-level privileges so users cannot self-escalate
- `created_at` (timestamptz, default now())

### appointments
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users, default auth.uid()) — the patient who booked
- `token_number` (text, unique) — human-readable token like "TN-001"
- `status` (text, default 'waiting') — one of: waiting, called, in_progress,
  completed, cancelled
- `appointment_date` (date, default today) — the date of the appointment
- `reason` (text, required) — reason for the dental visit
- `notes` (text, optional) — staff notes during/after the appointment
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now()) — auto-updated on row change
- `called_at` (timestamptz, nullable) — when staff called the patient
- `completed_at` (timestamptz, nullable) — when the appointment finished

## Sequences
- `appointment_token_seq` — monotonically increasing counter used to generate
  unique token numbers (TN-001, TN-002, …)

## Functions (all SECURITY DEFINER)
- `handle_new_user()` — trigger function; auto-creates a profile row when a new
  auth user signs up, pulling full_name and phone from signup metadata
- `book_appointment(reason, appointment_date)` — atomically generates the next
  token number and inserts a new appointment for the calling user; returns the
  full appointment row
- `upgrade_to_staff(staff_code)` — allows a user to upgrade their own profile
  to the 'staff' role by providing the correct staff invitation code
- `update_appointment_status(appointment_id, new_status, staff_notes)` —
  allows staff to update an appointment's status, automatically setting
  called_at / completed_at timestamps as appropriate

## Security (RLS + Grants)
- Both tables have RLS enabled.
- profiles: users SELECT/UPDATE only their own row; staff can SELECT all
  profiles. UPDATE is column-restricted (full_name, phone only) so users
  cannot change their role.
- appointments: patients SELECT only their own; staff SELECT all. Only staff
  can UPDATE (to change queue status). Patients INSERT their own via the
  book_appointment SECURITY DEFINER function.
- SECURITY DEFINER functions have EXECUTE revoked from PUBLIC/anon and granted
  only to authenticated.
- Indexes on user_id, status, appointment_date for query performance.
*/

-- ============================================================
-- 1. profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'staff')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Column-restricted: users can only update their own name and phone, NOT role
GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE (full_name, phone) ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_or_all_staff_profiles" ON profiles;
CREATE POLICY "select_own_or_all_staff_profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'staff')
);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================
-- 2. appointments table
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  token_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'in_progress', 'completed', 'cancelled')),
  appointment_date date NOT NULL DEFAULT CURRENT_DATE,
  reason text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  called_at timestamptz,
  completed_at timestamptz
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON appointments TO authenticated;

-- Patients see only their own appointments; staff see all
DROP POLICY IF EXISTS "select_own_or_all_staff_appointments" ON appointments;
CREATE POLICY "select_own_or_all_staff_appointments"
ON appointments FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'staff')
);

-- Patients can insert their own appointments (used by book_appointment function)
DROP POLICY IF EXISTS "insert_own_appointments" ON appointments;
CREATE POLICY "insert_own_appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only staff can update appointment status
DROP POLICY IF EXISTS "staff_update_appointments" ON appointments;
CREATE POLICY "staff_update_appointments"
ON appointments FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'staff'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'staff'));

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- ============================================================
-- 3. Token sequence
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS appointment_token_seq START 1;

-- ============================================================
-- 4. updated_at auto-maintenance trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS appointments_set_updated_at ON appointments;
CREATE TRIGGER appointments_set_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 5. handle_new_user — auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Patient'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 6. book_appointment — atomic token generation + insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.book_appointment(
  p_reason text,
  p_appointment_date date DEFAULT CURRENT_DATE
)
RETURNS public.appointments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token text;
  new_appt public.appointments;
BEGIN
  SELECT 'TN-' || LPAD(nextval('appointment_token_seq')::text, 3, '0') INTO new_token;

  INSERT INTO public.appointments (user_id, token_number, reason, appointment_date)
  VALUES (auth.uid(), new_token, p_reason, p_appointment_date)
  RETURNING * INTO new_appt;

  RETURN new_appt;
END;
$$;

-- ============================================================
-- 7. upgrade_to_staff — role upgrade with invitation code
-- ============================================================
CREATE OR REPLACE FUNCTION public.upgrade_to_staff(p_staff_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_staff_code = 'STAFF-2026' THEN
    UPDATE public.profiles SET role = 'staff' WHERE id = auth.uid();
  ELSE
    RAISE EXCEPTION 'Invalid staff invitation code';
  END IF;
END;
$$;

-- ============================================================
-- 8. update_appointment_status — staff status changes
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_appointment_status(
  p_appointment_id uuid,
  p_new_status text,
  p_notes text DEFAULT NULL
)
RETURNS public.appointments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_appt public.appointments;
  is_staff boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'staff'
  ) INTO is_staff;

  IF NOT is_staff THEN
    RAISE EXCEPTION 'Only staff can update appointment status';
  END IF;

  UPDATE public.appointments
  SET
    status = p_new_status,
    notes = COALESCE(p_notes, notes),
    called_at = CASE WHEN p_new_status IN ('called', 'in_progress') AND called_at IS NULL THEN now() ELSE called_at END,
    completed_at = CASE WHEN p_new_status = 'completed' THEN now() ELSE completed_at END
  WHERE id = p_appointment_id
  RETURNING * INTO updated_appt;

  RETURN updated_appt;
END;
$$;

-- ============================================================
-- 9. Revoke EXECUTE from PUBLIC/anon on SECURITY DEFINER functions
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.book_appointment(text, date) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.upgrade_to_staff(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_appointment_status(uuid, text, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.book_appointment(text, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upgrade_to_staff(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_appointment_status(uuid, text, text) TO authenticated;