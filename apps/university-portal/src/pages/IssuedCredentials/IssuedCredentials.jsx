import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post, formatDate } from '@ethiocred/utils';
import Badge from '../../components/Badge/Badge.jsx';
import Table from '../../components/Table/Table.jsx';
import SearchInput from '../../components/SearchInput/SearchInput.jsx';
import Loader from '../../components/Loader/Loader.jsx';

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
  const [page, setPage] = useState(1);
  const [revoking, setRevoking] = useState(null);
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
    if (!q) return credentials;
    return credentials.filter(
      (c) =>
        c.holder_name?.toLowerCase().includes(q) ||
        c.serial_number?.toLowerCase().includes(q)
    );
  }, [credentials, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleRevoke = async (e, credential) => {
    e.stopPropagation();
    if (credential.status === 'REVOKED') return;
    const reason = window.prompt('Enter revocation reason:');
    if (!reason?.trim()) return;
    setRevoking(credential.id);
    try {
      await post(`/credentials/${credential.id}/revoke`, { reason: reason.trim() });
      fetchCredentials();
    } catch (err) {
      alert(err.response?.data?.message || 'Revocation failed');
    } finally {
      setRevoking(null);
    }
  };

  const columns = [
    { key: 'serial_number', label: 'Serial Number' },
    { key: 'holder_name', label: 'Student Name' },
    {
      key: 'holder_fayda_id',
      label: 'Fayda ID',
      render: (row) => row.holder_fayda_id || '-',
    },
    { key: 'degree_name', label: 'Degree' },
    {
      key: 'issue_date',
      label: 'Issue Date',
      render: (row) => formatDate(row.issue_date),
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
        <button
          type="button"
          onClick={(e) => handleRevoke(e, row)}
          disabled={row.status === 'REVOKED' || revoking === row.id}
          className="px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {revoking === row.id ? 'Revoking...' : 'Revoke'}
        </button>
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Issued Credentials</h2>
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or serial..."
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={paginated}
        onRowClick={(row) => navigate(`/credentials/${row.id}`)}
        emptyMessage="No credentials found."
      />

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{' '}
            {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
