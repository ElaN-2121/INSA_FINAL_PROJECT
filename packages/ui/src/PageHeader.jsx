import { ArrowLeft } from 'lucide-react';

export function PageHeader({
  title,
  description,
  badge,
  actions,
  onBack,
  backLabel = 'Back',
  className = '',
}) {
  return (
    <div className={`mb-6 sm:mb-8 space-y-4 ${className}`.trim()}>
      {onBack && (
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-navy-900 transition-colors focus-ring rounded-lg px-1 py-0.5"
          >
            <ArrowLeft size={14} />
            <span>{backLabel}</span>
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-950 font-display">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
