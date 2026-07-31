export const LoadingSkeleton = ({ className = '' }) => {
  return <div className={`bg-slate-800/60 animate-pulse rounded-lg ${className}`} />;
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="w-full space-y-3">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 p-4 glass-card border-slate-800/50">
        {Array.from({ length: cols }).map((_, c) => (
          <LoadingSkeleton key={c} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const StatCardsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="glass-card p-5 border-slate-800 space-y-3">
        <LoadingSkeleton className="h-3 w-20" />
        <LoadingSkeleton className="h-7 w-12" />
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
