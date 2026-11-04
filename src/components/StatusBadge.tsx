import type { AppointmentStatus } from '@/lib/supabase';
import { STATUS_CONFIG } from '@/lib/constants';

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizing = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.bg} ${config.text} ${config.border} border ${sizing}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} ${status === 'in_progress' ? 'animate-pulse' : ''}`} />
      {config.label}
    </span>
  );
}
