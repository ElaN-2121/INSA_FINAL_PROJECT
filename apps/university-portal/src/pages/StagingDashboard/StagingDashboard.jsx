import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  KeyRound,
  Filter,
} from 'lucide-react';
import { get, post } from '@ethiocred/utils';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button, Badge, Card, Loader, Table, Modal, Stepper, Alert } from '@ethiocred/ui';

export default function StagingDashboard() {
  const { batchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stagedData, setStagedData] = useState(location.state || null);
  const [institutionName, setInstitutionName] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'valid', 'invalid'
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.institution_id) {
      get(`/institutions/${user.institution_id}`)
        .then(({ data }) => setInstitutionName(data.data?.name || 'Your Institution'))
        .catch(() => setInstitutionName('Your Institution'));
    }
  }, [user?.institution_id]);

  useEffect(() => {
    if (!stagedData && batchId) {
      setError('Staged batch session expired. Please upload the CSV roster again.');
    }
  }, [stagedData, batchId]);

  const validRows = stagedData?.valid || [];
  const invalidRows = stagedData?.invalid || [];

  const handleIssue = async () => {
    setShowConfirmModal(false);
    setIssuing(true);
    setError('');
    try {
      const { data } = await post(`/credentials/issue/${batchId}`);
      setSuccess(data.data);
      setTimeout(() => navigate('/credentials'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue and digitally sign credentials');
      setIssuing(false);
    }
  };

  const validColumns = [
    { key: 'full_name', label: 'Graduate Name', render: (row) => <span className="font-bold text-slate-900">{row.full_name}</span> },
    { key: 'fayda_id', label: 'Fayda ID', render: (row) => <span className="font-mono text-slate-600">{row.fayda_id}</span> },
    { key: 'degree_name', label: 'Degree Program' },
    { key: 'major', label: 'Major', render: (row) => row.major || '—' },
    { key: 'graduation_year', label: 'Year', align: 'center' },
    {
      key: 'gpa',
      label: 'GPA',
      align: 'right',
      render: (row) => <span className="font-extrabold text-navy-950 font-mono tabular-nums">{row.gpa}</span>,
    },
  ];

  const invalidColumns = [
    { key: 'row', label: 'CSV Row', render: (item) => <span className="font-mono font-bold">#{item.row?._rowIndex || '-'}</span> },
    { key: 'name', label: 'Name on Record', render: (item) => item.row?.full_name || '—' },
    {
      key: 'errors',
      label: 'Validation Errors',
      render: (item) => (
        <div className="flex flex-wrap gap-1.5">
          {item.errors?.map((e, i) => (
            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
              {e}
            </span>
          ))}
        </div>
      ),
    },
  ];

  const stepperSteps = [
    { title: '1. Upload CSV', description: 'Batch ingested', status: 'complete' },
    { title: '2. Review & Stage', description: 'Pre-flight check', status: success ? 'complete' : 'current' },
    { title: '3. Issue & Sign', description: 'RSA-2048 sealing', status: success ? 'complete' : 'upcoming' },
  ];

  if (!stagedData && error) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center border border-amber-200">
          <FileSpreadsheet size={24} />
        </div>
        <h3 className="text-lg font-bold text-navy-950 font-display">Staged Batch Not Found</h3>
        <p className="text-sm text-slate-500">{error}</p>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => navigate('/upload')}
        >
          Return to Upload
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-20 max-w-lg mx-auto space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white mx-auto shadow-card ring-8 ring-emerald-50">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display tracking-tight">
            Batch Cryptographically Sealed!
          </h2>
          <p className="text-sm text-slate-600">
            {success.issuedCount || validRows.length} credentials successfully signed with RSA-2048 and dispatched to student wallets.
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs font-mono text-slate-500 max-w-xs mx-auto">
          Redirecting to Issued Credentials...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Workflow Stepper */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <Stepper steps={stepperSteps} orientation="horizontal" />
      </div>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Batch Staging Area
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-950 font-display mt-1">
            Review Staged Records
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Batch ID: <span className="font-mono text-slate-700">{batchId}</span> · Issuing Authority: <strong className="text-slate-800">{institutionName}</strong>
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          leftIcon={KeyRound}
          disabled={validRows.length === 0 || issuing}
          isLoading={issuing}
          loadingText="Cryptographically Signing..."
          onClick={() => setShowConfirmModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white self-start sm:self-auto"
        >
          Sign & Issue Batch ({validRows.length})
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase text-slate-400">Total Ingested Rows</p>
          <p className="text-2xl font-extrabold text-navy-950 font-display tabular-nums mt-1">
            {validRows.length + invalidRows.length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase text-emerald-800">Valid & Verified Records</p>
          <p className="text-2xl font-extrabold text-emerald-700 font-display tabular-nums mt-1">
            {validRows.length}
          </p>
        </div>
        <div className={`rounded-2xl border p-5 shadow-soft ${invalidRows.length > 0 ? 'border-red-200 bg-red-50/50' : 'border-slate-200/80 bg-white'}`}>
          <p className={`text-xs font-semibold uppercase ${invalidRows.length > 0 ? 'text-red-800' : 'text-slate-400'}`}>
            Invalid / Incomplete Rows
          </p>
          <p className={`text-2xl font-extrabold font-display tabular-nums mt-1 ${invalidRows.length > 0 ? 'text-red-700' : 'text-slate-900'}`}>
            {invalidRows.length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 max-w-sm">
        <button
          type="button"
          onClick={() => setFilterMode('all')}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all focus-ring ${
            filterMode === 'all'
              ? 'bg-white text-navy-950 shadow-soft'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({validRows.length + invalidRows.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('valid')}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all focus-ring ${
            filterMode === 'valid'
              ? 'bg-white text-emerald-800 shadow-soft'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Valid ({validRows.length})
        </button>
        {invalidRows.length > 0 && (
          <button
            type="button"
            onClick={() => setFilterMode('invalid')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all focus-ring ${
              filterMode === 'invalid'
                ? 'bg-white text-red-700 shadow-soft'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Errors ({invalidRows.length})
          </button>
        )}
      </div>

      {/* Records Table View */}
      {(filterMode === 'all' || filterMode === 'valid') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Valid Candidates Ready for Issuance ({validRows.length})
            </h3>
            <span className="text-xs text-slate-400">Pre-flight schema passed ✓</span>
          </div>
          <Table
            columns={validColumns}
            data={validRows}
            emptyMessage="No valid rows in this batch."
            stickyHeader
          />
        </div>
      )}

      {(filterMode === 'all' || filterMode === 'invalid') && invalidRows.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
              Invalid Records Requiring Correction ({invalidRows.length})
            </h3>
            <span className="text-xs text-red-600 font-medium">Excluded from signing</span>
          </div>
          <Table
            columns={invalidColumns}
            data={invalidRows}
            emptyMessage="Zero errors found."
          />
        </div>
      )}

      {/* Confirm Before Issue Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Cryptographic Credential Issuance"
        description="Please confirm issuance details before signing."
        confirmLabel="Confirm & Sign RSA-2048 Credentials"
        confirmVariant="success"
        onConfirm={handleIssue}
        confirmLoading={issuing}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle size={16} className="text-amber-700 shrink-0" />
              <span>Irreversible Cryptographic Action</span>
            </div>
            <p className="leading-relaxed">
              Once issued, each credential will be stamped with <strong>{institutionName}</strong>'s private RSA key and recorded in the national ledger.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Issuing Institution:</span>
              <strong className="text-slate-900">{institutionName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Credentials to be Signed:</span>
              <strong className="text-emerald-700">{validRows.length} valid students</strong>
            </div>
            {invalidRows.length > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Skipped Error Rows:</span>
                <strong>{invalidRows.length} rows</strong>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Signature Standard:</span>
              <span className="font-mono text-slate-700">RSA-2048 / SHA-256</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
