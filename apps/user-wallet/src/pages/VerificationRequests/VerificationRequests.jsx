import { Badge, Loader } from '@ethiocred/ui';
import { useEffect, useMemo, useState } from 'react';
import { get, post, formatDate, formatDateTime } from '@ethiocred/utils';

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
      <h2 className="mb-6 text-2xl font-semibold text-gray-900">Verification Requests</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 flex border-b border-gray-200">
        {['pending', 'history'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            <p className="text-sm text-gray-500">No pending verification requests.</p>
          ) : (
            pending.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-gray-900">{req.employer_name}</p>
                    <p className="text-sm text-gray-600">
                      {req.degree_name} — {req.serial_number}
                    </p>
                    <p className="text-xs text-gray-400">
                      Requested: {formatDateTime(req.requested_at)}
                      {req.expires_at && ` · Expires: ${formatDate(req.expires_at)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(req.id)}
                      disabled={actionId === req.id}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeny(req.id)}
                      disabled={actionId === req.id}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
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
            <p className="text-sm text-gray-500">No request history yet.</p>
          ) : (
            history.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{req.employer_name}</p>
                  <p className="text-sm text-gray-600">{req.degree_name}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(req.requested_at)}</p>
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
