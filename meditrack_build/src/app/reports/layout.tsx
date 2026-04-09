'use client';

import { DashboardProvider } from '@/context/DashboardContext';
import Sidebar from '@/components/layout/Sidebar';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}
