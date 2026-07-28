import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-dark)] text-[var(--color-text)]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden pt-8 pb-10 px-6 sm:px-8 lg:px-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
