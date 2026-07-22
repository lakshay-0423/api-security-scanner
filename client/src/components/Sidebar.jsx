import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      name: 'New Scan',
      path: '/scans/new',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Scan History',
      path: '/scans/history',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <aside className="w-64 bg-[var(--color-bg-card)] border-r border-[var(--color-border)] flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-[var(--color-border)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shadow-md shadow-[var(--color-primary)]/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-white tracking-wide">API Scanner</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border-l-4 border-[var(--color-primary)] font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-input)]/50'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout Profile Panel */}
      <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-dark)]/40">
        <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-bg-input)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-primary-light)]">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User Profile'}</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-error)]/10 hover:border-[var(--color-error)]/30 transition-all duration-200 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
