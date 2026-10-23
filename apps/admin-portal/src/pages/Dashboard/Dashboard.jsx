import { Loader } from '@ethiocred/ui';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { get } from '../../services/api.js';

export default function Dashboard() {
  const [institutions, setInstitutions] = useState([]);
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      get('/admin/institutions'),
      get('/admin/institutions/pending'),
      get('/admin/stats'),
    ])
      .then(([instRes, pendingRes, statsRes]) => {
        setInstitutions(instRes.data.data || []);
        setPending(pendingRes.data.data || []);
        setStats(statsRes.data.data || null);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const total = institutions.length;
    const active = institutions.filter((i) => i.status === 'ACTIVE').length;
    const pendingCount = institutions.filter((i) =>
      ['PENDING', 'UNDER_REVIEW'].includes(i.status)
    ).length;
    return { total, active, pending: pendingCount };
  }, [institutions]);

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
        <h2 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Platform overview — institutions, users, and pending approvals.
        </p>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      {pending.length > 0 && (
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={20} />
            <p className="text-sm font-medium text-amber-900">
              {pending.length} institution{pending.length !== 1 ? 's' : ''} awaiting approval
            </p>
          </div>
          <Link
            to="/institutions"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Review Institutions
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: 'Total Institutions', value: counts.total },
          { label: 'Active Institutions', value: counts.active },
          { label: 'Pending Institutions', value: counts.pending },
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

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Users', value: stats.users },
            { label: 'Credentials', value: stats.credentials },
            { label: 'Verifications', value: stats.verifications },
            { label: 'Institutions (DB)', value: stats.institutions },
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
      )}
    </div>
  );
}
