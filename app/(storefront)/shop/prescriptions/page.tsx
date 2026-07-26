/* eslint-disable @typescript-eslint/no-explicit-any -- Enabled to parse nested Supabase and Tesseract error payloads */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Tesseract from 'tesseract.js';
import { Button } from '@/components/ui/button';

export default function PrescriptionUploadPage() {
  const supabase = createClient();

  // Upload and OCR states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setOcrText(null);
    setOcrProgress(null);

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Invalid file format. Please upload an image file (PNG/JPEG/WEBP).');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleProcessPrescription = async () => {
    if (!selectedFile || !previewUrl) return;

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setOcrText(null);

    try {
      // 1. Attempt upload to Supabase Storage bucket 'prescriptions'
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_prescription.${fileExt}`;
      const filePath = `customer_uploads/${fileName}`;

      // Upload and handle missing bucket gracefully
      const { error: uploadErr } = await supabase.storage
        .from('prescriptions')
        .upload(filePath, selectedFile);

      if (uploadErr) {
        console.warn(
          'Supabase storage upload skipped (bucket setup may be pending):',
          uploadErr.message
        );
      } else {
        setSuccessMsg('Prescription image backed up to secure store.');
      }

      // 2. Perform client-side OCR using Tesseract.js
      setOcrProgress(0);
      const ocrResult = await Tesseract.recognize(selectedFile, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const parsedText = ocrResult.data.text;
      setOcrText(
        parsedText || 'No legible words detected. Please verify prescription image clarity.'
      );
    } catch (err: any) {
      setErrorMsg('Exception occurred during OCR processing: ' + err.message);
    } finally {
      setUploading(false);
      setOcrProgress(null);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrText(null);
    setOcrProgress(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="space-y-8 font-sans max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header back button */}
      <div className="space-y-4">
        <Link
          href="/shop"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
        >
          ← Back to Shop Grid
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            AI Prescription Scanner
          </h1>
          <p className="text-sm text-slate-500">
            Upload prescription sheets for secure backup and client-side OCR verification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Upload panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Upload Document
          </h3>

          {!previewUrl ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-10 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all text-center">
              <span className="text-3xl mb-3">📄</span>
              <span className="text-xs font-bold text-slate-800">Select prescription image</span>
              <span className="text-[10px] text-slate-500 mt-1">
                PNG, JPG, WEBP formats supported
              </span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative border border-slate-200 rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Prescription preview"
                  className="object-contain h-full w-full"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={resetForm}
                  className="flex-1 rounded-xl border border-slate-200 text-slate-550 hover:bg-slate-50 text-xs font-bold py-2.5 transition-colors"
                >
                  Discard Image
                </button>
                <Button
                  onClick={handleProcessPrescription}
                  disabled={uploading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 text-xs"
                >
                  {uploading ? 'Processing OCR...' : 'Scan & Backup'}
                </Button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="border border-red-200 bg-red-50 p-3 rounded-xl text-[10px] text-red-750">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="border border-emerald-200 bg-emerald-50 p-3 rounded-xl text-[10px] text-emerald-755">
              ✅ {successMsg}
            </div>
          )}
        </div>

        {/* OCR Result logs panel */}
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-premium space-y-4 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-4 flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider border-b border-slate-850 pb-2">
              Extracted Medical Data
            </h3>

            {ocrProgress !== null && (
              <div className="space-y-2 py-8 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center text-[10px] text-teal-450 font-bold uppercase">
                  <span>Running Tesseract.js Worker...</span>
                  <span className="font-mono">{ocrProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                  <div
                    className="bg-teal-500 h-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
            )}

            {!uploading && !ocrText && (
              <div className="text-center py-12 text-slate-500 text-xs flex-1 flex flex-col justify-center">
                <p>Upload and scan a prescription to extract drug matches dynamically.</p>
              </div>
            )}

            {ocrText && (
              <div className="flex-1 flex flex-col">
                <div className="bg-slate-900 border border-slate-900 rounded-xl p-4 font-mono text-[10px] text-slate-300 overflow-y-auto max-h-[220px] whitespace-pre-wrap flex-1">
                  {ocrText}
                </div>
              </div>
            )}
          </div>

          {ocrText && (
            <div className="bg-slate-900/40 border border-slate-850/50 p-3 rounded-xl text-[9px] text-slate-450 leading-relaxed">
              <span className="font-bold text-teal-450 uppercase block">💡 AI Copilot Hint:</span>
              OCR scanning allows instant inventory matching on the checkout desk without manual
              entry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
