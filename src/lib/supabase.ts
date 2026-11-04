import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type AppointmentStatus =
  | 'waiting'
  | 'called'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: 'patient' | 'staff';
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  token_number: string;
  status: AppointmentStatus;
  appointment_date: string;
  reason: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  called_at: string | null;
  completed_at: string | null;
}

export interface AppointmentWithProfile extends Appointment {
  profiles?: Pick<Profile, 'full_name' | 'phone'> | null;
}
