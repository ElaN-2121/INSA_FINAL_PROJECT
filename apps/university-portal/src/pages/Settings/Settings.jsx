import { useState, useEffect } from 'react';
import { Copy, Check, Building2, KeyRound, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { get, formatDateTime } from '@ethiocred/utils';
import { Badge, Loader, Button, PageHeader } from '@ethiocred/ui';
import { useAuth } from '../../context/AuthContext.jsx';

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
      setError('No institution linked to your registrar account.');
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Institution Settings & Cryptography"
        description="Accreditation status, registrar profile, and public keys registered with the Federal Trust Registry."
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Institution Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Building2 className="h-5 w-5 text-navy-800" />
            <h3 className="font-display font-semibold text-slate-900 text-base">
              Accredited Institution Profile
            </h3>
          </div>

          {institution ? (
            <dl className="space-y-3.5 text-sm">
              <div>
                <dt className="text-xs uppercase font-bold tracking-wider text-slate-500">Institution Name</dt>
                <dd className="mt-0.5 text-base font-semibold text-slate-900">{institution.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase font-bold tracking-wider text-slate-500">MoE Registration Number</dt>
                <dd className="mt-0.5 font-mono text-slate-800">{institution.registration_number || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase font-bold tracking-wider text-slate-500">Trust Registry Status</dt>
                <dd className="mt-1">{statusBadge(institution.status)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase font-bold tracking-wider text-slate-500">Accredited Since</dt>
                <dd className="mt-0.5 text-slate-700">
                  {institution.approved_at ? formatDateTime(institution.approved_at) : 'Under Review'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-500">Institution metadata not found.</p>
          )}
        </div>

        {/* Registrar Profile */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <User className="h-5 w-5 text-navy-800" />
            <h3 className="font-display font-semibold text-slate-900 text-base">
              Authorized Registrar Officer
            </h3>
          </div>

          <dl className="space-y-3.5 text-sm">
            <div>
              <dt className="text-xs uppercase font-bold tracking-wider text-slate-500">Officer Name</dt>
              <dd className="mt-0.5 text-base font-semibold text-slate-900">{user?.full_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase font-bold tracking-wider text-slate-500">Official Email</dt>
              <dd className="mt-0.5 text-slate-800">{user?.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase font-bold tracking-wider text-slate-500">System Permission</dt>
              <dd className="mt-1">
                <Badge variant="blue">UNIVERSITY REGISTRAR</Badge>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Trust Registry RSA Public Key */}
      <div className="rounded-2xl border border-slate-800 bg-navy-950 p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-navy-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-400" />
              <h3 className="font-display font-semibold text-white text-base">
                Institution Public Key (RSA-2048)
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Published in the National Trust Registry. Used by employers and verifiers to mathematically confirm digital signatures.
            </p>
          </div>

          {publicKey && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-slate-700 text-slate-200 hover:bg-white/10 shrink-0"
            >
              {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-400" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? 'Copied Key' : 'Copy Public Key'}
            </Button>
          )}
        </div>

        {publicKey ? (
          <pre className="p-4 rounded-xl bg-navy-900 font-mono text-xs text-emerald-300 break-all border border-navy-800 overflow-x-auto max-h-64">
            {publicKey}
          </pre>
        ) : (
          <p className="text-sm text-slate-400">No public key registered for this institution.</p>
        )}
      </div>
    </div>
  );
}
