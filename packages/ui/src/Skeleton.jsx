export function Skeleton({ className = '', rounded = 'rounded-xl', ...props }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/70 ${rounded} ${className}`.trim()}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`.trim()}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-4/5' : 'w-full'}`}
          rounded="rounded-md"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft space-y-4 ${className}`.trim()}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0" rounded="rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-1/3" rounded="rounded-md" />
          <Skeleton className="h-3 w-1/4" rounded="rounded-md" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 4 }) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-6 py-4 animate-pulse">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={`h-4 ${c === 0 ? 'w-1/4' : 'flex-1'}`}
              rounded="rounded-md"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
