import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { get, formatDateTime } from '@ethiocred/utils';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Loader from '../../components/Loader/Loader.jsx';

function statusBadge(status) {
  if (status === 'ACTIVE') return <Badge variant="green">ACTIVE</Badge>;
  if (status === 'PENDING') return <Badge variant="yellow">PENDING</Badge>;
  if (status === 'SUSPENDED') return <Badge variant="red">SUSPENDED</Badge>;
  return <Badge variant="gray">{status}</Badge>;
}

export default function Settings() {
  const { user } = useAuth();
  const [institution, setInstitution] = useState(null);
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.institution_id) {
      setLoading(false);
      setError('No institution linked to your account.');
      return;
    }

    Promise.all([
      get(`/institutions/${user.institution_id}`),
      get('/institutions/trust-registry'),
    ])
      .then(([instRes, registryRes]) => {
        setInstitution(instRes.data.data);
        const registry = registryRes.data.data || [];
        const entry = registry.find((i) => i.id === user.institution_id);
        setPublicKey(entry?.public_key || '');
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, [user?.institution_id]);

  const handleCopy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
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

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Manage your institution profile and registry credentials.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Institution</h3>
          {institution ? (
            <dl className="space-y-4">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Name</dt>
                <dd className="mt-1 text-base font-medium text-slate-900">{institution.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Registration Number</dt>
                <dd className="mt-1 text-base font-medium text-slate-900">{institution.registration_number || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</dt>
                <dd className="mt-2">{statusBadge(institution.status)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Approved At</dt>
                <dd className="mt-1 text-base font-medium text-slate-900">
                  {institution.approved_at ? formatDateTime(institution.approved_at) : '-'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-slate-500">Institution data unavailable.</p>
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Registrar Profile</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Full Name</dt>
              <dd className="mt-1 text-base font-medium text-slate-900">{user?.full_name || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</dt>
              <dd className="mt-1 text-base font-medium text-slate-900">{user?.email || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</dt>
              <dd className="mt-2"><Badge variant="blue">{user?.role}</Badge></dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Public Key (Trust Registry)</h3>
            <p className="mt-1 text-sm text-slate-500">Use this public key to verify your institution's issued credentials.</p>
          </div>
          {publicKey && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
        {publicKey ? (
          <pre className="mt-5 max-h-64 overflow-x-auto rounded-3xl bg-slate-950 px-4 py-4 text-xs text-green-300 font-mono shadow-inner">
            {publicKey}
          </pre>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Public key not found in trust registry.</p>
        )}
      </div>
    </div>
  );
}
