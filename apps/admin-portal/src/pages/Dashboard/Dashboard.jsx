import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { get } from '../../services/api.js';
import Loader from '../../components/Loader/Loader.jsx';

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
      <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
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
            className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Review Institutions
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: 'Total Institutions', value: counts.total, color: 'text-sky-600' },
          { label: 'Active Institutions', value: counts.active, color: 'text-emerald-600' },
          { label: 'Pending Institutions', value: counts.pending, color: 'text-amber-600' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
            <p className={`mt-3 text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Users', value: stats.users, color: 'text-violet-600' },
            { label: 'Credentials', value: stats.credentials, color: 'text-indigo-600' },
            { label: 'Verifications', value: stats.verifications, color: 'text-blue-600' },
            { label: 'Institutions (DB)', value: stats.institutions, color: 'text-slate-600' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
              <p className={`mt-3 text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
