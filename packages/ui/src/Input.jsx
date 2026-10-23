import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    id,
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    required = false,
    disabled = false,
    className = '',
    containerClassName = '',
    type = 'text',
    ...props
  },
  ref
) {
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
        {LeftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <LeftIcon size={18} />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
          className={`block w-full rounded-xl border bg-white py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
            LeftIcon ? 'pl-10' : 'pl-3.5'
          } ${RightIcon ? 'pr-10' : 'pr-3.5'} ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-900'
              : 'border-slate-300 hover:border-slate-400 focus:border-navy-600 focus:ring-navy-600/20'
          } ${className}`.trim()}
          {...props}
        />

        {RightIcon && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <RightIcon size={18} />
          </div>
        )}
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

export default Input;
