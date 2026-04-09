'use client';

import { useState } from 'react';
import { FileText, TrendingUp } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import Header from '@/components/layout/Header';
import GreetingCard from '@/components/dashboard/GreetingCard';
import ProfileToggle from '@/components/dashboard/ProfileToggle';
import ReportCard from '@/components/dashboard/ReportCard';
import UploadModal from '@/components/dashboard/UploadModal';
import Loading from '@/components/ui/Loading';
import Card from '@/components/ui/Card';

export default function DashboardPage() {
  const { reports, loading, reportsLoading } = useDashboard();
  const [showUpload, setShowUpload] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  // Get latest analyzed report for quick insights
  const latestAnalyzed = reports.find((r) => r.analysis);
  const totalAbnormal = reports.reduce(
    (sum, r) => sum + (r.analysis?.abnormal_values?.length || 0),
    0
  );
  const totalReports = reports.length;
  const analyzedReports = reports.filter((r) => r.analysis).length;

  return (
    <div className="space-y-6">
      <Header />

      <GreetingCard onUploadClick={() => setShowUpload(true)} />

      <ProfileToggle />

      {/* Quick Stats */}
      {totalReports > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalReports}</p>
                <p className="text-xs text-slate-500">Total Reports</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{analyzedReports}</p>
                <p className="text-xs text-slate-500">Analyzed</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalAbnormal}</p>
                <p className="text-xs text-slate-500">Abnormal Values</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <TrendingUp className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {totalAbnormal === 0 && analyzedReports > 0 ? '✓' : totalReports - analyzedReports}
                </p>
                <p className="text-xs text-slate-500">
                  {totalAbnormal === 0 && analyzedReports > 0 ? 'All Clear' : 'Pending'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Latest Report Insights */}
      {latestAnalyzed?.analysis && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-3 text-sm">
            Latest Report Insights
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            {latestAnalyzed.analysis.summary}
          </p>
          {latestAnalyzed.analysis.abnormal_values.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {latestAnalyzed.analysis.abnormal_values.slice(0, 4).map((val, i) => (
                <span
                  key={i}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    val.status === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : val.status === 'high'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {val.parameter}: {val.value}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Reports List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Your Reports</h2>
          <span className="text-sm text-slate-400">{totalReports} reports</span>
        </div>

        {reportsLoading ? (
          <Loading text="Loading reports..." className="py-12" />
        ) : reports.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 mb-1">
              No reports yet
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Upload your first medical report to get AI-powered insights
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Upload Report
            </button>
          </Card>
        ) : (
          <div className="grid gap-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>

      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} />
    </div>
  );
}
