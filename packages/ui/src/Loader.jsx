import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 36,
  xl: 48,
};

export function Loader({
  size = 'md',
  className = '',
  label = 'Loading...',
  color = 'text-navy-900',
}) {
  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 24;

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`.trim()}
    >
      <Loader2
        size={pixelSize}
        className={`animate-spin ${color} shrink-0`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default Loader;
