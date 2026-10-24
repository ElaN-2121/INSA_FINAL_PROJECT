import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  FileCheck2,
  X,
} from 'lucide-react';
import { api } from '@ethiocred/utils';
import { Button, Stepper, Card, Loader, Alert } from '@ethiocred/ui';

export default function UploadBatch() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (selected) => {
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected);
      setError('');
      setResult(null);
    } else {
      setError('Please select a valid CSV file (.csv).');
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/credentials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload and validation failed');
    } finally {
      setUploading(false);
    }
  };

  const handleProceed = () => {
    if (!result?.batchId) return;
    navigate(`/staging/${result.batchId}`, { state: result });
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'full_name,fayda_id,degree_name,major,graduation_year,gpa\n' +
      'Abebe Bekele Tessema,FAYDA-001,Bachelor of Science in Computer Science,Software Engineering,2024,3.89\n' +
      'Almaz Hailemariam,FAYDA-042,Bachelor of Science in Information Systems,Network Security,2024,3.95\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ethiocred_graduation_template.csv';
    link.click();
  };

  const stepperSteps = [
    { title: '1. Upload CSV', description: 'Ingest student roster', status: result ? 'complete' : 'current' },
    { title: '2. Review & Stage', description: 'Validate records', status: result ? 'current' : 'upcoming' },
    { title: '3. Issue & Sign', description: 'RSA-2048 sealing', status: 'upcoming' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Workflow Stepper */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <Stepper steps={stepperSteps} orientation="horizontal" />
      </div>

      {/* Page Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
          Registrar Console
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-950 font-display mt-1">
          Upload Graduation Batch
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your graduating class roster in CSV format to stage for cryptographic verification and digital issuance.
        </p>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all duration-200 ${
          dragging
            ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
            : file
            ? 'border-emerald-400 bg-emerald-50/20'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50 shadow-soft'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 shadow-soft mb-4">
          <UploadCloud size={32} />
        </div>

        {file ? (
          <div className="space-y-1">
            <p className="text-base font-bold text-navy-950 font-display">
              {file.name}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              {(file.size / 1024).toFixed(1)} KB · CSV Document
            </p>
            <p className="text-xs text-emerald-700 font-semibold pt-1">
              File ready for pre-flight validation. Click "Validate & Upload" below.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-base font-bold text-navy-950 font-display">
              Drag & drop graduation roster CSV here
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Supports standard UTF-8 encoded CSV with columns: <span className="font-mono text-slate-700">full_name, fayda_id, degree_name, major, graduation_year, gpa</span>
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50">
                Browse Computer Files
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={Download}
          onClick={handleDownloadTemplate}
        >
          Download CSV Schema Template
        </Button>

        {file && !result && (
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={uploading}
            loadingText="Validating & Ingesting..."
            onClick={handleUpload}
            className="bg-navy-900 hover:bg-navy-800 text-white w-full sm:w-auto"
          >
            Validate & Ingest Batch
          </Button>
        )}
      </div>

      {/* Pre-flight Ingestion Summary Box */}
      {result && (
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 p-6 shadow-soft space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-navy-950 font-display">
                  Batch Successfully Ingested
                </h3>
                <p className="text-xs text-slate-600 font-mono">
                  Batch Reference: {result.batchId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="font-semibold text-emerald-800">
                {result.valid?.length || 0} Valid Records
              </span>
              {(result.invalid?.length || 0) > 0 && (
                <span className="font-semibold text-red-700">
                  {result.invalid.length} Errors Found
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            The batch is staged in memory. Proceed to the Staging Dashboard to review records and trigger permanent RSA-2048 cryptographic signing.
          </p>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              rightIcon={ArrowRight}
              onClick={handleProceed}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Proceed to Staging Review
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
