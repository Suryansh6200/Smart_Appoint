import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Users,
  ListOrdered,
  CalendarPlus,
  Loader2,
  Stethoscope,
  RefreshCw,
} from 'lucide-react';
import { supabase, type Appointment } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { formatTime, getActiveQueue, getPatientsAhead, getQueuePosition } from '@/lib/queue';
import { ESTIMATED_MINUTES_PER_PATIENT } from '@/lib/constants';

export default function QueueStatusPage() {
  const { profile } = useAuth();
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    if (!profile) return;

    const [{ data: allData }, { data: myData }] = await Promise.all([
      supabase.from('appointments').select('*').order('token_number', { ascending: true }),
      supabase.from('appointments').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
    ]);

    setAllAppointments((allData as Appointment[]) || []);
    setMyAppointments((myData as Appointment[]) || []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 15000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  const activeQueue = getActiveQueue(allAppointments);
  const myActiveAppt = myAppointments.find(
    (a) => a.status === 'waiting' || a.status === 'called' || a.status === 'in_progress'
  );
  const patientsAhead = myActiveAppt ? getPatientsAhead(allAppointments, myActiveAppt.token_number) : 0;
  const queuePos = myActiveAppt ? getQueuePosition(allAppointments, myActiveAppt.token_number) : 0;
  const estWait = myActiveAppt ? (patientsAhead + 1) * ESTIMATED_MINUTES_PER_PATIENT : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header activePage="queue" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header activePage="queue" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Queue Status</h1>
            <p className="mt-1 text-slate-500">Live queue for the Dentist department.</p>
          </div>
          <button
            onClick={loadQueue}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: My appointment card */}
          <div className="lg:col-span-1 space-y-4">
            {myActiveAppt ? (
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20 sticky top-24">
                <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-3">
                  <Clock className="w-4 h-4" />
                  Your Appointment
                </div>
                <div className="text-4xl font-bold tracking-tight">{myActiveAppt.token_number}</div>
                <div className="mt-2">
                  <StatusBadge status={myActiveAppt.status} size="sm" />
                </div>

                <div className="mt-5 space-y-3">
                  <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-blue-200 uppercase tracking-wider font-medium">Queue Position</div>
                    <div className="text-2xl font-bold mt-1">
                      {myActiveAppt.status === 'waiting' ? `#${queuePos}` : '—'}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-blue-200 uppercase tracking-wider font-medium">Patients Ahead</div>
                    <div className="text-2xl font-bold mt-1 flex items-center gap-1.5">
                      <Users className="w-5 h-5 text-blue-300" />
                      {myActiveAppt.status === 'waiting' ? patientsAhead : 0}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-blue-200 uppercase tracking-wider font-medium">Estimated Wait Time</div>
                    <div className="text-2xl font-bold mt-1 flex items-center gap-1.5">
                      <Clock className="w-5 h-5 text-blue-300" />
                      {myActiveAppt.status === 'waiting' ? `${estWait} min` : '—'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-blue-200 bg-white/5 rounded-lg p-3 border border-white/10">
                  {myActiveAppt.status === 'waiting' && 'You are in the queue. We will update your status when the dentist is ready for you.'}
                  {myActiveAppt.status === 'called' && 'You have been called! Please proceed to the dental room.'}
                  {myActiveAppt.status === 'in_progress' && 'Your appointment is in progress.'}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900">No active appointment</h3>
                <p className="mt-1 text-sm text-slate-500">Book an appointment to join the queue.</p>
                <Link
                  to="/book"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Book Now
                </Link>
              </div>
            )}

            {/* Wait time explanation */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900">How wait time is calculated</h4>
              <p className="mt-1.5 text-xs text-blue-700 leading-relaxed">
                Each patient is estimated at {ESTIMATED_MINUTES_PER_PATIENT} minutes.
                Your wait time = (patients ahead + 1) × {ESTIMATED_MINUTES_PER_PATIENT} minutes.
                The queue auto-refreshes every 15 seconds.
              </p>
            </div>
          </div>

          {/* Right: Live queue list */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Live Queue</h3>
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {activeQueue.length} waiting
                </span>
              </div>

              {activeQueue.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">The queue is empty. The dentist is ready for the next patient!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeQueue.map((appt, idx) => {
                    const isMine = appt.user_id === profile?.id;
                    return (
                      <div
                        key={appt.id}
                        className={`px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
                          isMine ? 'bg-blue-50/60' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            isMine ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{appt.token_number}</span>
                              {isMine && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-500 mt-0.5">{appt.reason}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right hidden sm:block">
                            <div className="text-xs text-slate-400">Est. wait</div>
                            <div className="text-sm font-semibold text-slate-700">
                              {(idx + 1) * ESTIMATED_MINUTES_PER_PATIENT} min
                            </div>
                          </div>
                          <StatusBadge status={appt.status} size="sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recently completed */}
            {allAppointments.filter((a) => a.status === 'completed' || a.status === 'called' || a.status === 'in_progress').length > 0 && (
              <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">Currently Being Seen / Recently Completed</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {allAppointments
                    .filter((a) => a.status === 'called' || a.status === 'in_progress' || a.status === 'completed')
                    .slice(0, 5)
                    .map((appt) => {
                      const isMine = appt.user_id === profile?.id;
                      return (
                        <div key={appt.id} className={`px-6 py-3 flex items-center justify-between gap-4 ${isMine ? 'bg-blue-50/40' : ''}`}>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-700 text-sm">{appt.token_number}</span>
                            {isMine && <span className="text-[10px] font-bold text-blue-600">You</span>}
                            <span className="text-sm text-slate-500">{appt.reason}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {appt.completed_at && (
                              <span className="text-xs text-slate-400 hidden sm:inline">{formatTime(appt.completed_at)}</span>
                            )}
                            <StatusBadge status={appt.status} size="sm" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
