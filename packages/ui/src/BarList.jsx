import React from 'react';
import { Skeleton } from './Skeleton.jsx';
import EmptyState from './EmptyState.jsx';
import { AlertCircle, BarChart2 } from 'lucide-react';

export function BarList({
  data = [],
  maxValue,
  showValues = true,
  barColor = 'bg-navy-700',
  isLoading = false,
  error = null,
  emptyTitle = 'No data to display',
  emptyMessage = 'No departmental records found for this period.',
  ariaLabel = 'Ranked list of departments',
  className = '',
  onItemClick,
}) {
  if (isLoading) {
    return (
      <div className={`space-y-3.5 ${className}`.trim()} aria-busy="true" aria-label="Loading bar chart">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" rounded="rounded-md" />
              <Skeleton className="h-4 w-12" rounded="rounded-md" />
            </div>
            <Skeleton className="h-2.5 w-full" rounded="rounded-full" />
          </div>
        ))}
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

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title={emptyTitle}
        description={emptyMessage}
        className="py-6"
      />
    );
  }

  const computedMax =
    typeof maxValue === 'number' && maxValue > 0
      ? maxValue
      : Math.max(...data.map((d) => (typeof d.value === 'number' ? d.value : 0)), 1);

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={`space-y-3.5 ${className}`.trim()}
    >
      {data.map((item, index) => {
        const val = typeof item.value === 'number' ? item.value : 0;
        const percentage = Math.min(Math.max(Math.round((val / computedMax) * 100), 2), 100);
        const displayVal = item.valueDisplay !== undefined ? item.valueDisplay : val.toLocaleString();
        const activeColor = item.color || barColor;

        return (
          <div
            key={item.label || index}
            role="listitem"
            className={`group rounded-lg p-1.5 transition-colors ${
              onItemClick ? 'cursor-pointer hover:bg-slate-50' : ''
            }`}
            onClick={() => onItemClick && onItemClick(item)}
          >
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-1.5">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="w-5 text-center text-xs font-semibold text-slate-400 group-hover:text-navy-700">
                  {index + 1}.
                </span>
                <span className="truncate text-slate-800 font-medium font-sans">
                  {item.label}
                </span>
                {item.sublabel && (
                  <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                    ({item.sublabel})
                  </span>
                )}
              </div>
              {showValues && (
                <span className="font-mono font-semibold text-navy-950 shrink-0 text-xs sm:text-sm">
                  {displayVal}
                </span>
              )}
            </div>

            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${activeColor}`}
                style={{ width: `${percentage}%` }}
                role="progressbar"
                aria-valuenow={val}
                aria-valuemin={0}
                aria-valuemax={computedMax}
                aria-label={`${item.label}: ${displayVal}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BarList;
