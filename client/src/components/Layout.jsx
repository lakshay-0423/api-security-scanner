import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-dark)] text-[var(--color-text)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Enterprise Top Header Bar */}
        <header className="h-16 border-b border-[var(--color-border)] px-6 lg:px-10 flex items-center justify-between bg-[var(--color-bg-card)]/40 shrink-0 max-md:hidden">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine Ready
            </span>
            <span className="text-xs text-[var(--color-text-muted)] font-mono">
              Phase 2 • Passive Security Analyzer
            </span>
          </div>
          <div className="text-xs text-[var(--color-text-muted)] font-medium">
            Offline Static Analysis Mode
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
