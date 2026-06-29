import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '@ethiocred/utils';
import Badge from '../../components/Badge/Badge.jsx';
import Loader from '../../components/Loader/Loader.jsx';

function statusBadge(status) {
  if (status === 'ACTIVE') return <Badge variant="green">ACTIVE</Badge>;
  if (status === 'REVOKED') return <Badge variant="red">REVOKED</Badge>;
  return <Badge variant="gray">{status}</Badge>;
}

export default function Credentials() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    get('/credentials/mine')
      .then(({ data }) => setCredentials(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load credentials'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Credentials</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {credentials.length === 0 ? (
        <p className="text-gray-500">No credentials found in your wallet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {credentials.map((cred) => (
            <button
              key={cred.id}
              type="button"
              onClick={() => navigate(`/credentials/${cred.id}`)}
              className="text-left bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{cred.degree_name}</h3>
                {statusBadge(cred.status)}
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Institution</dt>
                  <dd className="text-gray-800 font-medium">{cred.institution_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Major</dt>
                  <dd className="text-gray-800">{cred.major || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Graduation Year</dt>
                  <dd className="text-gray-800">{cred.graduation_year}</dd>
                </div>
              </dl>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
