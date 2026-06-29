import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, formatDateTime } from '@ethiocred/utils';
import Badge from '../../components/Badge/Badge.jsx';
import Loader from '../../components/Loader/Loader.jsx';

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
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Request Status</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-gray-500">No verification requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{req.degree_name}</p>
                  <p className="text-sm text-gray-500">Serial: {req.serial_number}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Requested: {formatDateTime(req.requested_at)}
                    {req.responded_at && ` · Responded: ${formatDateTime(req.responded_at)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(req.status)}
                  {req.status === 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/verify', {
                          state: { credentialId: req.credential_id, serial: req.serial_number },
                        })
                      }
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium"
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
