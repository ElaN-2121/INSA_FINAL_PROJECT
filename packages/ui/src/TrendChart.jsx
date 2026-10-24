import React, { useState } from 'react';
import { Skeleton } from './Skeleton.jsx';
import EmptyState from './EmptyState.jsx';
import { AlertCircle, TrendingUp } from 'lucide-react';

export function TrendChart({
  data = [],
  height = 220,
  primaryColor = '#16345E', // navy-800
  secondaryColor = '#16A34A', // ethio-green
  primaryLabel = 'Total Verifications',
  secondaryLabel = 'Valid / Successful',
  showSecondary = false,
  isLoading = false,
  error = null,
  emptyTitle = 'No trend data available',
  emptyMessage = 'There are no verification events recorded for this selection.',
  ariaLabel = 'Monthly verification trend chart',
  className = '',
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (isLoading) {
    return (
      <div className={`p-4 rounded-xl border border-slate-200/80 bg-white ${className}`.trim()} aria-busy="true">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-4 w-36" rounded="rounded-md" />
          <Skeleton className="h-4 w-24" rounded="rounded-md" />
        </div>
        <Skeleton className="w-full" style={{ height: height - 60 }} rounded="rounded-xl" />
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
        icon={TrendingUp}
        title={emptyTitle}
        description={emptyMessage}
        className="py-10"
      />
    );
  }

  // Calculate scales
  const primaryValues = data.map((d) => Number(d.value ?? d.total_verifications ?? 0));
  const secondaryValues = showSecondary
    ? data.map((d) => Number(d.secondaryValue ?? d.successful_verifications ?? 0))
    : [];

  const allValues = [...primaryValues, ...secondaryValues];
  const maxVal = Math.max(...allValues, 5);
  // Round upper bound to a clean number
  const yMax = Math.ceil(maxVal / 5) * 5;

  // Layout parameters
  const svgWidth = 600;
  const paddingLeft = 40;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 34;

  const usableWidth = svgWidth - paddingLeft - paddingRight;
  const usableHeight = height - paddingTop - paddingBottom;

  const getX = (index) =>
    paddingLeft + (data.length > 1 ? (index / (data.length - 1)) * usableWidth : usableWidth / 2);

  const getY = (val) =>
    paddingTop + usableHeight - (Math.max(val, 0) / yMax) * usableHeight;

  // Build path strings
  const primaryCoords = primaryValues.map((v, i) => ({ x: getX(i), y: getY(v), val: v }));
  const primaryPath = primaryCoords.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );
  const primaryArea = primaryCoords.length > 0
    ? `${primaryPath} L ${primaryCoords[primaryCoords.length - 1].x} ${getY(0)} L ${primaryCoords[0].x} ${getY(0)} Z`
    : '';

  const secondaryCoords = showSecondary
    ? secondaryValues.map((v, i) => ({ x: getX(i), y: getY(v), val: v }))
    : [];
  const secondaryPath = secondaryCoords.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  // Y axis ticks (4 ticks)
  const yTicks = [0, Math.round(yMax * 0.33), Math.round(yMax * 0.66), yMax];

  const firstMonth = data[0]?.label || data[0]?.period_label || '';
  const lastMonth = data[data.length - 1]?.label || data[data.length - 1]?.period_label || '';
  const summaryDesc = `Chart showing verification trend from ${firstMonth} to ${lastMonth}. Starting at ${primaryValues[0]} and ending at ${primaryValues[primaryValues.length - 1]}.`;

  const activePoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null;

  return (
    <div className={`relative ${className}`.trim()}>
      {/* Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: primaryColor }}
              aria-hidden="true"
            />
            <span>{primaryLabel}</span>
          </div>
          {showSecondary && (
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: secondaryColor }}
                aria-hidden="true"
              />
              <span>{secondaryLabel}</span>
            </div>
          )}
        </div>

        {activePoint && (
          <div className="font-mono text-xs text-navy-950 font-semibold bg-navy-50 px-2 py-0.5 rounded border border-navy-100">
            {activePoint.label || activePoint.period_label}: {primaryValues[hoverIndex]} total
            {showSecondary && ` (${secondaryValues[hoverIndex]} valid)`}
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${height}`}
          className="w-full overflow-visible font-sans select-none"
          role="region"
          aria-label={ariaLabel}
        >
          <desc>{summaryDesc}</desc>

          <defs>
            <linearGradient id="trend-primary-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y axis ticks */}
          {yTicks.map((tick) => {
            const yPos = getY(tick);
            return (
              <g key={tick} className="text-slate-300">
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={svgWidth - paddingRight}
                  y2={yPos}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={yPos + 3}
                  textAnchor="end"
                  className="fill-slate-400 font-mono text-[10px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {primaryArea && (
            <path d={primaryArea} fill="url(#trend-primary-grad)" />
          )}

          {/* Primary Line */}
          {primaryPath && (
            <path
              d={primaryPath}
              fill="none"
              stroke={primaryColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Secondary Line */}
          {showSecondary && secondaryPath && (
            <path
              d={secondaryPath}
              fill="none"
              stroke={secondaryColor}
              strokeWidth="2"
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points and Hover Targets */}
          {data.map((item, i) => {
            const x = getX(i);
            const y = getY(primaryValues[i]);
            const isHovered = hoverIndex === i;
            const labelText = item.label || item.period_label || '';

            return (
              <g key={i} className="group">
                {/* Vertical guide on hover */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={getY(0)}
                    stroke="#94A3B8"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? '#ffffff' : primaryColor}
                  stroke={primaryColor}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-150"
                />

                {/* Secondary circle if enabled */}
                {showSecondary && (
                  <circle
                    cx={x}
                    cy={getY(secondaryValues[i])}
                    r={isHovered ? 4.5 : 3}
                    fill={isHovered ? '#ffffff' : secondaryColor}
                    stroke={secondaryColor}
                    strokeWidth={1.5}
                  />
                )}

                {/* X axis labels */}
                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[11px] font-sans font-medium transition-colors ${
                    isHovered ? 'fill-navy-950 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {labelText}
                </text>

                {/* Wide invisible hit area for mouse/touch */}
                <rect
                  x={x - usableWidth / (data.length * 2)}
                  y={paddingTop}
                  width={usableWidth / data.length}
                  height={usableHeight + 15}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => setHoverIndex(i)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${labelText}: ${primaryValues[i]} total verifications`}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default TrendChart;
