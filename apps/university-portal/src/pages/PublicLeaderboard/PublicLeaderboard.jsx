import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, GraduationCap, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Loader from '../../components/Loader/Loader.jsx';
import logo from '../../assets/logo.png';

const API_BASE = 'http://localhost:5000/api';

function rankBorder(index) {
  if (index === 0) return 'border-l-4 border-l-amber-400 bg-amber-50/30';
  if (index === 1) return 'border-l-4 border-l-gray-400 bg-gray-50/50';
  if (index === 2) return 'border-l-4 border-l-amber-600 bg-amber-50/20';
  return '';
}

export default function PublicLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/analytics/leaderboard`),
      axios.get(`${API_BASE}/analytics/departments`),
    ])
      .then(([lbRes, deptRes]) => {
        setLeaderboard(lbRes.data.data || []);
        setDepartments(deptRes.data.data || []);
      })
      .catch(() => setError('Failed to load rankings'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EthioCred logo" className="h-10 w-10 rounded-lg object-contain" />
            <span className="text-lg font-semibold text-gray-900">EthioCred Rankings</span>
          </div>
          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            University Login
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <Award className="mx-auto mb-4 text-blue-200" size={48} />
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Ethiopian University Credential Rankings
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            See which universities are most trusted by employers
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <GraduationCap size={22} className="text-blue-600" />
              Institution Rankings
            </h2>
          </div>
          <div className="overflow-x-auto p-2">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Institution Name</th>
                  <th className="px-4 py-3 font-medium">Credentials Issued</th>
                  <th className="px-4 py-3 font-medium">Employer Verifications</th>
                  <th className="px-4 py-3 font-medium">Unique Graduates Verified</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, index) => (
                  <tr key={row.id} className={`border-t border-gray-100 ${rankBorder(index)}`}>
                    <td className="px-4 py-4 text-lg font-bold text-gray-900">{index + 1}</td>
                    <td className="px-4 py-4 font-semibold text-gray-900">{row.name}</td>
                    <td className="px-4 py-4 text-gray-600">{row.credentials_issued}</td>
                    <td className="px-4 py-4 font-medium text-blue-700">{row.verifications_completed}</td>
                    <td className="px-4 py-4 text-gray-600">{row.unique_graduates_verified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <TrendingUp size={22} className="text-indigo-600" />
              Most In-Demand Fields Nationwide
            </h2>
          </div>
          <div className="overflow-x-auto p-2">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Credentials Issued</th>
                  <th className="px-4 py-3 font-medium">Verifications</th>
                  <th className="px-4 py-3 font-medium">Average GPA</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((row) => (
                  <tr key={row.department} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.department}</td>
                    <td className="px-4 py-3 text-gray-600">{row.credentials_issued}</td>
                    <td className="px-4 py-3 text-gray-600">{row.verifications_completed}</td>
                    <td className="px-4 py-3 text-gray-600">{row.average_gpa ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900">Join EthioCred</h3>
          <p className="mx-auto mt-2 max-w-xl text-gray-600">
            Issue cryptographically signed credentials and see your institution climb the national rankings.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Get Started — University Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
