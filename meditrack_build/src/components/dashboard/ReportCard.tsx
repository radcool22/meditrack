'use client';

import { useRouter } from 'next/navigation';
import { FileText, Image, Clock, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatRelativeDate, isPDFFile } from '@/lib/utils';
import type { Report } from '@/types';

interface ReportCardProps {
  report: Report;
}

export default function ReportCard({ report }: ReportCardProps) {
  const router = useRouter();

  const hasAnalysis = !!report.analysis;
  const abnormalCount = report.analysis?.abnormal_values?.length || 0;
  const riskCount = report.analysis?.risk_flags?.length || 0;

  return (
    <Card
      hover
      onClick={() => router.push(`/reports/${report.id}`)}
      className="group"
    >
      <div className="flex items-start gap-4">
        {/* File icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
          {isPDFFile(report.file_type) ? (
            <FileText className="w-6 h-6 text-red-500" />
          ) : (
            <Image className="w-6 h-6 text-blue-500" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 truncate">
                {report.file_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {formatRelativeDate(report.created_at)}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2 mt-3">
            {hasAnalysis ? (
              <>
                {abnormalCount > 0 ? (
                  <Badge variant="warning">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {abnormalCount} abnormal
                  </Badge>
                ) : (
                  <Badge variant="success">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    All normal
                  </Badge>
                )}
                {riskCount > 0 && (
                  <Badge variant="danger">
                    {riskCount} risk flag{riskCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </>
            ) : (
              <Badge variant="info">Pending analysis</Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
