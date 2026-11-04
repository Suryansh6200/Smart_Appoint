import { useEffect, useState, useCallback } from 'react';
import {
  UserCog,
  Loader2,
  Phone,
  User,
  RefreshCw,
  Stethoscope,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Megaphone,
} from 'lucide-react';
import { supabase, type AppointmentWithProfile, type AppointmentStatus, type Appointment } from '@/lib/supabase';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { formatTime, getActiveQueue } from '@/lib/queue';
import { STATUS_CONFIG, ESTIMATED_MINUTES_PER_PATIENT } from '@/lib/constants';

export default function StaffDashboardPage() {
  const [appointments, setAppointments] = useState<AppointmentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<AppointmentStatus | 'all' | 'active'>('active');

  const loadAppointments = useCallback(async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        profiles:user_id (full_name, phone)
      `)
      .order('token_number', { ascending: true });

    if (error) {
      console.error('Error loading appointments:', error);
      setLoading(false);
      return;
    }
    setAppointments((data as AppointmentWithProfile[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 10000);
    return () => clearInterval(interval);
  }, [loadAppointments]);

  const updateStatus = async (apptId: string, newStatus: AppointmentStatus) => {
    setUpdatingId(apptId);
    const { error } = await supabase.rpc('update_appointment_status', {
      p_appointment_id: apptId,
      p_new_status: newStatus,
    });

    if (error) {
      console.error('Error updating status:', error);
      setUpdatingId(null);
      return;
    }
    await loadAppointments();
    setUpdatingId(null);
  };

  const callNext = async () => {
    const queue = getActiveQueue(appointments as Appointment[]);
    if (queue.length === 0) return;
    const next = queue[0];
    await updateStatus(next.id, 'called');
  };

  const filtered = appointments.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'active') return a.status === 'waiting' || a.status === 'called' || a.status === 'in_progress';
    return a.status === filter;
  });

  const stats = {
    waiting: appointments.filter((a) => a.status === 'waiting').length,
    inProgress: appointments.filter((a) => a.status === 'in_progress').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    total: appointments.length,
  };

  const currentPatient = appointments.find((a) => a.status === 'called' || a.status === 'in_progress');
  const nextInQueue = appointments.filter((a) => a.status === 'waiting').sort((a, b) => a.token_number.localeCompare(b.token_number));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header activePage="staff" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header activePage="staff" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <UserCog className="w-7 h-7 text-blue-600" />
              Staff Dashboard
            </h1>
            <p className="mt-1 text-slate-500">Manage the dentist queue and appointment statuses.</p>
          </div>
          <button
            onClick={loadAppointments}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Waiting', value: stats.waiting, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'In Progress', value: stats.inProgress, icon: PlayCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Today', value: stats.total, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Current patient + Call next */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Now Serving</h3>
            {currentPatient ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{currentPatient.token_number}</div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      {currentPatient.profiles?.full_name || 'Unknown patient'}
                    </div>
                    {currentPatient.profiles?.phone && (
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {currentPatient.profiles.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={currentPatient.status} />
                  {currentPatient.status === 'called' && (
                    <button
                      onClick={() => updateStatus(currentPatient.id, 'in_progress')}
                      disabled={updatingId === currentPatient.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Start Treatment
                    </button>
                  )}
                  {currentPatient.status === 'in_progress' && (
                    <button
                      onClick={() => updateStatus(currentPatient.id, 'completed')}
                      disabled={updatingId === currentPatient.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Stethoscope className="w-7 h-7 text-slate-300" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-400">No patient being seen</div>
                  <div className="text-sm text-slate-400">Call the next patient from the queue.</div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20 flex flex-col justify-between">
            <div>
              <div className="text-sm text-blue-200 uppercase tracking-wider font-medium">Next in Queue</div>
              {nextInQueue.length > 0 ? (
                <>
                  <div className="text-3xl font-bold mt-2">{nextInQueue[0].token_number}</div>
                  <div className="text-sm text-blue-200 mt-1">
                    {nextInQueue[0].profiles?.full_name || 'Unknown'}
                  </div>
                  <div className="text-xs text-blue-300 mt-2">
                    {nextInQueue.length} patient{nextInQueue.length !== 1 ? 's' : ''} waiting · ~{nextInQueue.length * ESTIMATED_MINUTES_PER_PATIENT} min total
                  </div>
                </>
              ) : (
                <div className="text-lg text-blue-200 mt-4">Queue is empty</div>
              )}
            </div>
            <button
              onClick={callNext}
              disabled={nextInQueue.length === 0 || updatingId !== null}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Megaphone className="w-4 h-4" />
              Call Next Patient
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {(['active', 'all', 'waiting', 'called', 'in_progress', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : STATUS_CONFIG[f as AppointmentStatus].label}
            </button>
          ))}
        </div>

        {/* Appointment list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No appointments in this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((appt) => (
                <StaffAppointmentRow
                  key={appt.id}
                  appt={appt}
                  updating={updatingId === appt.id}
                  onUpdate={(status) => updateStatus(appt.id, status)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StaffAppointmentRow({
  appt,
  updating,
  onUpdate,
}: {
  appt: AppointmentWithProfile;
  updating: boolean;
  onUpdate: (status: AppointmentStatus) => void;
}) {
  return (
    <div className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: patient info */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{appt.token_number}</span>
              <StatusBadge status={appt.status} size="sm" />
            </div>
            <div className="text-sm text-slate-600 mt-0.5">
              {appt.profiles?.full_name || 'Unknown patient'}
              {appt.profiles?.phone && (
                <span className="text-slate-400 ml-2 flex items-center gap-1 inline-flex">
                  <Phone className="w-3 h-3" />{appt.profiles.phone}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {appt.reason} · Booked at {formatTime(appt.created_at)}
              {appt.completed_at && ` · Done at ${formatTime(appt.completed_at)}`}
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {updating ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          ) : (
            <>
              {appt.status === 'waiting' && (
                <button
                  onClick={() => onUpdate('called')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-medium text-xs hover:bg-amber-100 transition-colors border border-amber-200"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  Call
                </button>
              )}
              {appt.status === 'called' && (
                <>
                  <button
                    onClick={() => onUpdate('in_progress')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium text-xs hover:bg-indigo-100 transition-colors border border-indigo-200"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    Start
                  </button>
                  <button
                    onClick={() => onUpdate('cancelled')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-medium text-xs hover:bg-rose-100 transition-colors border border-rose-200"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </>
              )}
              {appt.status === 'in_progress' && (
                <button
                  onClick={() => onUpdate('completed')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-xs hover:bg-emerald-100 transition-colors border border-emerald-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Complete
                </button>
              )}
              {(appt.status === 'waiting' || appt.status === 'called') && (
                <button
                  onClick={() => onUpdate('cancelled')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-medium text-xs hover:bg-rose-100 transition-colors border border-rose-200"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
              {appt.status === 'completed' && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Done
                </span>
              )}
              {appt.status === 'cancelled' && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Cancelled
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
