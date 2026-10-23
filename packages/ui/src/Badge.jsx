const variantStyles = {
  // Color names
  green: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  red: 'bg-red-50 text-red-800 border-red-200/80',
  yellow: 'bg-amber-50 text-amber-800 border-amber-200/80',
  blue: 'bg-blue-50 text-blue-800 border-blue-200/80',
  gray: 'bg-slate-100 text-slate-700 border-slate-200/80',
  navy: 'bg-navy-50 text-navy-900 border-navy-200/80',
  teal: 'bg-teal-50 text-teal-800 border-teal-200/80',

  // Semantics
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  danger: 'bg-red-50 text-red-800 border-red-200/80',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
  info: 'bg-blue-50 text-blue-800 border-blue-200/80',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',

  // System states
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  REVOKED: 'bg-red-50 text-red-800 border-red-200/80',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200/80',
  APPROVED: 'bg-blue-50 text-blue-800 border-blue-200/80',
  DENIED: 'bg-red-50 text-red-800 border-red-200/80',
  COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
};

const dotColors = {
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  blue: 'bg-blue-500',
  gray: 'bg-slate-400',
  navy: 'bg-navy-600',
  teal: 'bg-teal-500',
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-400',
  ACTIVE: 'bg-emerald-500',
  REVOKED: 'bg-red-500',
  PENDING: 'bg-amber-500',
  APPROVED: 'bg-blue-500',
  DENIED: 'bg-red-500',
  COMPLETED: 'bg-emerald-500',
};

export function Badge({
  variant = 'gray',
  dot = false,
  pulse = false,
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const resolvedVariant = variantStyles[variant] || variantStyles.gray;
  const resolvedDot = dotColors[variant] || dotColors.gray;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border tracking-tight shadow-2xs select-none ${resolvedVariant} ${sizeClasses} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${resolvedDot}`}
            />
          )}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${resolvedDot}`} />
        </span>
      )}
      {children}
    </span>
  );
}

export const StatusPill = Badge;
export default Badge;
