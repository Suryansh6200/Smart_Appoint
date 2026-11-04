import { Link } from 'react-router-dom';
import { Stethoscope, LogOut, LayoutDashboard, CalendarPlus, ListOrdered, UserCog } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SERVICE_NAME } from '@/lib/constants';

interface HeaderProps {
  activePage?: string;
}

export default function Header({ activePage }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const isStaff = profile?.role === 'staff';

  const navItems = isStaff
    ? [{ label: 'Staff Dashboard', path: '/staff', icon: UserCog, key: 'staff' }]
    : [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
        { label: 'Book Appointment', path: '/book', icon: CalendarPlus, key: 'book' },
        { label: 'Queue Status', path: '/queue', icon: ListOrdered, key: 'queue' },
      ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={profile ? (isStaff ? '/staff' : '/dashboard') : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-shadow">
              <Stethoscope className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold text-slate-900 tracking-tight">{SERVICE_NAME}</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Dental Care</span>
            </div>
          </Link>

          {profile && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.key;
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {profile ? (
              <>
                <div className="hidden sm:flex flex-col items-end leading-none">
                  <span className="text-sm font-semibold text-slate-800">{profile.full_name}</span>
                  <span className={`text-[10px] font-medium uppercase tracking-wide ${isStaff ? 'text-blue-600' : 'text-slate-400'}`}>
                    {isStaff ? 'Staff' : 'Patient'}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {profile && (
          <nav className="md:hidden flex items-center gap-1 pb-3 -mt-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
