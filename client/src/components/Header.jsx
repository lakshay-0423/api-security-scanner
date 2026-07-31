import { ShieldCheck, Cpu, HardDrive } from 'lucide-react';
import Badge from './ui/Badge';
import { useAuth } from '../hooks/useAuth';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 px-6 lg:px-10 flex items-center justify-between bg-slate-900/60 backdrop-blur-md shrink-0 max-md:hidden z-20">
      <div className="flex items-center gap-3">
        <Badge variant="success" dot size="sm">
          Engine Ready
        </Badge>
        <span className="text-slate-700 font-bold">•</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          Phase 2 • Passive Security Analyzer
        </span>
        <span className="text-slate-700 font-bold">•</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
          Offline Mode
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 font-medium">Logged in as</span>
        <span className="px-2.5 py-1 rounded-md bg-slate-800 text-xs font-semibold text-white border border-slate-700">
          {user?.email || 'Authenticated User'}
        </span>
      </div>
    </header>
  );
};

export default Header;
