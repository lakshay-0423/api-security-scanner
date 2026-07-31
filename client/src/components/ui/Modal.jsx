import { X } from 'lucide-react';
import Button from './Button';

export const Modal = ({ isOpen, onClose, title, description, children, footer, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`glass-card w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 relative ${className}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            {description && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-1">{children}</div>

        {footer && <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
