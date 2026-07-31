export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`glass-card p-6 border border-slate-800 bg-slate-900/90 rounded-2xl backdrop-blur-xl shadow-xl transition-all duration-200 ${
        hover ? 'hover:border-slate-700 hover:shadow-2xl hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-5 ${className}`}>
    <div>
      <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default Card;
