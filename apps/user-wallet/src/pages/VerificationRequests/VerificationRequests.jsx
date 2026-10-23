import { useEffect, useMemo, useState } from 'react';
import { get, post, formatDate, formatDateTime } from '@ethiocred/utils';
import { Button, Badge, Card, Loader, EmptyState, Alert } from '@ethiocred/ui';
import {
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Calendar,
} from 'lucide-react';

function requestStatusBadge(status) {
  const map = {
    PENDING: 'warning',
    APPROVED: 'success',
    DENIED: 'danger',
    COMPLETED: 'info',
  };
  return <Badge variant={map[status] || 'gray'} dot={status === 'PENDING'} pulse={status === 'PENDING'}>{status}</Badge>;
}

export default function VerificationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState(null);

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
    setActionType('approve');
    try {
      await post(`/verification/requests/${requestId}/approve`);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionId(null);
      setActionType(null);
    }
  };

  const handleDeny = async (requestId) => {
    setActionId(requestId);
    setActionType('deny');
    try {
      await post(`/verification/requests/${requestId}/deny`);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deny request');
    } finally {
      setActionId(null);
      setActionType(null);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader size="lg" color="text-emerald-600" />
        <p className="text-sm font-semibold text-slate-500">Loading verification requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Consent Manager
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-950 font-display mt-1">
          Verification Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and approve employer verification requests before anyone can view your academic credentials.
        </p>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 max-w-xs">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all duration-150 focus-ring ${
            activeTab === 'pending'
              ? 'bg-white text-navy-950 shadow-soft'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Pending</span>
          {pending.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {pending.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all duration-150 focus-ring ${
            activeTab === 'history'
              ? 'bg-white text-navy-950 shadow-soft'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>History</span>
          <span className="text-slate-400 text-[11px]">({history.length})</span>
        </button>
      </div>

      {/* Pending Requests Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No Pending Requests"
              description="You have no outstanding employer access requests. When an employer requests to verify your degree, it will appear here for your consent."
            />
          ) : (
            pending.map((req) => {
              const isActing = actionId === req.id;

              return (
                <div
                  key={req.id}
                  className="rounded-2xl border-2 border-amber-300/80 bg-white p-6 shadow-soft ring-4 ring-amber-50/60 transition-all hover:shadow-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 shadow-soft">
                        <Building2 size={24} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-navy-950 font-display">
                            {req.employer_name}
                          </h3>
                          <Badge variant="yellow" dot pulse size="sm">
                            Awaiting Consent
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          Requesting access to: {req.degree_name}
                        </p>
                        <p className="text-xs font-mono text-slate-400">
                          Serial: {req.serial_number}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-slate-400" />
                            <span>Requested: {formatDateTime(req.requested_at)}</span>
                          </span>
                          {req.expires_at && (
                            <span className="flex items-center gap-1 font-semibold text-amber-700">
                              <AlertCircle size={13} />
                              <span>Expires: {formatDate(req.expires_at)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2 sm:pt-0 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isActing}
                        isLoading={isActing && actionType === 'deny'}
                        onClick={() => handleDeny(req.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      >
                        Deny Access
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={isActing}
                        isLoading={isActing && actionType === 'approve'}
                        leftIcon={CheckCircle2}
                        onClick={() => handleApprove(req.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700/20"
                      >
                        Approve Access
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Consent History"
              description="No past verification decisions found."
            />
          ) : (
            history.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition-all hover:border-slate-300 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
                    <Building2 size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 font-display truncate">
                      {req.employer_name}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      {req.degree_name} · Serial: {req.serial_number}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Decision logged: {formatDateTime(req.requested_at)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {requestStatusBadge(req.status)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
