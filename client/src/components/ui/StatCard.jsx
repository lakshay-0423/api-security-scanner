export const StatCard = ({ label, value, suffix, icon: Icon, color = 'text-white', iconBg = 'bg-blue-500/10 text-blue-400' }) => {
  return (
    <div className="glass-card glass-card-hover p-5 border border-slate-800 bg-slate-900/90 rounded-2xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl ${iconBg} border border-white/5 flex items-center justify-center shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-extrabold tracking-tight ${color}`}>{value}</span>
        {suffix && <span className="text-xs text-slate-400 font-medium">{suffix}</span>}
      </div>
    </div>
  );
};

export default StatCard;
