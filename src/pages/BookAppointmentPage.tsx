import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CalendarPlus,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { supabase, type Appointment } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { DEPARTMENT, ESTIMATED_MINUTES_PER_PATIENT } from '@/lib/constants';

const REASONS = [
  'Routine Check-up',
  'Tooth Cleaning',
  'Cavity Filling',
  'Tooth Extraction',
  'Root Canal',
  'Tooth Pain / Sensitivity',
  'Dental Consultation',
  'Other',
];

export default function BookAppointmentPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<Appointment | null>(null);

  const finalReason = reason === 'Other' ? customReason : reason;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!finalReason.trim()) {
      setError('Please select or describe a reason for your visit.');
      return;
    }

    setLoading(true);

    const { data, error: rpcError } = await supabase.rpc('book_appointment', {
      p_reason: finalReason.trim(),
      p_appointment_date: appointmentDate,
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    setSuccess(data as Appointment);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header activePage="book" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/60 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Appointment Booked!</h2>
            <p className="mt-2 text-slate-500">Your queue token has been generated successfully.</p>

            <div className="mt-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20">
              <div className="text-sm text-blue-200 uppercase tracking-wider font-medium">Your Token Number</div>
              <div className="text-5xl font-bold tracking-tight mt-1">{success.token_number}</div>
              <div className="mt-4 flex items-center justify-center gap-2 text-blue-100">
                <Stethoscope className="w-4 h-4" />
                <span className="text-sm">{DEPARTMENT} Department</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs text-slate-400 uppercase font-medium">Reason</div>
                <div className="text-sm font-semibold text-slate-800 mt-1">{success.reason}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs text-slate-400 uppercase font-medium">Est. Wait Time</div>
                <div className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {ESTIMATED_MINUTES_PER_PATIENT} minutes
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/queue')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
              >
                View Queue Status
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header activePage="book" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Book an Appointment</h1>
          <p className="mt-1 text-slate-500">Schedule a visit with our dental department.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Department banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold">{DEPARTMENT} Department</div>
              <div className="text-sm text-blue-200">Estimated {ESTIMATED_MINUTES_PER_PATIENT} minutes per patient</div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Patient Name</label>
                <div className="px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600">
                  {profile?.full_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Appointment Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Visit</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-all ${
                        reason === r
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${reason === r ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`} />
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {reason === 'Other' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Describe your reason</label>
                  <input
                    type="text"
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Briefly describe your dental concern"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !finalReason.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Booking your appointment...
                    </>
                  ) : (
                    <>
                      <CalendarPlus className="w-4 h-4" />
                      Book Appointment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
          <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            You will receive a unique queue token (e.g. TN-001) and an initial estimated wait time of {ESTIMATED_MINUTES_PER_PATIENT} minutes.
            The wait time updates as patients ahead of you are seen.
          </span>
        </div>
      </div>
    </div>
  );
}
