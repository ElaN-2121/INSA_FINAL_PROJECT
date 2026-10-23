import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSearch,
  ArrowRight,
  UserCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { get, formatDateTime } from '@ethiocred/utils';
import { Badge, Loader, Button, PageHeader, EmptyState } from '@ethiocred/ui';

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
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Consent Request Status"
        description="Monitor student approvals and immediately verify authorized credentials."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/request')}
            className="bg-navy-900 hover:bg-navy-800 text-white shadow-sm"
          >
            New Request
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No verification requests"
          description="Submit a verification consent request to begin reviewing student records."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/request')}
              className="bg-navy-900 hover:bg-navy-800 text-white"
            >
              Request Consent
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-bold text-slate-900 text-base">
                      {req.degree_name || 'Academic Credential'}
                    </h3>
                    {statusBadge(req.status)}
                  </div>

                  <p className="font-mono text-xs text-slate-500">
                    Serial: <span className="font-semibold text-slate-800">{req.serial_number}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Requested: {formatDateTime(req.requested_at)}
                    </span>
                    {req.responded_at && (
                      <>
                        <span>·</span>
                        <span>Responded: {formatDateTime(req.responded_at)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {req.status === 'APPROVED' && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() =>
                        navigate('/verify', {
                          state: { credentialId: req.credential_id, serial: req.serial_number },
                        })
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                      <FileSearch className="mr-2 h-4 w-4" />
                      Verify Now
                    </Button>
                  )}
                  {req.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                      <Clock className="h-4 w-4" />
                      Awaiting Student Consent
                    </span>
                  )}
                  {req.status === 'DENIED' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                      <XCircle className="h-4 w-4" />
                      Access Declined by Student
                    </span>
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
