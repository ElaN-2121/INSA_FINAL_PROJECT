const API_BASE = 'http://localhost:5000/api';

export function getDemandBadgeStyle(score) {
  if (score >= 0.75) {
    return {
      size: 'large',
      className: 'bg-indigo-600 text-white font-bold px-5 py-3 text-base',
      hot: true,
    };
  }
  if (score >= 0.5) {
    return {
      size: 'medium',
      className: 'bg-indigo-400 text-white px-4 py-2.5 text-sm',
      hot: false,
    };
  }
  if (score >= 0.25) {
    return {
      size: 'medium',
      className: 'bg-blue-300 text-blue-900 px-4 py-2.5 text-sm',
      hot: false,
    };
  }
  return {
    size: 'small',
    className: 'bg-gray-100 text-gray-600 px-3 py-2 text-xs',
    hot: false,
  };
}

export function prepareDepartmentBadges(departments, limit = 10) {
  const sorted = [...departments].sort(
    (a, b) => Number(b.verifications_completed || 0) - Number(a.verifications_completed || 0)
  );
  const top = sorted.slice(0, limit);
  const maxVerifications = Math.max(...top.map((d) => Number(d.verifications_completed || 0)), 1);

  return top.map((dept) => ({
    ...dept,
    demandScore: Number(dept.verifications_completed || 0) / maxVerifications,
  }));
}

export default function DepartmentDemandBadges({ departments = [], limit = 10, emptyMessage }) {
  const badges = prepareDepartmentBadges(departments, limit);

  if (!badges.length) {
    return (
      <p className="text-sm text-gray-500 italic">
        {emptyMessage || 'Rankings update as employers verify credentials. Check back soon.'}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {badges.map((dept) => {
        const style = getDemandBadgeStyle(dept.demandScore);
        return (
          <div
            key={dept.department}
            className={`inline-flex flex-col rounded-xl shadow-sm transition-transform hover:scale-[1.02] ${style.className}`}
          >
            <span className="leading-tight">
              {style.hot && <span className="mr-1">🔥</span>}
              {style.hot && <span className="mr-1 text-xs uppercase tracking-wide opacity-90">HOT</span>}
              {dept.department}
            </span>
            <span className={`mt-1 ${style.size === 'small' ? 'text-[10px]' : 'text-xs'} opacity-90`}>
              {Number(dept.verifications_completed || 0).toLocaleString()} verifications
              {dept.average_gpa != null && ` · GPA ${dept.average_gpa}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { API_BASE };
