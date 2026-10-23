import { Badge, Loader, Table } from '@ethiocred/ui';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, formatDate } from '@ethiocred/utils';

function statusBadge(status) {
  if (status === 'ACTIVE') return <Badge variant="green">ACTIVE</Badge>;
  if (status === 'REVOKED') return <Badge variant="red">REVOKED</Badge>;
  return <Badge variant="gray">{status}</Badge>;
}

export default function Dashboard() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    get('/credentials/institution')
      .then(({ data }) => setCredentials(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load credentials'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const issuedThisMonth = credentials.filter((c) => {
      const d = new Date(c.created_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    return {
      total: credentials.length,
      active: credentials.filter((c) => c.status === 'ACTIVE').length,
      revoked: credentials.filter((c) => c.status === 'REVOKED').length,
      batchesThisMonth: issuedThisMonth,
    };
  }, [credentials]);

  const recentCredentials = useMemo(
    () =>
      [...credentials]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10),
    [credentials]
  );

  const columns = [
    { key: 'serial_number', label: 'Serial' },
    { key: 'holder_name', label: 'Student Name' },
    { key: 'degree_name', label: 'Degree' },
    {
      key: 'issue_date',
      label: 'Date',
      render: (row) => formatDate(row.issue_date),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => statusBadge(row.status),
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
    <div className="space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">Overview of issued credentials and recent activity.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Issued', value: stats.total },
          { label: 'Active Credentials', value: stats.active },
          { label: 'Revoked Credentials', value: stats.revoked },
          { label: 'Batches This Month', value: stats.batchesThisMonth },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Recent Credentials</h3>
            <p className="text-sm text-slate-500">Click a credential to view detailed information.</p>
          </div>
        </div>
        <Table
          columns={columns}
          data={recentCredentials}
          onRowClick={(row) => navigate(`/credentials/${row.id}`)}
          emptyMessage="No credentials issued yet."
        />
      </div>
    </div>
  );
}
