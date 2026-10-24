import { forwardRef } from 'react';

const cardVariants = {
  default: 'bg-white border-slate-200/80 shadow-soft',
  muted: 'bg-slate-50/70 border-slate-200/80 shadow-soft',
  certificate: 'bg-white border-slate-200/90 shadow-certificate relative overflow-hidden',
  interactive: 'bg-white border-slate-200/80 shadow-soft hover:shadow-hover hover:-translate-y-0.5 cursor-pointer transition-all duration-200',
  navy: 'bg-navy-950 text-white border-navy-800 shadow-card',
};

export const Card = forwardRef(function Card(
  { variant = 'default', className = '', children, ...props },
  ref
) {
  const variantClass = cardVariants[variant] || cardVariants.default;
  return (
    <div
      ref={ref}
      className={`rounded-2xl border ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
});

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`p-6 border-b border-slate-100 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', as: Component = 'h3', children, ...props }) {
  return (
    <Component
      className={`text-lg font-bold text-slate-900 font-display tracking-tight ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={`mt-1 text-sm text-slate-500 leading-relaxed ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-6 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={`p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-between ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export default Card;
