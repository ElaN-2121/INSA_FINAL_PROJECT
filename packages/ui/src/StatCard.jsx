import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  trend = 'neutral',
  helpText,
  className = '',
}) {
  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };

  const trendColors = {
    up: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    down: 'text-red-700 bg-red-50 border-red-200',
    neutral: 'text-slate-600 bg-slate-100 border-slate-200',
  };

  const TrendIcon = trendIcons[trend] || Minus;

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display tracking-tight tabular-nums mt-1">
            {value}
          </div>
        </div>

        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-900 border border-navy-100 shadow-soft">
            <Icon size={20} />
          </div>
        )}
      </div>

      {(change || helpText) && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${
                trendColors[trend]
              }`}
            >
              <TrendIcon size={12} />
              <span>{change}</span>
            </span>
          )}
          {helpText && <span className="text-slate-400 truncate ml-2">{helpText}</span>}
        </div>
      )}
    </div>
  );
}

export default StatCard;
