'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import ReportViewer from '@/components/reports/ReportViewer';
import AnalysisPanel from '@/components/reports/AnalysisPanel';
import TTSButton from '@/components/reports/TTSButton';
import ChatPanel from '@/components/chat/ChatPanel';
import type { Report } from '@/types';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}`);
      if (!res.ok) throw new Error('Report not found');
      const data = await res.json();
      setReport(data.report);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Auto-trigger analysis if not yet analyzed
  useEffect(() => {
    if (report && !report.analysis && !analyzing) {
      triggerAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id]);

  const triggerAnalysis = async () => {
    setAnalyzing(true);
    setError('');

    try {
      const res = await fetch(`/api/reports/${reportId}/analysis`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await res.json();
      setReport(data.report);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Analysis failed. Please try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Loading report..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-700 mb-2">
          Report Not Found
        </h2>
        <p className="text-sm text-slate-500 mb-4">{error || 'This report may have been deleted.'}</p>
        <Button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              {report.file_name}
            </h1>
            <p className="text-xs text-slate-400">
              Uploaded {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        {report.analysis && (
          <TTSButton text={report.analysis.summary} />
        )}
      </div>

      {/* Report viewer */}
      {report.signed_file_url && (
        <ReportViewer
          fileUrl={report.signed_file_url}
          fileType={report.file_type}
          fileName={report.file_name}
        />
      )}

      {/* Analysis section */}
      {analyzing ? (
        <Card className="py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-slate-800 mb-1">
                Analyzing Your Report
              </h3>
              <p className="text-sm text-slate-500">
                Extracting text and generating AI insights...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                This may take 15-30 seconds
              </p>
            </div>
          </div>
        </Card>
      ) : error && !report.analysis ? (
        <Card className="py-8">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
            <Button onClick={triggerAnalysis} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
              Retry Analysis
            </Button>
          </div>
        </Card>
      ) : report.analysis ? (
        <AnalysisPanel analysis={report.analysis} />
      ) : null}

      {/* Chat */}
      <ChatPanel reportId={reportId} isReady={!!report.analysis} />
    </div>
  );
}
