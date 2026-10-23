import { Badge, Loader } from '@ethiocred/ui';
import { useCallback, useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { get } from '../../services/api.js';
import { formatDateTime } from '../../utils/formatDate.js';

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
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
]);

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

const btnPrimary =
  'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

const btnSecondary =
  'rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

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
    UNIVERSITY: 'gray',
    STUDENT: 'gray',
    EMPLOYER: 'gray',
  };
  return <Badge variant={map[role] || 'gray'}>{role || 'SYSTEM'}</Badge>;
}

function actionBadge(action) {
  if (HIGH_SIGNIFICANCE_ACTIONS.has(action)) {
    return (
      <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
        {formatAction(action)}
      </span>
    );
  }
  return (
    <span className="text-sm font-medium text-gray-800">{formatAction(action)}</span>
  );
}

function EntityIdCell({ entityId }) {
  const [copied, setCopied] = useState(false);

  if (!entityId) {
    return <span className="text-gray-400">—</span>;
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
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-600">
      <span title={entityId}>{truncated}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded p-0.5 text-gray-400 transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Copy entity ID"
      >
        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
      </button>
    </span>
  );
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (appliedFilters.action) params.set('action', appliedFilters.action);
      if (appliedFilters.startDate) params.set('startDate', appliedFilters.startDate);
      if (appliedFilters.endDate) params.set('endDate', appliedFilters.endDate);

      const { data } = await get(`/admin/audit-logs?${params.toString()}`);
      const payload = data.data;
      setLogs(payload.logs || []);
      setTotal(payload.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, appliedFilters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedFilters({ action, startDate, endDate });
  };

  const handleClearFilters = () => {
    setAction('');
    setStartDate('');
    setEndDate('');
    setAppliedFilters({ action: '', startDate: '', endDate: '' });
    setPage(1);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Audit Logs</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review system activity including logins, credential operations, and institution onboarding.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleFilter}
        className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="actionFilter" className="mb-1 block text-sm font-medium text-gray-700">
              Action type
            </label>
            <select
              id="actionFilter"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className={inputClass}
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-gray-700">
              Start date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-gray-700">
              End date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className={btnPrimary}>
              Apply Filters
            </button>
            <button type="button" onClick={handleClearFilters} className={btnSecondary}>
              Clear
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {['Timestamp', 'Acting User', 'Action', 'Entity Type', 'Entity ID', 'IP Address'].map(
                    (label) => (
                      <th
                        key={label}
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {label}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                      No audit log entries found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, rowIndex) => (
                    <tr
                      key={log.id}
                      className={`transition-colors duration-200 hover:bg-blue-50 ${
                        rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } ${HIGH_SIGNIFICANCE_ACTIONS.has(log.action) ? 'ring-1 ring-inset ring-indigo-100' : ''}`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <p className="font-medium text-gray-900">{log.full_name || 'System'}</p>
                        <div className="mt-1">{roleBadge(log.user_role)}</div>
                      </td>
                      <td className="px-4 py-3">{actionBadge(log.action)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {log.entity_type || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <EntityIdCell entityId={log.entity_id} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">
                        {log.ip_address || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages} · {total} total result{total !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={btnSecondary}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={btnSecondary}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
