'use client';

import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  Lightbulb,
  Shield,
  FileSearch,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { ReportAnalysis } from '@/types';

interface AnalysisPanelProps {
  analysis: ReportAnalysis;
}

export default function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <FileSearch className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">Summary</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {analysis.summary}
            </p>
          </div>
        </div>
      </Card>

      {/* Key Findings */}
      {analysis.key_findings.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Key Findings
          </h3>
          <ul className="space-y-2">
            {analysis.key_findings.map((finding, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                {finding}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Abnormal Values */}
      {analysis.abnormal_values.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Abnormal Values
          </h3>
          <div className="grid gap-3">
            {analysis.abnormal_values.map((val, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border ${
                  val.status === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : val.status === 'high'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-slate-800">
                    {val.parameter}
                  </span>
                  <Badge
                    variant={
                      val.status === 'critical'
                        ? 'danger'
                        : val.status === 'high'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {val.status === 'high' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {val.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="text-sm">
                    <span className="text-slate-500">Value: </span>
                    <span className="font-semibold text-slate-800">{val.value}</span>
                  </span>
                  <span className="text-sm">
                    <span className="text-slate-500">Normal: </span>
                    <span className="text-slate-600">{val.normal_range}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Risk Flags */}
      {analysis.risk_flags.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-500" />
            Risk Flags
          </h3>
          <div className="grid gap-3">
            {analysis.risk_flags.map((flag, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border ${
                  flag.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : flag.severity === 'medium'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-slate-800">
                    {flag.condition}
                  </span>
                  <Badge
                    variant={
                      flag.severity === 'high'
                        ? 'danger'
                        : flag.severity === 'medium'
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {flag.severity}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{flag.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* No Issues */}
      {analysis.abnormal_values.length === 0 &&
        analysis.risk_flags.length === 0 && (
          <Card className="bg-emerald-50 border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">
                  All Values Normal
                </h3>
                <p className="text-sm text-emerald-600">
                  No abnormal values or risk flags were found in this report.
                </p>
              </div>
            </div>
          </Card>
        )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-emerald-500" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
