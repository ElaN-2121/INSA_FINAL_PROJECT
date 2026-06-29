import { useEffect, useMemo, useState } from 'react';
import { get, formatDateTime } from '@ethiocred/utils';
import Badge from '../../components/Badge/Badge.jsx';
import Table from '../../components/Table/Table.jsx';
import Loader from '../../components/Loader/Loader.jsx';
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
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Verifications Run</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Verified Count</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.verified}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Failed / Invalid Count</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stats.failed}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Verifications</h3>
        {recentResults.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No verifications run yet. Go to Verify Credential to run your first check.
          </p>
        ) : (
          <Table columns={columns} data={recentResults} />
        )}
      </div>
    </div>
  );
}
