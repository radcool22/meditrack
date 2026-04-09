'use client';

import { useState, useRef } from 'react';
import { Upload, FileUp, X, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useDashboard } from '@/context/DashboardContext';
import { cn } from '@/lib/utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { selectedProfile, refreshReports } = useDashboard();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return 'Invalid file type. Please upload a PDF, JPG, PNG, or WebP file.';
    }
    if (f.size > MAX_SIZE) {
      return 'File too large. Maximum size is 20MB.';
    }
    return null;
  };

  const handleFileSelect = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleUpload = async () => {
    if (!file || !selectedProfile) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('profileId', selectedProfile.id);

      const res = await fetch('/api/reports/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await refreshReports();
      onClose();
      setFile(null);
      router.push(`/reports/${data.report.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Medical Report">
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : file
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileUp className="w-10 h-10 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700">
                {file.name}
              </p>
              <p className="text-xs text-emerald-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors mt-1"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Upload className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Drop your report here or click to browse
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PDF, JPG, PNG, WebP — up to 20MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile info */}
        {selectedProfile && (
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-2.5">
            <span className="font-medium">Uploading for:</span>
            <span className="text-slate-700">{selectedProfile.name}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            loading={uploading}
            disabled={!file}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload & Analyze'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
