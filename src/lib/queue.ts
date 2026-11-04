import { ESTIMATED_MINUTES_PER_PATIENT } from './constants';
import type { Appointment } from './supabase';

/**
 * Returns the number of patients ahead of the given appointment who are still
 * waiting (status is "waiting" and token was generated before this one).
 */
export function getQueuePosition(appointments: Appointment[], targetToken: string): number {
  const target = appointments.find((a) => a.token_number === targetToken);
  if (!target) return 0;

  return appointments.filter(
    (a) =>
      a.status === 'waiting' &&
      a.token_number < target.token_number
  ).length + 1;
}

/**
 * Returns the number of patients ahead who are still waiting to be called.
 */
export function getPatientsAhead(appointments: Appointment[], targetToken: string): number {
  const target = appointments.find((a) => a.token_number === targetToken);
  if (!target || target.status !== 'waiting') return 0;

  return appointments.filter(
    (a) =>
      a.status === 'waiting' &&
      a.token_number < target.token_number
  ).length;
}

/**
 * Estimated waiting time: 10 minutes per patient ahead (minimum 10 minutes
 * if you're the next to be called, based on the per-patient average).
 */
export function getEstimatedWaitMinutes(appointments: Appointment[], targetToken: string): number {
  const ahead = getPatientsAhead(appointments, targetToken);
  return (ahead + 1) * ESTIMATED_MINUTES_PER_PATIENT;
}

/**
 * Filters appointments to only those actively in the queue today.
 */
export function getActiveQueue(appointments: Appointment[]): Appointment[] {
  return appointments
    .filter((a) => a.status === 'waiting')
    .sort((a, b) => a.token_number.localeCompare(b.token_number));
}

export function formatTime(dateStr: string | null): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}
