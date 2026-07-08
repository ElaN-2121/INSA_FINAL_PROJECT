import { useCallback, useEffect, useState } from 'react';
import { Building2, ChevronDown, ChevronRight, Copy, Key, Plus, UserPlus } from 'lucide-react';
import { get, post, patch } from '../../services/api.js';
import Badge from '../../components/Badge/Badge.jsx';
import Table from '../../components/Table/Table.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import ApiKeysModal from '../../components/ApiKeysModal/ApiKeysModal.jsx';
import { formatDate } from '../../utils/formatDate.js';

function statusBadge(status) {
  const map = {
    PENDING: 'yellow',
    UNDER_REVIEW: 'blue',
    ACTIVE: 'green',
    SUSPENDED: 'red',
    REVOKED: 'red',
  };
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>;
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

const btnPrimary =
  'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

const btnSecondary =
  'rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500';

const btnDestructive =
  'rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

const btnPrimarySm =
  'inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';

function OverlayModal({ title, onClose, children, hideClose = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={hideClose ? undefined : onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    organization_fayda_id: '',
    registration_number: '',
  });
  const [registerResult, setRegisterResult] = useState(null);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  const [registrarOpen, setRegistrarOpen] = useState(false);
  const [registrarInstitution, setRegistrarInstitution] = useState(null);
  const [registrarForm, setRegistrarForm] = useState({ full_name: '', email: '' });
  const [registrarResult, setRegistrarResult] = useState(null);
  const [registrarSubmitting, setRegistrarSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKeysOpen, setApiKeysOpen] = useState(false);
  const [apiKeysInstitution, setApiKeysInstitution] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const loadInstitutions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await get('/admin/institutions');
      setInstitutions(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load institutions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstitutions();
  }, [loadInstitutions]);

  const handleApprove = async (id) => {
    setActionError('');
    try {
      await patch(`/admin/institutions/${id}/approve`);
      await loadInstitutions();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve institution');
    }
  };

  const handleSuspend = async (institution) => {
    if (!window.confirm(`Suspend "${institution.name}"? Registrars will lose issuance access.`)) {
      return;
    }
    setActionError('');
    try {
      await patch(`/admin/institutions/${institution.id}/suspend`);
      await loadInstitutions();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to suspend institution');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterSubmitting(true);
    setActionError('');
    try {
      const { data } = await post('/admin/institutions', registerForm);
      setRegisterResult(data.data);
      await loadInstitutions();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to register institution');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const handleCreateRegistrar = async (e) => {
    e.preventDefault();
    setRegistrarSubmitting(true);
    setActionError('');
    try {
      const { data } = await post(`/institutions/${registrarInstitution.id}/registrars`, registrarForm);
      setRegistrarResult(data.data);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create registrar');
    } finally {
      setRegistrarSubmitting(false);
    }
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeRegisterModal = () => {
    setRegisterOpen(false);
    setRegisterForm({ name: '', organization_fayda_id: '', registration_number: '' });
    setRegisterResult(null);
  };

  const closeRegistrarModal = () => {
    setRegistrarOpen(false);
    setRegistrarInstitution(null);
    setRegistrarForm({ full_name: '', email: '' });
    setRegistrarResult(null);
    setCopied(false);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'registration_number', label: 'Registration Number' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => statusBadge(row.status),
    },
    {
      key: 'registrar_count',
      label: 'Registrar Count',
      render: (row) => row.registrar_count ?? 0,
    },
    {
      key: 'created_at',
      label: 'Created Date',
      render: (row) => formatDate(row.created_at),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
          {['PENDING', 'UNDER_REVIEW'].includes(row.status) && (
            <button
              type="button"
              onClick={() => handleApprove(row.id)}
              className={btnPrimarySm}
            >
              Approve
            </button>
          )}
          {row.status === 'ACTIVE' && (
            <>
              <button
                type="button"
                onClick={() => handleSuspend(row)}
                className={btnDestructive}
              >
                Suspend
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegistrarInstitution(row);
                  setRegistrarOpen(true);
                  setRegistrarResult(null);
                  setRegistrarForm({ full_name: '', email: '' });
                }}
                className={btnPrimarySm}
              >
                <UserPlus size={12} />
                Add Registrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setApiKeysInstitution(row);
                  setApiKeysOpen(true);
                }}
                className={btnPrimarySm}
              >
                <Key size={12} />
                API Keys
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Building2 size={24} className="text-blue-700" />
            Institutions
          </h2>
          <p className="mt-1 text-sm text-gray-500">Manage trust registry and registrar accounts.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRegisterOpen(true);
            setRegisterResult(null);
            setRegisterForm({ name: '', organization_fayda_id: '', registration_number: '' });
          }}
          className={`inline-flex items-center gap-2 ${btnPrimary} px-4 py-2.5`}
        >
          <Plus size={16} />
          Register New Institution
        </button>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      )}
      {actionError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{actionError}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setGuideOpen((open) => !open)}
          className="flex w-full items-center gap-2 px-5 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50"
        >
          {guideOpen ? <ChevronDown size={18} className="text-blue-600" /> : <ChevronRight size={18} className="text-blue-600" />}
          API Integration Guide
        </button>
        {guideOpen && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-2">
            <p className="mb-4 text-sm text-gray-600">
              Institutions can integrate EthioCred directly into their Student Information Systems using an API key.
              Include the key in the <code className="rounded bg-gray-100 px-1">X-API-Key</code> header when calling the
              credential issuance endpoint — no portal login required.
            </p>
            <pre className="overflow-x-auto rounded-xl bg-gray-900 p-4 text-xs text-emerald-300">
{`POST /api/credentials/api/issue
X-API-Key: ethiocred_your_key_here
Content-Type: application/json

{
  "students": [{
    "full_name": "...",
    "fayda_id": "...",
    "email": "...",
    "degree_name": "...",
    "major": "...",
    "graduation_year": 2024,
    "gpa": 3.85
  }]
}`}
            </pre>
          </div>
        )}
      </div>

      <Table columns={columns} data={institutions} emptyMessage="No institutions registered yet." />

      {registerOpen && (
        <OverlayModal
          title={registerResult ? 'Institution Registered' : 'Register New Institution'}
          onClose={registerResult ? closeRegisterModal : closeRegisterModal}
        >
          {!registerResult ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Institution Name</label>
                <input
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Organization Fayda ID</label>
                <input
                  value={registerForm.organization_fayda_id}
                  onChange={(e) => setRegisterForm({ ...registerForm, organization_fayda_id: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Registration Number</label>
                <input
                  value={registerForm.registration_number}
                  onChange={(e) => setRegisterForm({ ...registerForm, registration_number: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeRegisterModal} className={btnSecondary}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerSubmitting}
                  className={btnPrimary}
                >
                  {registerSubmitting ? 'Registering…' : 'Register'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                RSA key pair generated successfully. The institution is now PENDING — approve it below to allow
                registrar creation.
              </p>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Public Key
                </label>
                <div className="relative mt-2">
                  <pre className="max-h-40 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-emerald-300">
                    {registerResult.public_key}
                  </pre>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(registerResult.public_key)}
                    className="absolute right-2 top-2 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={closeRegisterModal}
                className={`w-full ${btnPrimary}`}
              >
                Done
              </button>
            </div>
          )}
        </OverlayModal>
      )}

      {apiKeysOpen && apiKeysInstitution && (
        <ApiKeysModal
          institution={apiKeysInstitution}
          onClose={() => {
            setApiKeysOpen(false);
            setApiKeysInstitution(null);
          }}
        />
      )}

      {registrarOpen && (
        <OverlayModal
          title={registrarResult ? 'Registrar Created' : `Add Registrar — ${registrarInstitution?.name}`}
          onClose={registrarResult ? undefined : closeRegistrarModal}
          hideClose={Boolean(registrarResult)}
        >
          {!registrarResult ? (
            <form onSubmit={handleCreateRegistrar} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  required
                  value={registrarForm.full_name}
                  onChange={(e) => setRegistrarForm({ ...registrarForm, full_name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  required
                  type="email"
                  value={registrarForm.email}
                  onChange={(e) => setRegistrarForm({ ...registrarForm, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeRegistrarModal} className={btnSecondary}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registrarSubmitting}
                  className={btnPrimary}
                >
                  {registrarSubmitting ? 'Creating…' : 'Create Registrar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <strong>Warning:</strong> This password will not be shown again. Copy it now and share it securely
                with the registrar.
              </div>
              <p className="text-sm text-slate-600">
                Registrar <strong>{registrarResult.user?.full_name}</strong> ({registrarResult.user?.email}) created.
              </p>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Temporary Password
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 rounded-xl bg-slate-100 px-4 py-4 text-center text-2xl font-mono font-bold tracking-wider text-slate-900">
                    {registrarResult.temporaryPassword}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(registrarResult.temporaryPassword)}
                    className="rounded-xl border border-slate-300 bg-white p-3 hover:bg-slate-50"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                {copied && <p className="mt-1 text-xs text-emerald-600">Copied to clipboard!</p>}
              </div>
              <button
                type="button"
                onClick={closeRegistrarModal}
                className={`w-full ${btnPrimary}`}
              >
                Done, I&apos;ve saved the password
              </button>
            </div>
          )}
        </OverlayModal>
      )}
    </div>
  );
}
