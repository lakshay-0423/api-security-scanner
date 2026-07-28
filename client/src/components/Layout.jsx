import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-dark)] text-[var(--color-text)]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
