'use client';

import { isImageFile, isPDFFile } from '@/lib/utils';

interface ReportViewerProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
}

export default function ReportViewer({ fileUrl, fileType, fileName }: ReportViewerProps) {
  if (isImageFile(fileType)) {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fileUrl}
          alt={fileName}
          className="w-full h-auto max-h-[500px] object-contain"
        />
      </div>
    );
  }

  if (isPDFFile(fileType)) {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
        <iframe
          src={`${fileUrl}#view=FitH`}
          className="w-full h-[500px]"
          title={fileName}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
      <p className="text-slate-500 text-sm">Preview not available for this file type.</p>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline text-sm mt-2 inline-block"
      >
        Download file
      </a>
    </div>
  );
}
