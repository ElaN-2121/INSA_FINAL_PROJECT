import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Search,
  Filter,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  FileText,
  AlertCircle,
  Building2
} from 'lucide-react';
import { get, post, formatDate } from '@ethiocred/utils';
import {
  Badge,
  Loader,
  SearchInput,
  Table,
  Button,
  Modal,
  PageHeader,
  EmptyState
} from '@ethiocred/ui';

const PAGE_SIZE = 10;

function statusBadge(status) {
  if (status === 'ACTIVE') return <Badge variant="green">ACTIVE</Badge>;
  if (status === 'REVOKED') return <Badge variant="red">REVOKED</Badge>;
  return <Badge variant="gray">{status}</Badge>;
}

export default function IssuedCredentials() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [revokingId, setRevokingId] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeError, setRevokeError] = useState('');
  const navigate = useNavigate();

  const fetchCredentials = () => {
    setLoading(true);
    get('/credentials/institution')
      .then(({ data }) => setCredentials(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load credentials'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return credentials.filter((c) => {
      const matchesSearch =
        !q ||
        c.holder_name?.toLowerCase().includes(q) ||
        c.serial_number?.toLowerCase().includes(q) ||
        c.holder_fayda_id?.toLowerCase().includes(q) ||
        c.degree_name?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [credentials, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const openRevokeModal = (e, credential) => {
    e.stopPropagation();
    setRevokeTarget(credential);
    setRevokeReason('');
    setRevokeError('');
  };

  const confirmRevoke = async () => {
    if (!revokeTarget) return;
    if (!revokeReason.trim()) {
      setRevokeError('Please provide a legitimate justification for revocation.');
      return;
    }

    setRevokingId(revokeTarget.id);
    try {
      await post(`/credentials/${revokeTarget.id}/revoke`, { reason: revokeReason.trim() });
      setRevokeTarget(null);
      fetchCredentials();
    } catch (err) {
      setRevokeError(err.response?.data?.message || 'Revocation failed');
    } finally {
      setRevokingId(null);
    }
  };

  const columns = [
    {
      key: 'serial_number',
      label: 'Serial Number',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-navy-900">
          {row.serial_number}
        </span>
      ),
    },
    {
      key: 'holder_name',
      label: 'Student Name',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.holder_name}</p>
          <p className="text-xs text-slate-500 font-mono">{row.holder_fayda_id || '—'}</p>
        </div>
      ),
    },
    {
      key: 'degree_name',
      label: 'Degree',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.degree_name}</p>
          <p className="text-xs text-slate-500">{row.major || 'Undergraduate'}</p>
        </div>
      ),
    },
    {
      key: 'issue_date',
      label: 'Issue Date',
      render: (row) => (
        <span className="text-slate-600 text-xs">{formatDate(row.issue_date)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => statusBadge(row.status),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          {row.status === 'ACTIVE' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => openRevokeModal(e, row)}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 text-xs py-1"
            >
              Revoke
            </Button>
          ) : (
            <span className="text-xs font-medium text-slate-400 italic">Revoked</span>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issued Credentials Registry"
        description="Search, inspect, and manage university degrees committed to the national trust registry."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/upload')}
            className="bg-navy-900 hover:bg-navy-800 text-white shadow-sm"
          >
            Upload New Batch
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            placeholder="Search by name, serial, Fayda ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            Filter:
          </span>
          {[
            { id: 'ALL', label: `All (${credentials.length})` },
            { id: 'ACTIVE', label: `Active (${credentials.filter((c) => c.status === 'ACTIVE').length})` },
            { id: 'REVOKED', label: `Revoked (${credentials.filter((c) => c.status === 'REVOKED').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                statusFilter === tab.id
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Award}
            title={search || statusFilter !== 'ALL' ? 'No matching records' : 'No credentials issued'}
            description={
              search || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filter tags.'
                : 'Upload graduation batches to begin issuing academic credentials.'
            }
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={paginated}
              onRowClick={(row) => navigate(`/credentials/${row.id}`)}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-600">
                <div>
                  Showing{' '}
                  <span className="font-semibold text-slate-900">
                    {(page - 1) * PAGE_SIZE + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-slate-900">
                    {Math.min(page * PAGE_SIZE, filtered.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-900">{filtered.length}</span> records
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="border-slate-300 text-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="px-2 text-xs font-medium text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="border-slate-300 text-slate-700"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Revocation Confirmation Modal */}
      <Modal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revoke Credential Authorization"
        confirmLabel={revokingId ? 'Revoking...' : 'Confirm Revocation'}
        cancelLabel="Cancel"
        onConfirm={confirmRevoke}
        variant="danger"
      >
        {revokeTarget && (
          <div className="space-y-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900">Irreversible Action</p>
                <p className="mt-0.5">
                  Revoking this credential publishes an immediate invalidation notice to the National Trust Registry. Any future verification attempts by employers will fail.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 space-y-1.5 text-xs text-slate-600 border border-slate-100">
              <p><strong>Candidate:</strong> {revokeTarget.holder_name}</p>
              <p><strong>Degree:</strong> {revokeTarget.degree_name}</p>
              <p className="font-mono"><strong>Serial:</strong> {revokeTarget.serial_number}</p>
            </div>

            {revokeError && (
              <p className="text-xs font-medium text-rose-600">{revokeError}</p>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Revocation Reason / Administrative Order *
              </label>
              <textarea
                rows={3}
                required
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Administrative error, degree upgrade, disciplinary board determination..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
