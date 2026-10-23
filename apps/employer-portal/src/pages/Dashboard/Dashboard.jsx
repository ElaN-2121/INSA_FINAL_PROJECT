import { Badge, Loader, Table } from '@ethiocred/ui';
import { useEffect, useMemo, useState } from 'react';
import { get, formatDateTime } from '@ethiocred/utils';
import { getVerificationResults } from '../../utils/verificationCache.js';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    get('/verification/history')
      .then(({ data }) => setHistory(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const results = getVerificationResults();

  const stats = useMemo(() => ({
    total: results.length,
    verified: results.filter((r) => r.valid).length,
    failed: results.filter((r) => !r.valid).length,
    requests: history.length,
  }), [results, history]);

  const recentResults = results.slice(0, 10);

  const columns = [
    { key: 'serial_number', label: 'Credential Serial' },
    { key: 'holder_name', label: 'Student Name' },
    {
      key: 'verifiedAt',
      label: 'Date',
      render: (row) => formatDateTime(row.verifiedAt),
    },
    {
      key: 'valid',
      label: 'Result',
      render: (row) =>
        row.valid ? (
          <Badge variant="green">VALID</Badge>
        ) : (
          <Badge variant="red">INVALID</Badge>
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
      <h2 className="mb-6 text-2xl font-semibold text-gray-900">Dashboard</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Verifications Run</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Verified Count</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">{stats.verified}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Failed / Invalid Count</p>
          <p className="mt-1 text-3xl font-bold text-gray-700">{stats.failed}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Verifications</h3>
        {recentResults.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              No verifications run yet. Go to Verify Credential to view and verify credentials
              you&apos;ve been approved to access.
            </p>
          </div>
        ) : (
          <Table columns={columns} data={recentResults} />
        )}
      </div>
    </div>
  );
}
