'use client';

import { Upload } from 'lucide-react';
import { getGreeting } from '@/lib/utils';
import { useDashboard } from '@/context/DashboardContext';

interface GreetingCardProps {
  onUploadClick: () => void;
}

export default function GreetingCard({ onUploadClick }: GreetingCardProps) {
  const { user, selectedProfile, reports } = useDashboard();

  const displayName =
    user?.name ||
    (selectedProfile?.name === 'Myself' ? 'Kabir' : selectedProfile?.name) ||
    'there';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-lg">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {getGreeting()}, {displayName} 👋
          </h2>
          <p className="text-blue-100 mt-1 text-sm">
            {reports.length > 0
              ? `You have ${reports.length} report${reports.length > 1 ? 's' : ''} uploaded`
              : 'Upload your first medical report to get started'}
          </p>
        </div>
        <button
          onClick={onUploadClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors shadow-md"
        >
          <Upload className="w-4 h-4" />
          Upload Report
        </button>
      </div>
    </div>
  );
}
