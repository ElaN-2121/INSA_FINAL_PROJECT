import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { get } from '../../services/api.js';
import Loader from '../../components/Loader/Loader.jsx';
import { formatDate } from '../../utils/formatDate.js';

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  );
}

function rankBorder(index) {
  if (index === 0) return 'border-l-4 border-l-amber-400';
  if (index === 1) return 'border-l-4 border-l-gray-400';
  if (index === 2) return 'border-l-4 border-l-amber-600';
  return '';
}

function formatMonth(value) {
  if (!value) return '—';
  return formatDate(value);
}

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [trends, setTrends] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      get('/analytics/overview'),
      get('/analytics/leaderboard'),
      get('/analytics/trends?months=6'),
      get('/analytics/departments'),
      get('/analytics/employers'),
    ])
      .then(([overviewRes, leaderboardRes, trendsRes, deptRes, empRes]) => {
        setOverview(overviewRes.data.data);
        setLeaderboard(leaderboardRes.data.data || []);
        setTrends(trendsRes.data.data || []);
        setDepartments(deptRes.data.data || []);
        setEmployers(empRes.data.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

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
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
          <BarChart3 size={24} className="text-blue-700" />
          Platform Analytics
        </h2>
        <p className="mt-1 text-sm text-gray-500">System-wide insights across institutions, credentials, and verifications.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {overview && (
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">System Overview</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total Institutions" value={overview.totalInstitutions} />
            <StatCard label="Active Institutions" value={overview.activeInstitutions} />
            <StatCard label="Total Credentials" value={overview.totalCredentials} />
            <StatCard label="Total Verifications" value={overview.totalVerifications} />
            <StatCard label="Total Students" value={overview.totalStudents} />
            <StatCard label="Total Employers" value={overview.totalEmployers} />
          </div>
        </section>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Institution Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-3 pr-4 font-medium">Rank</th>
                <th className="pb-3 pr-4 font-medium">Institution Name</th>
                <th className="pb-3 pr-4 font-medium">Credentials Issued</th>
                <th className="pb-3 pr-4 font-medium">Verifications Completed</th>
                <th className="pb-3 font-medium">Unique Graduates Verified</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, index) => (
                <tr key={row.id} className={`border-b border-gray-100 ${rankBorder(index)}`}>
                  <td className="py-3 pr-4 font-semibold text-gray-900">{index + 1}</td>
                  <td className="py-3 pr-4 font-medium text-gray-900">{row.name}</td>
                  <td className="py-3 pr-4 text-gray-600">{row.credentials_issued}</td>
                  <td className="py-3 pr-4 text-gray-600">{row.verifications_completed}</td>
                  <td className="py-3 text-gray-600">{row.unique_graduates_verified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Verification Trends (6 months)</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-3 pr-4 font-medium">Month</th>
                <th className="pb-3 pr-4 font-medium">Total</th>
                <th className="pb-3 pr-4 font-medium text-blue-600">Successful</th>
                <th className="pb-3 font-medium text-red-500">Failed</th>
              </tr>
            </thead>
            <tbody>
              {trends.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">No verification data yet.</td>
                </tr>
              ) : (
                trends.map((row) => (
                  <tr key={row.month} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-900">{formatMonth(row.month)}</td>
                    <td className="py-3 pr-4 text-gray-600">{row.total_verifications}</td>
                    <td className="py-3 pr-4 font-medium text-blue-600">{row.successful}</td>
                    <td className="py-3 font-medium text-red-500">{row.failed}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Departments</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-3 pr-4 font-medium">Department</th>
                <th className="pb-3 pr-4 font-medium">Credentials Issued</th>
                <th className="pb-3 pr-4 font-medium">Verifications</th>
                <th className="pb-3 font-medium">Average GPA</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((row) => (
                <tr key={row.department} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium text-gray-900">{row.department}</td>
                  <td className="py-3 pr-4 text-gray-600">{row.credentials_issued}</td>
                  <td className="py-3 pr-4 text-gray-600">{row.verifications_completed}</td>
                  <td className="py-3 text-gray-600">{row.average_gpa ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Employer Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-3 pr-4 font-medium">Employer Name</th>
                <th className="pb-3 pr-4 font-medium">Company</th>
                <th className="pb-3 pr-4 font-medium">Total Requests</th>
                <th className="pb-3 font-medium">Completed Verifications</th>
              </tr>
            </thead>
            <tbody>
              {employers.map((row, index) => (
                <tr key={`${row.employer_name}-${index}`} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium text-gray-900">{row.employer_name}</td>
                  <td className="py-3 pr-4 text-gray-600">{row.company_name || '—'}</td>
                  <td className="py-3 pr-4 text-gray-600">{row.total_requests}</td>
                  <td className="py-3 text-gray-600">{row.completed_verifications}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
