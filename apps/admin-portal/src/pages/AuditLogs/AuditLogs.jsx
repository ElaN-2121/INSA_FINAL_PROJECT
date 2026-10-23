import { useCallback, useEffect, useState } from 'react';
import {
  FileSearch,
  Copy,
  Check,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import { Badge, Loader, Button, PageHeader, EmptyState } from '@ethiocred/ui';
import { get } from '../../services/api.js';
import { formatDateTime } from '../../utils/formatDate.js';

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'USER_LOGIN', label: 'User Login' },
  { value: 'USER_LOGOUT', label: 'User Logout' },
  { value: 'CREDENTIAL_ISSUED', label: 'Credential Issued' },
  { value: 'CREDENTIAL_REVOKED', label: 'Credential Revoked' },
  { value: 'VERIFICATION_REQUESTED', label: 'Verification Requested' },
  { value: 'VERIFICATION_APPROVED', label: 'Verification Approved' },
  { value: 'VERIFICATION_DENIED', label: 'Verification Denied' },
  { value: 'VERIFICATION_COMPLETED', label: 'Verification Completed' },
  { value: 'INSTITUTION_REGISTERED', label: 'Institution Registered' },
  { value: 'INSTITUTION_APPROVED', label: 'Institution Approved' },
  { value: 'REGISTRAR_CREATED', label: 'Registrar Created' },
  { value: 'ADMIN_CREATED', label: 'Admin Created' },
];

const HIGH_SIGNIFICANCE_ACTIONS = new Set([
  'INSTITUTION_REGISTERED',
  'INSTITUTION_APPROVED',
  'REGISTRAR_CREATED',
  'CREDENTIAL_REVOKED',
]);

function formatAction(action) {
  if (!action) return '—';
  return action
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function roleBadge(role) {
  const map = {
    ADMIN: 'blue',
    UNIVERSITY: 'yellow',
    STUDENT: 'green',
    EMPLOYER: 'purple',
  };
  return <Badge variant={map[role] || 'gray'}>{role || 'SYSTEM'}</Badge>;
}

function actionBadge(action) {
  if (HIGH_SIGNIFICANCE_ACTIONS.has(action)) {
    return (
      <span className="inline-flex items-center rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-900 border border-navy-200">
        {formatAction(action)}
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-slate-800">{formatAction(action)}</span>
  );
}

function EntityIdCell({ entityId }) {
  const [copied, setCopied] = useState(false);

  if (!entityId) {
    return <span className="text-slate-400">—</span>;
  }

  const truncated = entityId.length > 12 ? `${entityId.slice(0, 8)}…${entityId.slice(-4)}` : entityId;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(entityId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600">
      <span title={entityId}>{truncated}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded p-0.5 text-slate-400 transition-colors hover:text-navy-900 focus:outline-none"
        aria-label="Copy entity ID"
      >
        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
      </button>
    </span>
  );
}

const PAGE_SIZE = 20;

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [action, setAction] = useState('');
  const [userRole, setUserRole] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      };
      if (action) params.action = action;
      if (userRole) params.user_role = userRole;
      if (startDate) params.from = startDate;
      if (endDate) params.to = endDate;

      const { data } = await get('/admin/audit-logs', { params });
      setLogs(data.data?.logs || data.data || []);
      setTotal(data.data?.total ?? (data.data?.logs ? data.data.logs.length : (data.data || []).length));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [action, userRole, startDate, endDate, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleClearFilters = () => {
    setAction('');
    setUserRole('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & System Audit Telemetry"
        description="Tamper-evident record of administrative, issuance, and verification security events."
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Filter Toolbar */}
      <form
        onSubmit={handleApplyFilters}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Action Type
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Actor Role
            </label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="UNIVERSITY">UNIVERSITY</option>
              <option value="STUDENT">STUDENT</option>
              <option value="EMPLOYER">EMPLOYER</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="border-slate-300 text-slate-700"
          >
            Clear Filters
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="bg-navy-900 hover:bg-navy-800 text-white"
          >
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Apply Filters
          </Button>
        </div>
      </form>

      {/* Logs Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="bg-slate-50/80">
                  {['Timestamp', 'Acting User & Role', 'Action', 'Entity Type', 'Entity ID', 'Client IP'].map(
                    (label) => (
                      <th
                        key={label}
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        {label}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                      No security audit events recorded matching current criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, rowIndex) => (
                    <tr
                      key={log.id}
                      className={`transition-colors duration-150 hover:bg-slate-50 ${
                        rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-semibold text-slate-900">{log.full_name || 'System Actor'}</p>
                        <div className="mt-1">{roleBadge(log.user_role)}</div>
                      </td>
                      <td className="px-4 py-3">{actionBadge(log.action)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600 font-mono">
                        {log.entity_type || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <EntityIdCell entityId={log.entity_id} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                        {log.ip_address || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <p>
                Showing Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
                <span className="font-semibold text-slate-900">{totalPages}</span> ({total} total events)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="border-slate-300 text-slate-700"
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="border-slate-300 text-slate-700"
                >
                  Next
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
