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
    tone = 'light', // 'light' | 'dark'
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);
  const inputId = id || props.name;
  const isDark = tone === 'dark';

  const labelClass = isDark
    ? 'text-slate-200'
    : 'text-slate-700';

  const baseInputClass = isDark
    ? `bg-slate-900 text-white placeholder:text-slate-400 [color-scheme:dark] autofill:shadow-[inset_0_0_0_1000px_#0f172a] autofill:[-webkit-text-fill-color:#ffffff] disabled:bg-slate-800 disabled:text-slate-500 ${
        hasError
          ? 'border-red-400 focus:border-red-400 focus:ring-red-400/25 text-red-100'
          : 'border-slate-700 hover:border-slate-600 focus:border-sky-400 focus:ring-sky-400/25'
      }`
    : `bg-white text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400 ${
        hasError
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-900'
          : 'border-slate-300 hover:border-slate-400 focus:border-navy-600 focus:ring-navy-600/20'
      }`;

  const toggleBtnClass = isDark
    ? 'text-slate-400 hover:text-slate-200 focus:text-sky-400'
    : 'text-slate-400 hover:text-slate-700 focus:text-navy-700';

  return (
    <div className={`space-y-1.5 ${containerClassName}`.trim()}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-xs font-semibold uppercase tracking-wider ${labelClass}`}
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
          className={`block w-full rounded-xl border py-2.5 pl-3.5 pr-11 text-sm transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed ${baseInputClass} ${className}`.trim()}
          {...props}
        />

        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          disabled={disabled}
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className={`absolute inset-y-0 right-0 flex items-center pr-3.5 focus:outline-none disabled:opacity-50 transition-colors ${toggleBtnClass}`}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {hasError && (
        <p
          id={`${inputId}-error`}
          className={`text-xs font-medium flex items-center gap-1 mt-1 ${
            isDark ? 'text-red-400' : 'text-red-600'
          }`}
        >
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p
          id={`${inputId}-desc`}
          className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

export default PasswordInput;
