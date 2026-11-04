import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Clock,
  CalendarCheck,
  ListOrdered,
  ShieldCheck,
  ArrowRight,
  Activity,
  Users,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SERVICE_NAME, TAGLINE, DEPARTMENT } from '@/lib/constants';

export default function HomePage() {
  const { profile } = useAuth();
  const isStaff = profile?.role === 'staff';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Now serving: {DEPARTMENT} Department
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                {SERVICE_NAME}
              </h1>
              <p className="mt-3 text-xl sm:text-2xl text-blue-200 font-light">
                {TAGLINE}
              </p>
              <p className="mt-6 text-blue-100/80 text-lg leading-relaxed max-w-xl">
                Book your dental appointment online, get a queue token instantly,
                and check your estimated wait time from anywhere. No more standing
                in long lines at the clinic.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                {profile ? (
                  <Link
                    to={isStaff ? '/staff' : '/dashboard'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-800 font-semibold hover:bg-blue-50 transition-all shadow-lg shadow-blue-950/30 hover:scale-[1.02]"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-800 font-semibold hover:bg-blue-50 transition-all shadow-lg shadow-blue-950/30 hover:scale-[1.02]"
                    >
                      Book Your Appointment
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-700/50 border border-blue-400/30 text-white font-semibold hover:bg-blue-700/80 transition-all backdrop-blur-sm"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mock dashboard preview */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-3xl blur-2xl" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-white">Your Queue Token</span>
                    </div>
                    <span className="text-xs text-blue-200">Today</span>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                    <div className="text-xs text-blue-200 uppercase tracking-wider font-medium">Token Number</div>
                    <div className="text-4xl font-bold text-white mt-1 tracking-tight">TN-001</div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-blue-200">Position in Queue</div>
                        <div className="text-lg font-semibold text-white">2nd</div>
                      </div>
                      <div className="h-10 w-px bg-white/20" />
                      <div>
                        <div className="text-xs text-blue-200">Est. Wait Time</div>
                        <div className="text-lg font-semibold text-white">20 min</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="flex-1 bg-white/10 rounded-xl p-3 border border-white/10">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs text-blue-100">Waiting</span>
                      </div>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-xl p-3 border border-white/10">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-blue-200" />
                        <span className="text-xs text-blue-100">Live updates</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              A smarter way to visit the dentist
            </h2>
            <p className="mt-4 text-slate-600 text-lg">
              Everything you need to manage your dental appointments, from booking
              to queue tracking — all in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CalendarCheck, title: 'Easy Booking', desc: 'Book your dentist appointment in seconds with a simple online form.', color: 'bg-blue-600' },
              { icon: ListOrdered, title: 'Instant Token', desc: 'Get a unique queue token like TN-001 the moment you book.', color: 'bg-amber-500' },
              { icon: Clock, title: 'Live Wait Time', desc: 'Check your estimated wait time based on patients ahead of you.', color: 'bg-emerald-600' },
              { icon: ShieldCheck, title: 'Secure Access', desc: 'Your appointments and personal data are protected with secure login.', color: 'bg-indigo-600' },
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all">
                  <div className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              How it works
            </h2>
            <p className="mt-4 text-slate-600 text-lg">
              Three simple steps from booking to seeing the dentist.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200" />
            {[
              { step: '01', icon: CalendarCheck, title: 'Register & Book', desc: 'Create your account and book a dental appointment with just a few details.' },
              { step: '02', icon: ListOrdered, title: 'Get Your Token', desc: 'Receive an automatically generated queue token and see your position instantly.' },
              { step: '03', icon: Activity, title: 'Track & Visit', desc: 'Monitor the live queue and your estimated wait time. Walk in when it is your turn.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center">
                  <div className="relative inline-flex w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center shadow-lg shadow-blue-600/20">
                    <Icon className="w-10 h-10 text-white" strokeWidth={1.8} />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 shadow-sm">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats / CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: '10 min', label: 'Avg. wait per patient', icon: Clock },
              { value: '1', label: 'Service: Dentist', icon: Stethoscope },
              { value: '24/7', label: 'Online booking', icon: Users },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center">
                  <Icon className="w-6 h-6 text-blue-200 mb-2" />
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</div>
                  <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Ready to skip the line?
          </h2>
          <p className="mt-4 text-slate-600 text-lg">
            Join {SERVICE_NAME} today and experience hassle-free dental visits.
          </p>
          {!profile && (
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-[1.02]"
            >
              Create Your Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>{SERVICE_NAME} — {TAGLINE}</p>
        </div>
      </footer>
    </div>
  );
}
