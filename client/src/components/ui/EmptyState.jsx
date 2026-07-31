import Button from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">{description}</p>
      )}
      {actionLabel && (
        <div className="mt-6">
          {actionTo ? (
            <Button variant="secondary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
