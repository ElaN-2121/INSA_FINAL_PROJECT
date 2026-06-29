import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText } from 'lucide-react';
import { api } from '@ethiocred/utils';
import Loader from '../../components/Loader/Loader.jsx';
import Table from '../../components/Table/Table.jsx';

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
      setError('Please select a valid CSV file.');
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
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleProceed = () => {
    if (!result?.batchId) return;
    navigate(`/staging/${result.batchId}`, { state: result });
  };

  const invalidColumns = [
    { key: 'row', label: 'Row', render: (item) => item.row?._rowIndex || '-' },
    { key: 'name', label: 'Name', render: (item) => item.row?.full_name || '-' },
    {
      key: 'errors',
      label: 'Errors',
      render: (item) => (
        <ul className="list-disc list-inside text-red-600 text-xs">
          {item.errors?.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Upload Graduation Batch</h2>
            <p className="text-sm text-slate-500 mt-1">
              Upload a CSV file containing student credentials for validation and issuance.
            </p>
          </div>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`group rounded-[1.75rem] border-2 border-dashed p-12 text-center transition-all duration-200 ${
          dragging
            ? 'border-blue-500 bg-blue-50/80 shadow-sm'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:shadow-sm'
        } cursor-pointer`}
      >
        <Upload className="mx-auto text-slate-400 transition group-hover:text-blue-600" size={48} />
        <p className="mt-4 text-lg font-semibold text-slate-900">Drag and drop your CSV file here</p>
        <p className="mt-2 text-sm text-slate-500">or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {file && (
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:flex-row sm:items-center">
          <FileText className="text-blue-600" size={24} />
          <div className="flex-1">
            <p className="font-semibold text-slate-900">{file.name}</p>
            <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {file && !result && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader />
              Uploading...
            </>
          ) : (
            'Upload & Validate'
          )}
        </button>
      )}

      {result && (
        <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Validation Summary</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">{result.totalRecords}</p>
                <p className="mt-2 text-sm text-slate-500">Total Rows</p>
              </div>
              <div className="rounded-3xl bg-emerald-50 p-4 text-center">
                <p className="text-3xl font-bold text-emerald-700">{result.validCount}</p>
                <p className="mt-2 text-sm text-emerald-600">Valid Rows</p>
              </div>
              <div className="rounded-3xl bg-rose-50 p-4 text-center">
                <p className="text-3xl font-bold text-rose-700">{result.invalidCount}</p>
                <p className="mt-2 text-sm text-rose-600">Invalid Rows</p>
              </div>
            </div>
          </div>

          {result.invalidCount > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-rose-700">Invalid Rows</h4>
              <Table columns={invalidColumns} data={result.invalid || []} />
            </div>
          )}

          {result.validCount > 0 && (
            <button
              type="button"
              onClick={handleProceed}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-700"
            >
              Proceed to Issue
            </button>
          )}
        </div>
      )}
    </div>
  );
}
