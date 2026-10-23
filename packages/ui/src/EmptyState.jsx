export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center shadow-soft flex flex-col items-center justify-center max-w-lg mx-auto ${className}`.trim()}
    >
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-800 border border-navy-100 shadow-soft mb-4">
          <Icon size={26} className="text-navy-900" />
        </div>
      )}

      {title && (
        <h3 className="text-base font-bold text-navy-950 font-display tracking-tight">
          {title}
        </h3>
      )}

      {description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
