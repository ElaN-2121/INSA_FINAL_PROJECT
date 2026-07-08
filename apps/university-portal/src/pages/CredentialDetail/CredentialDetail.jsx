import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post, api, formatDate, formatDateTime } from '@ethiocred/utils';
import { FileDown } from 'lucide-react';
import Badge from '../../components/Badge/Badge.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import Loader from '../../components/Loader/Loader.jsx';

function statusBadge(status) {
  if (status === 'ACTIVE') return <Badge variant="green">ACTIVE</Badge>;
  if (status === 'REVOKED') return <Badge variant="red">REVOKED</Badge>;
  return <Badge variant="gray">{status}</Badge>;
}

export default function CredentialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [reason, setReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fetchCredential = () => {
    setLoading(true);
    get(`/credentials/${id}`)
      .then(({ data }) => setCredential(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load credential'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCredential();
  }, [id]);

  const handleRevoke = async () => {
    if (!reason.trim()) return;
    setRevoking(true);
    try {
      await post(`/credentials/${id}/revoke`, { reason: reason.trim() });
      setShowRevokeModal(false);
      setReason('');
      setSuccessMsg('Credential revoked successfully.');
      fetchCredential();
    } catch (err) {
      setError(err.response?.data?.message || 'Revocation failed');
    } finally {
      setRevoking(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const response = await api.get(`/credentials/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `credential-${credential.serial_number}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (error && !credential) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <button type="button" onClick={() => navigate('/credentials')} className="text-blue-600 hover:underline">
          Back to credentials
        </button>
      </div>
    );
  }

  if (!credential) return null;

  const fields = [
    { label: 'Serial Number', value: credential.serial_number },
    { label: 'Student Name', value: credential.holder_name },
    { label: 'Fayda ID', value: credential.holder_fayda_id || '-' },
    { label: 'Email', value: credential.holder_email || '-' },
    { label: 'Institution', value: credential.institution_name },
    { label: 'Degree', value: credential.degree_name },
    { label: 'Major', value: credential.major || '-' },
    { label: 'Graduation Year', value: credential.graduation_year },
    { label: 'GPA', value: credential.gpa },
    { label: 'Issue Date', value: formatDate(credential.issue_date) },
    { label: 'Created At', value: formatDateTime(credential.created_at) },
  ];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/credentials')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-slate-900"
      >
        ← Back to credentials
      </button>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Credential Detail</h2>
            <p className="mt-1 text-sm text-slate-500">Review credential metadata and signature details.</p>
          </div>
          {statusBadge(credential.status)}
        </div>

        {successMsg && (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label} className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{f.label}</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
        >
          <FileDown size={16} />
          {downloadingPdf ? 'Downloading…' : 'Download PDF'}
        </button>
        <p className="mt-2 text-xs text-slate-500">
          This PDF is a visual representation only. Cryptographic verification always takes precedence.
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 shadow-sm">
        <div className="space-y-6 text-slate-100">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Credential Hash (SHA-256)</p>
            <pre className="overflow-x-auto rounded-3xl bg-slate-900 p-4 text-xs font-mono text-emerald-300">{credential.credential_hash}</pre>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Digital Signature</p>
            <pre className="overflow-x-auto rounded-3xl bg-slate-900 p-4 text-xs font-mono text-slate-300">
              {credential.digital_signature?.slice(0, 50)}...
            </pre>
          </div>
        </div>
      </div>

      {credential.status === 'ACTIVE' && (
        <button
          type="button"
          onClick={() => setShowRevokeModal(true)}
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Revoke This Credential
        </button>
      )}

      <Modal
        isOpen={showRevokeModal}
        onClose={() => {
          setShowRevokeModal(false);
          setReason('');
        }}
        title="Revoke Credential"
        onConfirm={handleRevoke}
        confirmLabel={revoking ? 'Revoking...' : 'Confirm Revocation'}
        confirmVariant="danger"
        confirmDisabled={!reason.trim() || revoking}
      >
        <p className="mb-3 text-sm text-slate-700">Please provide a reason for revoking this credential.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          placeholder="Revocation reason (required)"
          required
        />
      </Modal>
    </div>
  );
}
