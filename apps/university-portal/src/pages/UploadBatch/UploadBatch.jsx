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
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload Graduation Batch</h2>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'
        }`}
      >
        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-700 font-medium">Drag and drop your CSV file here</p>
        <p className="text-gray-500 text-sm mt-1">or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {file && (
        <div className="mt-4 flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="text-blue-600" size={24} />
          <div>
            <p className="font-medium text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {file && !result && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
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
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Validation Summary</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-800">{result.totalRecords}</p>
              <p className="text-sm text-gray-500">Total Rows</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-700">{result.validCount}</p>
              <p className="text-sm text-green-600">Valid Rows</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-700">{result.invalidCount}</p>
              <p className="text-sm text-red-600">Invalid Rows</p>
            </div>
          </div>

          {result.invalidCount > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-red-700 mb-2">Invalid Rows</h4>
              <Table columns={invalidColumns} data={result.invalid || []} />
            </div>
          )}

          {result.validCount > 0 && (
            <button
              type="button"
              onClick={handleProceed}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Proceed to Issue
            </button>
          )}
        </div>
      )}
    </div>
  );
}
