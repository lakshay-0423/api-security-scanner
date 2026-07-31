import { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, title = 'Success') => addToast(msg, 'success', title), [addToast]);
  const error = useCallback((msg, title = 'Error') => addToast(msg, 'error', title), [addToast]);
  const warning = useCallback((msg, title = 'Warning') => addToast(msg, 'warning', title), [addToast]);
  const info = useCallback((msg, title = 'Notice') => addToast(msg, 'info', title), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100',
    error: 'border-red-500/30 bg-red-950/90 text-red-100',
    warning: 'border-amber-500/30 bg-amber-950/90 text-amber-100',
    info: 'border-blue-500/30 bg-slate-900/95 text-slate-100',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-fade-in ${
        borders[toast.type] || borders.info
      }`}
    >
      {icons[toast.type] || icons.info}
      <div className="flex-1 min-w-0">
        {toast.title && <h4 className="text-xs font-bold tracking-wide">{toast.title}</h4>}
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed truncate">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-white p-0.5 rounded transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ToastProvider;
