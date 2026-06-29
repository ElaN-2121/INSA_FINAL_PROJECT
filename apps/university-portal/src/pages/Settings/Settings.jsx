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
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Institution</h3>
          {institution ? (
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 uppercase">Name</dt>
                <dd className="font-medium text-gray-800">{institution.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Registration Number</dt>
                <dd className="font-medium text-gray-800">{institution.registration_number || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Status</dt>
                <dd className="mt-1">{statusBadge(institution.status)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Approved At</dt>
                <dd className="font-medium text-gray-800">
                  {institution.approved_at ? formatDateTime(institution.approved_at) : '-'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-gray-500">Institution data unavailable.</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Registrar Profile</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500 uppercase">Full Name</dt>
              <dd className="font-medium text-gray-800">{user?.full_name || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase">Email</dt>
              <dd className="font-medium text-gray-800">{user?.email || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase">Role</dt>
              <dd className="mt-1"><Badge variant="blue">{user?.role}</Badge></dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Public Key (Trust Registry)</h3>
          {publicKey && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
        {publicKey ? (
          <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto font-mono max-h-64">
            {publicKey}
          </pre>
        ) : (
          <p className="text-gray-500 text-sm">Public key not found in trust registry.</p>
        )}
      </div>
    </div>
  );
}
