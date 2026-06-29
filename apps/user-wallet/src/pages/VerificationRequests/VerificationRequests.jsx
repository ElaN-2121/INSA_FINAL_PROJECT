import { useEffect, useMemo, useState } from 'react';
import { get, post, formatDate, formatDateTime } from '@ethiocred/utils';
import Badge from '../../components/Badge/Badge.jsx';
import Loader from '../../components/Loader/Loader.jsx';

function requestStatusBadge(status) {
  const map = {
    PENDING: 'yellow',
    APPROVED: 'blue',
    DENIED: 'red',
    COMPLETED: 'green',
  };
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>;
}

export default function VerificationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [actionId, setActionId] = useState(null);

  const fetchRequests = () => {
    setLoading(true);
    get('/verification/requests/mine')
      .then(({ data }) => setRequests(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load requests'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const pending = useMemo(() => requests.filter((r) => r.status === 'PENDING'), [requests]);
  const history = useMemo(() => requests.filter((r) => r.status !== 'PENDING'), [requests]);

  const handleApprove = async (requestId) => {
    setActionId(requestId);
    try {
      await post(`/verification/requests/${requestId}/approve`);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionId(null);
    }
  };

  const handleDeny = async (requestId) => {
    setActionId(requestId);
    try {
      await post(`/verification/requests/${requestId}/deny`);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deny request');
    } finally {
      setActionId(null);
    }
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
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Verification Requests</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="flex border-b border-gray-200 mb-6">
        {['pending', 'history'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab} {tab === 'pending' && pending.length > 0 && `(${pending.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending verification requests.</p>
          ) : (
            pending.map((req) => (
              <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">{req.employer_name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {req.degree_name} — {req.serial_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Requested: {formatDateTime(req.requested_at)}
                      {req.expires_at && ` · Expires: ${formatDate(req.expires_at)}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(req.id)}
                      disabled={actionId === req.id}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeny(req.id)}
                      disabled={actionId === req.id}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">No request history yet.</p>
          ) : (
            history.map((req) => (
              <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{req.employer_name}</p>
                  <p className="text-sm text-gray-500">{req.degree_name}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(req.requested_at)}</p>
                </div>
                {requestStatusBadge(req.status)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
