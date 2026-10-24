import React from 'react';
import { Skeleton } from './Skeleton.jsx';
import EmptyState from './EmptyState.jsx';
import { AlertCircle } from 'lucide-react';

export function StackedBar({
  segments = [],
  total,
  showLegend = true,
  height = 12,
  isLoading = false,
  error = null,
  emptyMessage = 'No pipeline breakdown data available.',
  ariaLabel = 'Breakdown bar chart',
  className = '',
}) {
  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`.trim()} aria-busy="true">
        <Skeleton className={`w-full h-[${height}px]`} rounded="rounded-full" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" rounded="rounded-md" />
          <Skeleton className="h-4 w-24" rounded="rounded-md" />
          <Skeleton className="h-4 w-24" rounded="rounded-md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-3"
      >
        <AlertCircle size={18} className="shrink-0 text-red-600" />
        <span>{error}</span>
      </div>
    );
  }

  const computedTotal =
    typeof total === 'number' && total > 0
      ? total
      : segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0);

  if (computedTotal === 0 || segments.length === 0) {
    return (
      <p className="text-xs text-slate-500 py-2 italic font-sans">{emptyMessage}</p>
    );
  }

  return (
    <div className={`space-y-3 ${className}`.trim()} role="group" aria-label={ariaLabel}>
      {/* Stacked Bar Container */}
      <div
        className="w-full flex overflow-hidden rounded-full bg-slate-100 p-0.5 shadow-inner"
        style={{ height: `${height + 4}px` }}
      >
        {segments.map((seg, i) => {
          const val = Number(seg.value) || 0;
          if (val <= 0) return null;
          const pct = ((val / computedTotal) * 100).toFixed(1);
          return (
            <div
              key={seg.label || i}
              style={{ width: `${pct}%`, backgroundColor: seg.color }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 relative group"
              role="progressbar"
              aria-valuenow={val}
              aria-valuemin={0}
              aria-valuemax={computedTotal}
              aria-label={`${seg.label}: ${val} (${pct}%)`}
              title={`${seg.label}: ${val} (${pct}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          {segments.map((seg, i) => {
            const val = Number(seg.value) || 0;
            const pct = computedTotal > 0 ? ((val / computedTotal) * 100).toFixed(0) : 0;
            return (
              <div key={seg.label || i} className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                  aria-hidden="true"
                />
                <span className="text-slate-600 font-medium">{seg.label}:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {val.toLocaleString()} <span className="text-slate-400 font-normal">({pct}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StackedBar;
