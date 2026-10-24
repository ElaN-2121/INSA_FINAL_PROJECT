import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(function Select(
  {
    id,
    label,
    error,
    helperText,
    required = false,
    disabled = false,
    options = [],
    className = '',
    containerClassName = '',
    children,
    ...props
  },
  ref
) {
  const hasError = Boolean(error);
  const selectId = id || props.name;

  return (
    <div className={`space-y-1.5 ${containerClassName}`.trim()}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-2xs">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${selectId}-error` : helperText ? `${selectId}-desc` : undefined}
          className={`block w-full appearance-none rounded-xl border bg-white py-2.5 pl-3.5 pr-10 text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-300 hover:border-slate-400 focus:border-navy-600 focus:ring-navy-600/20'
          } ${className}`.trim()}
          {...props}
        >
          {children ||
            options.map((opt) => (
              <option key={opt.value ?? opt} value={opt.value ?? opt}>
                {opt.label ?? opt}
              </option>
            ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
          <ChevronDown size={18} />
        </div>
      </div>

      {hasError && (
        <p id={`${selectId}-error`} className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p id={`${selectId}-desc`} className="text-xs text-slate-500 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Select;
