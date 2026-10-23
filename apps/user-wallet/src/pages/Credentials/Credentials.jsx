import { Badge, Loader } from '@ethiocred/ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '@ethiocred/utils';

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
      <h2 className="mb-6 text-2xl font-semibold text-gray-900">My Credentials</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {credentials.length === 0 ? (
        <p className="text-sm text-gray-500">No credentials found in your wallet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {credentials.map((cred) => (
            <button
              key={cred.id}
              type="button"
              onClick={() => navigate(`/credentials/${cred.id}`)}
              className="group text-left rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold leading-snug text-gray-900 group-hover:text-blue-700">
                  {cred.degree_name}
                </h3>
                {statusBadge(cred.status)}
              </div>
              <dl className="space-y-2.5 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Institution</dt>
                  <dd className="mt-0.5 font-medium text-gray-700">{cred.institution_name}</dd>
                </div>
                <div className="flex gap-6">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Major</dt>
                    <dd className="mt-0.5 text-gray-600">{cred.major || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Year</dt>
                    <dd className="mt-0.5 text-gray-600">{cred.graduation_year}</dd>
                  </div>
                </div>
              </dl>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
