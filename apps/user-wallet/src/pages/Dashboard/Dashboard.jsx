import { Badge, Loader } from '@ethiocred/ui';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get, formatDate } from '@ethiocred/utils';
import { useAuth } from '../../context/AuthContext.jsx';

function statusBadge(status) {
  if (status === 'ACTIVE') return <Badge variant="green">ACTIVE</Badge>;
  if (status === 'REVOKED') return <Badge variant="red">REVOKED</Badge>;
  return <Badge variant="gray">{status}</Badge>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [credentials, setCredentials] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      get('/auth/me'),
      get('/credentials/mine'),
      get('/verification/requests/pending'),
    ])
      .then(([meRes, credRes, pendingRes]) => {
        setProfile(meRes.data.data);
        setCredentials(credRes.data.data || []);
        setPendingRequests(pendingRes.data.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const recentCredentials = useMemo(
    () =>
      [...credentials]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3),
    [credentials]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-md">
        <h2 className="text-2xl font-semibold">Welcome, {profile?.full_name || user?.full_name}!</h2>
        <p className="mt-1 text-blue-100">
          Fayda ID: <span className="font-mono font-medium text-white">{profile?.fayda_id || '—'}</span>
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Credentials</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{credentials.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Verification Requests</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">{pendingRequests.length}</p>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Credentials</h3>
          <Link
            to="/credentials"
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus:underline"
          >
            View all
          </Link>
        </div>
        {recentCredentials.length === 0 ? (
          <p className="text-sm text-gray-500">No credentials in your wallet yet.</p>
        ) : (
          <div className="space-y-3">
            {recentCredentials.map((cred) => (
              <button
                key={cred.id}
                type="button"
                onClick={() => navigate(`/credentials/${cred.id}`)}
                className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{cred.degree_name}</p>
                    <p className="text-sm text-gray-500">{cred.institution_name}</p>
                  </div>
                  <div className="text-right">
                    {statusBadge(cred.status)}
                    <p className="mt-1 text-xs text-gray-400">{formatDate(cred.issue_date)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
