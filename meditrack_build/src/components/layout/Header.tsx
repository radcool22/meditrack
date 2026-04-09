'use client';

import { Bell } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { getGreeting } from '@/lib/utils';

export default function Header() {
  const { user, selectedProfile } = useDashboard();

  const displayName =
    user?.name ||
    (selectedProfile?.name === 'Myself' ? 'there' : selectedProfile?.name) ||
    'there';

  return (
    <header className="flex items-center justify-between pb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {getGreeting()},{' '}
          <span className="text-blue-600">{displayName}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Here&apos;s your health overview
        </p>
      </div>
      <button className="relative p-2.5 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm">
        <Bell className="w-5 h-5 text-slate-500" />
      </button>
    </header>
  );
}
