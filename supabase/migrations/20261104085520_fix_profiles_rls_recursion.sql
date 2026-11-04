/*
# Fix infinite recursion in RLS policies

## Problem
The SELECT policies on `profiles` and `appointments` both use:
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'staff')
This subquery hits the `profiles` table, which has RLS enabled, so the policy
evaluates the policy again — creating infinite recursion (error 42P17).

## Fix
- Create a SECURITY DEFINER function `is_staff()` that checks the caller's
  role in `profiles` without going through RLS (SECURITY DEFINER runs as the
  table owner, bypassing RLS).
- Replace all inline `EXISTS (... profiles ... role = 'staff')` subqueries in
  policies with calls to `is_staff()`.
- Grant EXECUTE on `is_staff()` to `authenticated`.

## Security
- `is_staff()` is SECURITY DEFINER, search_path locked to `public`.
- EXECUTE revoked from PUBLIC/anon, granted only to authenticated.
- No change to what data users can access — just fixes the recursion mechanism.
*/

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'staff');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

-- Fix profiles SELECT policy
DROP POLICY IF EXISTS "select_own_or_all_staff_profiles" ON profiles;
CREATE POLICY "select_own_or_all_staff_profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR public.is_staff()
);

-- Fix appointments SELECT policy
DROP POLICY IF EXISTS "select_own_or_all_staff_appointments" ON appointments;
CREATE POLICY "select_own_or_all_staff_appointments"
ON appointments FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR public.is_staff()
);

-- Fix appointments UPDATE policy
DROP POLICY IF EXISTS "staff_update_appointments" ON appointments;
CREATE POLICY "staff_update_appointments"
ON appointments FOR UPDATE
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());