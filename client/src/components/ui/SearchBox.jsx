import { Search } from 'lucide-react';

export const SearchBox = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`input-wrapper py-0.5 px-3 max-w-xs w-full ${className}`}>
      <Search className="w-4 h-4 text-slate-400 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field text-xs py-1.5"
      />
    </div>
  );
};

export default SearchBox;
