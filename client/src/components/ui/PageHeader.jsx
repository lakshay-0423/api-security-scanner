export const PageHeader = ({ title, description, action }) => {
  return (
    <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
