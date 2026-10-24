import React from 'react';

export function Sparkline({
  data = [],
  width = 84,
  height = 24,
  color = '#1C4276', // navy-700
  fill = true,
  ariaLabel,
  className = '',
}) {
  const points = (data || []).map((d) => (typeof d === 'object' && d !== null ? d.value ?? 0 : Number(d) || 0));

  if (!points || points.length < 2) {
    return (
      <div
        className={`inline-flex items-center justify-center text-slate-300 font-mono text-xs ${className}`}
        style={{ width, height }}
        aria-hidden="true"
      >
        —
      </div>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const padding = 2;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const coords = points.map((val, idx) => {
    const x = padding + (idx / (points.length - 1)) * usableWidth;
    const y = height - padding - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  const pathD = coords.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`),
    ''
  );

  const fillD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${height} L ${coords[0].x.toFixed(1)} ${height} Z`;

  const lastPoint = coords[coords.length - 1];
  const firstVal = points[0];
  const lastVal = points[points.length - 1];
  const trendDescription =
    lastVal > firstVal ? `Trending upward from ${firstVal} to ${lastVal}` : lastVal < firstVal ? `Trending downward from ${firstVal} to ${lastVal}` : `Flatline trend at ${lastVal}`;

  const label = ariaLabel || `Sparkline trend: ${trendDescription}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible inline-block shrink-0 ${className}`}
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <desc>{trendDescription}</desc>
      <defs>
        <linearGradient id={`sparkline-grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {fill && (
        <path
          d={fillD}
          fill={`url(#sparkline-grad-${color.replace(/[^a-zA-Z0-9]/g, '')})`}
        />
      )}

      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Endpoint dot */}
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="2.5"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1"
      />
    </svg>
  );
}

export default Sparkline;
