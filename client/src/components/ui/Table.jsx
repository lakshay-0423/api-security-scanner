export const Table = ({ headers, children, className = '' }) => {
  return (
    <div className={`overflow-x-auto w-full border border-slate-800 rounded-xl ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900/60 border-b border-slate-800">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 ${
                  header.align === 'right' ? 'text-right' : ''
                }`}
              >
                {header.label || header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">{children}</tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, className = '', onClick }) => (
  <tr
    onClick={onClick}
    className={`hover:bg-slate-800/40 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className = '', align }) => (
  <td className={`px-5 py-3.5 text-xs text-slate-200 ${align === 'right' ? 'text-right' : ''} ${className}`}>
    {children}
  </td>
);

export default Table;
