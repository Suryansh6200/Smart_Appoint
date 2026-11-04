import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus,
  ListOrdered,
  Clock,
  Calendar,
  TrendingUp,
  Loader2,
  Stethoscope,
  ArrowRight,
} from 'lucide-react';
import { supabase, type Appointment } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, formatTime, isToday, getPatientsAhead } from '@/lib/queue';
import { ESTIMATED_MINUTES_PER_PATIENT } from '@/lib/constants';

export default function PatientDashboard() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allTodayAppointments, setAllTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading appointments:', error);
      setLoading(false);
      return;
    }
    setAppointments((data as Appointment[]) || []);

    // Load all today's appointments for queue position calculation
    const { data: todayData } = await supabase
      .from('appointments')
      .select('*')
      .gte('created_at', new Date().toISOString().split('T')[0])
      .order('token_number', { ascending: true });
    setAllTodayAppointments((todayData as Appointment[]) || []);

    setLoading(false);
  }, [profile]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const todayAppointments = appointments.filter((a) => isToday(a.created_at));
  const activeAppointment = todayAppointments.find(
    (a) => a.status === 'waiting' || a.status === 'called' || a.status === 'in_progress'
  );
  const stats = [
    {
      label: 'Total Appointments',
      value: appointments.length,
      icon: Calendar,
      color: 'bg-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Today',
      value: todayAppointments.filter((a) => a.status !== 'completed' && a.status !== 'cancelled').length,
      icon: TrendingUp,
      color: 'bg-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'Completed',
      value: appointments.filter((a) => a.status === 'completed').length,
      icon: Stethoscope,
      color: 'bg-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header activePage="dashboard" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header activePage="dashboard" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back, {profile?.full_name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-slate-500">Here's an overview of your dental appointments.</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active appointment highlight */}
        {activeAppointment ? (
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-600/20 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-2">
                  <Clock className="w-4 h-4" />
                  Your Active Appointment
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold tracking-tight">{activeAppointment.token_number}</span>
                  <StatusBadge status={activeAppointment.status} size="sm" />
                </div>
                <p className="mt-2 text-blue-100 text-sm">{activeAppointment.reason}</p>
              </div>
              <div className="flex gap-6">
                {activeAppointment.status === 'waiting' && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {getPatientsAhead(allTodayAppointments, activeAppointment.token_number) + 1}
                    </div>
                    <div className="text-xs text-blue-200">Position in Queue</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {(getPatientsAhead(allTodayAppointments, activeAppointment.token_number) + 1) * ESTIMATED_MINUTES_PER_PATIENT}
                  </div>
                  <div className="text-xs text-blue-200">Est. Wait (min)</div>
                </div>
                <Link
                  to="/queue"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors self-center"
                >
                  View Queue
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">No active appointment</h3>
                <p className="mt-1 text-sm text-slate-500">Book a dental appointment to get your queue token.</p>
              </div>
              <Link
                to="/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
              >
                <CalendarPlus className="w-4 h-4" />
                Book Appointment
              </Link>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link to="/book" className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <CalendarPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">Book New Appointment</h3>
                <p className="text-sm text-slate-500">Schedule a visit with the dentist</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>
          <Link to="/queue" className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <ListOrdered className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">Check Queue Status</h3>
                <p className="text-sm text-slate-500">See live queue and your wait time</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>
        </div>

        {/* Appointment history */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Appointment History</h3>
          </div>
          {appointments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No appointments yet. Book your first one!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.map((appt) => (
                <div key={appt.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-medium text-slate-400 uppercase">{new Date(appt.created_at).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-bold text-slate-700 leading-none">{new Date(appt.created_at).getDate()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{appt.token_number}</span>
                        <StatusBadge status={appt.status} size="sm" />
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">{appt.reason}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {formatDate(appt.created_at)} at {formatTime(appt.created_at)}
                      </div>
                    </div>
                  </div>
                  {appt.status === 'completed' && appt.completed_at && (
                    <div className="text-xs text-slate-400 sm:text-right">
                      Completed at {formatTime(appt.completed_at)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
