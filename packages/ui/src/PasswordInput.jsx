import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordInput = forwardRef(function PasswordInput(
  {
    id,
    label,
    error,
    helperText,
    required = false,
    disabled = false,
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);
  const inputId = id || props.name;

  return (
    <div className={`space-y-1.5 ${containerClassName}`.trim()}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-2xs">
        <input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
          className={`block w-full rounded-xl border bg-white py-2.5 pl-3.5 pr-11 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-900'
              : 'border-slate-300 hover:border-slate-400 focus:border-navy-600 focus:ring-navy-600/20'
          } ${className}`.trim()}
          {...props}
        />

        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          disabled={disabled}
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 focus:outline-none disabled:opacity-50 transition-colors"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {hasError && (
        <p id={`${inputId}-error`} className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p id={`${inputId}-desc`} className="text-xs text-slate-500 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default PasswordInput;
