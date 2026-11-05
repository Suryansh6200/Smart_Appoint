import type { AppointmentStatus } from './supabase';

export const DEPARTMENT = 'Dentist';
export const SERVICE_NAME = 'Sense-Smart';
export const TAGLINE = 'Smart Healthcare. Less Waiting.';

export const ESTIMATED_MINUTES_PER_PATIENT = 10;
export const STAFF_INVITATION_CODE = 'STAFF-2026';

export const HOSPITAL = {
  name: 'TY-Dental-Medicity',
  location: '25D, Lucknow',
  hours: '9:00 AM – 6:00 PM',
  lunchBreak: '12:00 PM – 1:00 PM',
  doctorName: 'Dr. ABC',
  doctorTitle: 'BDS, MDS — Conservative Dentistry & Endodontics',
  doctorExperience: '12+ years of experience',
  doctorBio:
    'Dr. Tanya Yadav is a senior dental surgeon specializing in restorative and cosmetic dentistry. She has treated over 5,000 patients across root canals, implants, and routine dental care, combining advanced techniques with a gentle, patient-first approach.',
};

export const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  waiting: {
    label: 'Waiting',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
  },
  called: {
    label: 'Called',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    border: 'border-indigo-200',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    border: 'border-rose-200',
  },
};

export const STATUS_ORDER: AppointmentStatus[] = [
  'waiting',
  'called',
  'in_progress',
  'completed',
  'cancelled',
];
