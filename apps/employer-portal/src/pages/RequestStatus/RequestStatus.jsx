import { Badge, Loader } from '@ethiocred/ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, formatDateTime } from '@ethiocred/utils';

function statusBadge(status) {
  const map = {
    PENDING: 'yellow',
    APPROVED: 'blue',
    DENIED: 'red',
    COMPLETED: 'green',
  };
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>;
}

export default function RequestStatus() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    get('/verification/history')
      .then(({ data }) => setRequests(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load requests'))
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
      <h2 className="mb-2 text-2xl font-semibold text-gray-900">Request Status</h2>
      <p className="mb-6 text-sm text-gray-500">Track the status of your verification requests.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">No verification requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-gray-900">{req.degree_name}</p>
                  <p className="text-sm text-gray-600">Serial: {req.serial_number}</p>
                  <p className="text-xs text-gray-400">
                    Requested: {formatDateTime(req.requested_at)}
                    {req.responded_at && ` · Responded: ${formatDateTime(req.responded_at)}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {statusBadge(req.status)}
                  {req.status === 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/verify', {
                          state: { credentialId: req.credential_id, serial: req.serial_number },
                        })
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Verify Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
