export const Input = ({ label, error, icon: Icon, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</label>}
      <div className="input-wrapper py-0.5">
        {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
        <input className={`input-field ${className}`} {...props} />
      </div>
      {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;
