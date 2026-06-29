import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, formatDate } from '@ethiocred/utils';
import Badge from '../../components/Badge/Badge.jsx';
import Table from '../../components/Table/Table.jsx';
import Loader from '../../components/Loader/Loader.jsx';

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
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Issued', value: stats.total, color: 'text-blue-600' },
          { label: 'Active Credentials', value: stats.active, color: 'text-green-600' },
          { label: 'Revoked Credentials', value: stats.revoked, color: 'text-red-600' },
          { label: 'Batches This Month', value: stats.batchesThisMonth, color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Credentials</h3>
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
