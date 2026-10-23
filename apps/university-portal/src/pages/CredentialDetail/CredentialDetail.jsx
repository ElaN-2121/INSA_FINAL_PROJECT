import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Award,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Hash,
  KeyRound,
  Calendar,
  Building2,
  User,
  GraduationCap,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { get, post, formatDate, formatDateTime } from '@ethiocred/utils';
import { Badge, Loader, Modal, Button, PageHeader } from '@ethiocred/ui';

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
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedSig, setCopiedSig] = useState(false);

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
      setSuccessMsg('Credential has been officially revoked in the National Trust Registry.');
      fetchCredential();
    } catch (err) {
      setError(err.response?.data?.message || 'Revocation failed');
    } finally {
      setRevoking(false);
    }
  };

  const copyToClipboard = async (text, setCopied) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="text-center py-20 space-y-4">
        <p className="text-rose-600 font-semibold">{error}</p>
        <Button variant="outline" onClick={() => navigate('/credentials')}>
          ← Back to credentials
        </Button>
      </div>
    );
  }

  if (!credential) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/credentials')}
        className="text-slate-600 hover:text-slate-900 -ml-2"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Issued Credentials
      </Button>

      <PageHeader
        title={`Credential Dossier: ${credential.holder_name}`}
        description={`Serial Number: ${credential.serial_number} · Committed to Trust Registry`}
        actions={
          <div className="flex items-center gap-3">
            {statusBadge(credential.status)}
            {credential.status === 'ACTIVE' && (
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowRevokeModal(true)}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
              >
                Revoke Credential
              </Button>
            )}
          </div>
        }
      />

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Primary Details Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-navy-800" />
          Academic Record Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Candidate Name</span>
            <p className="mt-1 font-semibold text-slate-900 text-base">{credential.holder_name}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Fayda National ID</span>
            <p className="mt-1 font-mono font-medium text-slate-900 text-base">{credential.holder_fayda_id || '—'}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Student Email</span>
            <p className="mt-1 text-slate-800 text-sm">{credential.holder_email || '—'}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Degree Conferred</span>
            <p className="mt-1 font-semibold text-slate-900 text-base">{credential.degree_name}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Field / Major</span>
            <p className="mt-1 text-slate-800 font-medium text-base">{credential.major || 'Undergraduate'}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Cumulative GPA</span>
            <p className="mt-1 font-bold text-navy-900 text-base">{credential.gpa || '—'}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Issuing University</span>
            <p className="mt-1 font-medium text-slate-900">{credential.institution_name}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Graduation Year</span>
            <p className="mt-1 font-medium text-slate-900">{credential.graduation_year}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Date of Connotation</span>
            <p className="mt-1 text-slate-800">{formatDate(credential.issue_date)}</p>
          </div>
        </div>
      </div>

      {/* Cryptographic Proof Card */}
      <div className="rounded-2xl border border-slate-800 bg-navy-950 p-7 text-white shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-navy-800 pb-4">
          <div className="flex items-center gap-2.5">
            <KeyRound className="h-5 w-5 text-emerald-400" />
            <h3 className="font-display font-semibold text-white text-base">
              Cryptographic Integrity Proofs
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/60">
            RSA-2048 / SHA-256
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5 font-semibold">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-slate-400" />
                CANONICAL PAYLOAD HASH (SHA-256)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(credential.credential_hash, setCopiedHash)}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                {copiedHash ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedHash ? 'Copied' : 'Copy hash'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-navy-900/90 font-mono text-emerald-300 break-all border border-navy-800 overflow-x-auto">
              {credential.credential_hash}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5 font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                INSTITUTION DIGITAL SIGNATURE (BASE64)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(credential.digital_signature, setCopiedSig)}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                {copiedSig ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSig ? 'Copied' : 'Copy signature'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-navy-900/90 font-mono text-slate-300 break-all border border-navy-800 max-h-28 overflow-y-auto">
              {credential.digital_signature}
            </pre>
          </div>
        </div>
      </div>

      {/* Revoke Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => {
          setShowRevokeModal(false);
          setReason('');
        }}
        title="Revoke Credential"
        onConfirm={handleRevoke}
        confirmLabel={revoking ? 'Revoking...' : 'Confirm Revocation'}
        cancelLabel="Cancel"
        variant="danger"
        confirmDisabled={!reason.trim() || revoking}
      >
        <div className="space-y-4">
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg leading-relaxed">
            Revoking this credential will permanently publish a revocation record to the National Trust Registry. Any future employer verifications will fail immediately.
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
              Reason for Revocation *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
              placeholder="e.g. Administrative error, degree upgrade, disciplinary board decision..."
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
