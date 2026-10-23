import { Check, X, AlertTriangle, Loader2 } from 'lucide-react';

export function Stepper({
  steps = [],
  orientation = 'horizontal',
  className = '',
}) {
  if (orientation === 'vertical') {
    return (
      <div className={`space-y-6 ${className}`.trim()}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const status = step.status || 'upcoming';

          return (
            <div key={step.id || index} className="relative flex gap-4">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={`absolute left-[17px] top-[34px] bottom-[-24px] w-0.5 ${
                    status === 'complete' ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Status Circle */}
              <div className="relative shrink-0 flex items-center justify-center">
                {status === 'complete' && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-soft ring-4 ring-emerald-50">
                    <Check size={16} strokeWidth={2.5} />
                  </div>
                )}
                {status === 'current' && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-white shadow-soft ring-4 ring-navy-100 animate-pulse">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                )}
                {status === 'failed' && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-soft ring-4 ring-red-100">
                    <X size={16} strokeWidth={2.5} />
                  </div>
                )}
                {status === 'warning' && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow-soft ring-4 ring-amber-100">
                    <AlertTriangle size={16} strokeWidth={2.5} />
                  </div>
                )}
                {status === 'upcoming' && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-xs font-bold text-slate-400">
                    {index + 1}
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pt-1 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-sm font-bold tracking-tight font-display ${
                      status === 'failed'
                        ? 'text-red-700'
                        : status === 'complete'
                        ? 'text-slate-900'
                        : status === 'current'
                        ? 'text-navy-950'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {step.meta && (
                    <span className="text-xs font-medium text-slate-400">
                      {step.meta}
                    </span>
                  )}
                </div>

                {step.description && (
                  <p
                    className={`mt-0.5 text-xs leading-relaxed ${
                      status === 'failed'
                        ? 'text-red-600 font-medium'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.description}
                  </p>
                )}

                {step.error && (
                  <div className="mt-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                    <strong>Error:</strong> {step.error}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal Stepper
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center justify-between gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const status = step.status || 'upcoming';

          return (
            <li
              key={step.id || index}
              className={`relative flex-1 ${!isLast ? 'pr-4 sm:pr-8' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    status === 'complete'
                      ? 'bg-emerald-600 text-white shadow-soft'
                      : status === 'current'
                      ? 'bg-navy-900 text-white shadow-soft ring-4 ring-navy-100'
                      : status === 'failed'
                      ? 'bg-red-600 text-white'
                      : 'border-2 border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {status === 'complete' ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : status === 'failed' ? (
                    <X size={14} strokeWidth={2.5} />
                  ) : (
                    index + 1
                  )}
                </div>

                <div className="min-w-0 flex-1 hidden md:block">
                  <p
                    className={`truncate text-xs font-bold font-display ${
                      status === 'current' || status === 'complete'
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="truncate text-[11px] text-slate-400">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {!isLast && (
                <div
                  className={`absolute top-4 right-0 left-[calc(2rem+0.75rem)] hidden h-0.5 -translate-y-1/2 sm:block ${
                    status === 'complete' ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export const Timeline = (props) => <Stepper orientation="vertical" {...props} />;
export default Stepper;
