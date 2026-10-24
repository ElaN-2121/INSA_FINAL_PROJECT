import React from 'react';
import { Skeleton } from './Skeleton.jsx';
import EmptyState from './EmptyState.jsx';
import { AlertCircle, PieChart } from 'lucide-react';

export function Donut({
  data = [],
  size = 140,
  strokeWidth = 16,
  centerLabel = 'Total',
  centerValue,
  showLegend = true,
  isLoading = false,
  error = null,
  emptyTitle = 'No data',
  emptyMessage = 'No data available to display.',
  ariaLabel = 'Donut chart distribution',
  className = '',
}) {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-6 ${className}`.trim()} aria-busy="true">
        <Skeleton className="h-32 w-32 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-28" rounded="rounded-md" />
          <Skeleton className="h-4 w-20" rounded="rounded-md" />
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

  const validItems = data.filter((d) => (Number(d.value) || 0) > 0);
  const total = validItems.reduce((acc, d) => acc + Number(d.value), 0);

  if (total === 0 || validItems.length === 0) {
    return (
      <EmptyState
        icon={PieChart}
        title={emptyTitle}
        description={emptyMessage}
        className="py-6"
      />
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const segments = validItems.map((item) => {
    const val = Number(item.value);
    const strokeDasharray = (val / total) * circumference;
    const strokeDashoffset = -cumulativeOffset;
    cumulativeOffset += strokeDasharray;

    return {
      ...item,
      strokeDasharray: `${strokeDasharray} ${circumference}`,
      strokeDashoffset,
      pct: ((val / total) * 100).toFixed(0),
    };
  });

  const displayCenterValue = centerValue !== undefined ? centerValue : total.toLocaleString();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center gap-6 ${className}`.trim()}
      role="group"
      aria-label={ariaLabel}
    >
      {/* SVG Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 transform"
          role="img"
          aria-label={ariaLabel}
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {segments.map((seg, i) => (
            <circle
              key={seg.label || i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          ))}
        </svg>

        {/* Center label & value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className="font-mono text-base font-bold text-navy-950 leading-tight">
            {displayCenterValue}
          </span>
          {centerLabel && (
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              {centerLabel}
            </span>
          )}
        </div>
      </div>

      {/* Legend list */}
      {showLegend && (
        <div className="flex-1 space-y-2 w-full">
          {segments.map((seg, i) => (
            <div key={seg.label || i} className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 truncate pr-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                  aria-hidden="true"
                />
                <span className="truncate text-slate-700 font-medium">{seg.label}</span>
              </div>
              <div className="font-mono text-xs text-slate-900 shrink-0 font-semibold">
                {seg.value.toLocaleString()} <span className="text-slate-400 font-normal">({seg.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Donut;
