import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get, formatDate } from '@ethiocred/utils';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Loader from '../../components/Loader/Loader.jsx';

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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-8 shadow-md">
        <h2 className="text-2xl font-semibold">Welcome, {profile?.full_name || user?.full_name}!</h2>
        <p className="text-blue-100 mt-1">
          Fayda ID: <span className="font-mono font-medium text-white">{profile?.fayda_id || '—'}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Credentials</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{credentials.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Verification Requests</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingRequests.length}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Credentials</h3>
          <Link to="/credentials" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        {recentCredentials.length === 0 ? (
          <p className="text-gray-500 text-sm">No credentials in your wallet yet.</p>
        ) : (
          <div className="space-y-3">
            {recentCredentials.map((cred) => (
              <button
                key={cred.id}
                type="button"
                onClick={() => navigate(`/credentials/${cred.id}`)}
                className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{cred.degree_name}</p>
                    <p className="text-sm text-gray-500">{cred.institution_name}</p>
                  </div>
                  <div className="text-right">
                    {statusBadge(cred.status)}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(cred.issue_date)}</p>
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
