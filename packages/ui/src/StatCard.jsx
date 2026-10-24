import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({
  label,
  title,
  value,
  icon: Icon,
  change,
  trend = 'neutral',
  helpText,
  subtext,
  className = '',
}) {
  const displayLabel = label || title;
  const displayHelp = helpText || subtext || (typeof trend === 'object' ? trend.value : null);
  const isPositive = typeof trend === 'object' ? trend.positive : trend === 'up';
  const isNegative = typeof trend === 'object' ? trend.positive === false : trend === 'down';

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {displayLabel}
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display tracking-tight tabular-nums">
            {value ?? 0}
          </div>
        </div>

        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-900 border border-navy-100 shadow-soft">
            <Icon size={20} />
          </div>
        )}
      </div>

      {(change || displayHelp) && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${
                isPositive
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : isNegative
                  ? 'text-rose-800 bg-rose-50 border-rose-200'
                  : 'text-slate-700 bg-slate-100 border-slate-200'
              }`}
            >
              <TrendIcon size={12} />
              <span>{change}</span>
            </span>
          )}
          {displayHelp && (
            <span
              className={`truncate text-xs font-medium ${
                isPositive
                  ? 'text-emerald-700'
                  : isNegative
                  ? 'text-rose-700'
                  : 'text-slate-600'
              } ${change ? 'ml-2' : ''}`}
            >
              {displayHelp}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;
