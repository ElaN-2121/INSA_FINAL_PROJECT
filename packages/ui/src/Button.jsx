import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 border border-navy-900/10 shadow-soft focus-visible:ring-navy-600',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 shadow-soft focus-visible:ring-slate-400',
  outline:
    'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 border border-slate-300 shadow-soft focus-visible:ring-slate-400',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-slate-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-red-700/20 shadow-soft focus-visible:ring-red-500',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-700/20 shadow-soft focus-visible:ring-emerald-500',
  accent:
    'bg-portal-accent text-white hover:opacity-90 active:opacity-95 shadow-soft focus-visible:ring-portal-accent',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs font-medium gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm font-semibold gap-2 rounded-xl',
  lg: 'px-5 py-2.5 text-base font-semibold gap-2.5 rounded-xl',
};

export const Button = forwardRef(function Button(
  {
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    isLoading = false,
    loadingText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    onClick,
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;
  const baseClasses =
    'inline-flex items-center justify-center font-sans tracking-tight transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          {loadingText ? <span>{loadingText}</span> : children}
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon className="shrink-0" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
          {children}
          {RightIcon && <RightIcon className="shrink-0" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
        </>
      )}
    </button>
  );
});

export default Button;
