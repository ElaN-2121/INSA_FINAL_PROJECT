import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const alertStyles = {
  success: {
    container: 'bg-emerald-50 border-emerald-200/90 text-emerald-900',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200/90 text-amber-900',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  danger: {
    container: 'bg-red-50 border-red-200/90 text-red-900',
    icon: AlertCircle,
    iconColor: 'text-red-600',
  },
  error: {
    container: 'bg-red-50 border-red-200/90 text-red-900',
    icon: AlertCircle,
    iconColor: 'text-red-600',
  },
  info: {
    container: 'bg-blue-50 border-blue-200/90 text-blue-900',
    icon: Info,
    iconColor: 'text-blue-600',
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) {
  const style = alertStyles[variant] || alertStyles.info;
  const IconComponent = style.icon;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3.5 rounded-2xl border p-4 text-sm shadow-soft ${style.container} ${className}`.trim()}
    >
      <IconComponent className={`shrink-0 mt-0.5 ${style.iconColor}`} size={18} />

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold tracking-tight font-display text-slate-900 mb-0.5">
            {title}
          </h4>
        )}
        <div className="text-slate-700 leading-relaxed text-xs sm:text-sm">
          {children}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors focus-ring"
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export const Toast = Alert;
export default Alert;
