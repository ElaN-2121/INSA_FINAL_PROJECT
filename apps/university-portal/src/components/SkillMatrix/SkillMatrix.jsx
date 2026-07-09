import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart2, GraduationCap, TrendingUp } from 'lucide-react';
import Loader from '../Loader/Loader.jsx';
import DepartmentDemandBadges, { API_BASE } from './DepartmentDemandBadges.jsx';

const RANK_STYLES = [
  'bg-blue-700 text-white',
  'bg-blue-600 text-white',
  'bg-blue-500 text-white',
  'bg-blue-100 text-blue-900',
  'bg-blue-50 text-blue-800',
  'bg-gray-50 text-gray-700',
];

function InstitutionCard({ institution, rank, maxVerifications }) {
  const verifications = Number(institution.verifications_completed || 0);
  const progress = maxVerifications > 0 ? (verifications / maxVerifications) * 100 : 0;
  const barColor = rank <= 3 ? 'bg-blue-600' : 'bg-blue-400';

  return (
    <div className={`relative overflow-hidden rounded-xl p-5 shadow-sm ${RANK_STYLES[rank - 1] || RANK_STYLES[5]}`}>
      <span className="absolute left-3 top-3 rounded-md bg-black/10 px-2 py-0.5 text-xs font-bold">
        #{rank}
      </span>
      {rank === 1 && (
        <span className="absolute right-3 top-3 text-lg" aria-label="Top performer">
          🔥
        </span>
      )}
      <h4 className="mt-6 text-lg font-bold leading-snug">{institution.name}</h4>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs opacity-90">
        <span>{Number(institution.credentials_issued || 0).toLocaleString()} credentials</span>
        <span>|</span>
        <span>{verifications.toLocaleString()} verifications</span>
        <span>|</span>
        <span>{Number(institution.unique_graduates_verified || 0).toLocaleString()} graduates</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/10">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export default function SkillMatrix({
  subtitle = 'Updated in real time as employers verify graduate credentials',
  rankingsHref = '/leaderboard',
  rankingsLinkExternal = false,
}) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/analytics/leaderboard`),
      axios.get(`${API_BASE}/analytics/departments`),
    ])
      .then(([lbRes, deptRes]) => {
        setLeaderboard(lbRes.data.data || []);
        setDepartments(deptRes.data.data || []);
      })
      .catch(() => {
        setLeaderboard([]);
        setDepartments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const topInstitutions = leaderboard.slice(0, 6);
  const maxVerifications = Math.max(
    ...topInstitutions.map((i) => Number(i.verifications_completed || 0)),
    1
  );
  const isEmpty = !loading && topInstitutions.length === 0 && departments.length === 0;

  const RankingsLink = rankingsLinkExternal ? 'a' : Link;
  const rankingsLinkProps = rankingsLinkExternal
    ? { href: rankingsHref, target: '_blank', rel: 'noopener noreferrer' }
    : { to: rankingsHref };

  return (
    <section className="bg-white px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold text-gray-900">
            <BarChart2 size={26} className="text-blue-600" />
            <span className="inline-flex items-center gap-2">
              Live
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Platform Intelligence
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600">{subtitle}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : isEmpty ? (
          <p className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500 italic">
            Rankings update as employers verify credentials. Check back soon.
          </p>
        ) : (
          <>
            <div className="mb-12">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <GraduationCap size={20} className="text-blue-600" />
                Most Trusted Universities
              </h3>
              {topInstitutions.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {topInstitutions.map((institution, index) => (
                    <InstitutionCard
                      key={institution.id}
                      institution={institution}
                      rank={index + 1}
                      maxVerifications={maxVerifications}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Rankings update as employers verify credentials. Check back soon.
                </p>
              )}
            </div>

            <hr className="mb-12 border-gray-200" />

            <div>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <TrendingUp size={20} className="text-indigo-600" />
                Most In-Demand Fields
              </h3>
              <DepartmentDemandBadges departments={departments} limit={10} />
            </div>
          </>
        )}

        <div className="mt-10 text-center">
          <RankingsLink
            {...rankingsLinkProps}
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800"
          >
            View Full Rankings →
          </RankingsLink>
        </div>
      </div>
    </section>
  );
}
