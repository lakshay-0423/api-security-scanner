export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variants = {
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    primary: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    critical: 'bg-red-950/80 text-red-400 border-red-800/50',
    high: 'bg-orange-950/80 text-orange-400 border-orange-800/50',
    medium: 'bg-amber-950/80 text-amber-400 border-amber-800/50',
    low: 'bg-blue-950/80 text-blue-400 border-blue-800/50',
    info: 'bg-slate-900/80 text-slate-400 border-slate-700/50',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold font-mono rounded-md border ${
        variants[variant] || variants.neutral
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-emerald-400'
              : variant === 'danger' || variant === 'critical'
              ? 'bg-red-400'
              : variant === 'warning' || variant === 'high' || variant === 'medium'
              ? 'bg-amber-400'
              : 'bg-blue-400'
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
