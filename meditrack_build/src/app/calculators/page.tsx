'use client';

import { DashboardProvider } from '@/context/DashboardContext';
import Sidebar from '@/components/layout/Sidebar';
import BMICalculator from '@/components/calculators/BMICalculator';
import VO2MaxCalculator from '@/components/calculators/VO2MaxCalculator';
import CalorieCalculator from '@/components/calculators/CalorieCalculator';
import { Calculator } from 'lucide-react';

export default function CalculatorsPage() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <Calculator className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-800">
                  Health Calculators
                </h1>
              </div>
              <p className="text-sm text-slate-500">
                Quick tools to estimate key health metrics
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <BMICalculator />
              <VO2MaxCalculator />
              <CalorieCalculator />
            </div>
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}
