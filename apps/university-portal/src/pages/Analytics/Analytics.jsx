import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { get } from '@ethiocred/utils';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../../components/Loader/Loader.jsx';

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.institution_id) {
      setLoading(false);
      return;
    }

    Promise.all([
      get(`/analytics/institution/${user.institution_id}`),
      get('/analytics/leaderboard'),
    ])
      .then(([statsRes, lbRes]) => {
        setStats(statsRes.data.data);
        setLeaderboard(lbRes.data.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [user?.institution_id]);

  const insight = useMemo(() => {
    if (!stats || !leaderboard.length || !user?.institution_id) return null;

    const myEntry = leaderboard.find((row) => row.id === user.institution_id);
    if (!myEntry) return null;

    const totalVerifications = leaderboard.reduce(
      (sum, row) => sum + Number(row.verifications_completed || 0),
      0
    );
    const avgVerifications = totalVerifications / leaderboard.length;
    const myVerifications = Number(myEntry.verifications_completed || 0);

    if (avgVerifications === 0) return null;

    const pctDiff = Math.round(((myVerifications - avgVerifications) / avgVerifications) * 100);
    if (pctDiff >= 0) {
      return `Your graduates are being verified ${pctDiff}% more than the national average.`;
    }
    return `Your graduates are being verified ${Math.abs(pctDiff)}% below the national average — share credentials to increase employer trust.`;
  }, [stats, leaderboard, user?.institution_id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (!user?.institution_id) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-gray-600">Your account is not linked to an institution.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
          <TrendingUp size={24} className="text-blue-700" />
          Institution Analytics
        </h2>
        <p className="mt-1 text-sm text-gray-500">Credential issuance and employer verification activity for your institution.</p>
        <Link to="/leaderboard" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700">
          View national rankings →
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {insight && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-sm font-medium text-indigo-900">
          {insight}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Credentials Issued" value={stats.credentialsIssued} />
            <StatCard label="Active Credentials" value={stats.activeCount} />
            <StatCard label="Revoked Credentials" value={stats.revokedCount} />
            <StatCard label="Times Verified by Employers" value={stats.totalVerifications} />
          </div>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Department Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                    <th className="pb-3 pr-4 font-medium">Department</th>
                    <th className="pb-3 pr-4 font-medium">Credentials Issued</th>
                    <th className="pb-3 font-medium">Average GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.departmentBreakdown || []).map((row) => (
                    <tr key={row.department} className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-900">{row.department}</td>
                      <td className="py-3 pr-4 text-gray-600">{row.credentials_issued}</td>
                      <td className="py-3 text-gray-600">{row.average_gpa ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Graduation Year Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                    <th className="pb-3 pr-4 font-medium">Year</th>
                    <th className="pb-3 font-medium">Credentials Issued</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.graduationYearBreakdown || []).map((row) => (
                    <tr key={row.graduation_year} className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-900">{row.graduation_year}</td>
                      <td className="py-3 text-gray-600">{row.credentials_issued}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
