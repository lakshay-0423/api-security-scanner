import Sidebar from './Sidebar';
import Header from './Header';

export const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
