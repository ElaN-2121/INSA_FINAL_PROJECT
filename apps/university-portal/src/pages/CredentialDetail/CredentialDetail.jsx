import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post, formatDate, formatDateTime } from '@ethiocred/utils';
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
    <div>
      <button
        type="button"
        onClick={() => navigate('/credentials')}
        className="text-sm text-blue-600 hover:underline mb-4"
      >
        ← Back to credentials
      </button>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Credential Detail</h2>
        {statusBadge(credential.status)}
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label}>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{f.label}</p>
              <p className="text-gray-800 font-medium mt-0.5">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Credential Hash (SHA-256)</p>
          <code className="text-xs text-gray-700 break-all font-mono">{credential.credential_hash}</code>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Digital Signature</p>
          <code className="text-xs text-gray-700 break-all font-mono">
            {credential.digital_signature?.slice(0, 50)}...
          </code>
        </div>
      </div>

      {credential.status === 'ACTIVE' && (
        <button
          type="button"
          onClick={() => setShowRevokeModal(true)}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          Revoke This Credential
        </button>
      )}

      <Modal
        isOpen={showRevokeModal}
        onClose={() => { setShowRevokeModal(false); setReason(''); }}
        title="Revoke Credential"
        onConfirm={handleRevoke}
        confirmLabel={revoking ? 'Revoking...' : 'Confirm Revocation'}
        confirmVariant="danger"
        confirmDisabled={!reason.trim() || revoking}
      >
        <p className="mb-3">Please provide a reason for revoking this credential.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Revocation reason (required)"
          required
        />
      </Modal>
    </div>
  );
}
