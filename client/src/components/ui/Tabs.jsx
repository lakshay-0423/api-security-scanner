export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex border-b border-slate-800 bg-slate-950/40">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-3 px-4 text-center text-xs font-semibold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
              isActive
                ? 'border-blue-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
