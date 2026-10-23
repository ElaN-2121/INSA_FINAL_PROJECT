import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  FileCheck2,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import mark from '../assets/mark.png';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/upload', label: 'Upload Batch', Icon: Upload },
  { to: '/credentials', label: 'Issued Credentials', Icon: FileCheck2 },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus-ring ${
    isActive
      ? 'bg-navy-900 text-white shadow-soft'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

function getInitials(name) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = user?.full_name || user?.email || 'Registrar';
  const firstName = userName.split(' ')[0];
  const initials = getInitials(userName);

  const sidebarContent = (
    <>
      <div className="px-5 py-6 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <img
            src={mark}
            alt="EthioCred"
            className="h-10 w-10 rounded-xl object-contain p-0.5 bg-navy-50/50 border border-slate-200/80 shadow-soft"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-navy-950 tracking-tight font-display">EthioCred</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Registrar
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">University Authority</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navLinks.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-400'}`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center gap-3 rounded-xl bg-white border border-slate-200/80 p-3 shadow-soft">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white shadow-soft">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{firstName}</p>
            <p className="truncate text-xs text-slate-500">University Registrar</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-soft transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end px-4 pt-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-ring"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>
        {sidebarContent}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-slate-200/80 bg-white/95 backdrop-blur px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between shadow-soft">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-ring lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Institutional Portal</p>
              <h1 className="text-lg font-bold text-navy-950 font-display sm:text-xl">
                Registrar Operations
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-1.5 shadow-soft">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-navy-900 text-xs font-bold text-white">
                {initials}
              </div>
              <div className="truncate text-xs font-medium text-slate-700 max-w-[160px]">{userName}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-ring shadow-soft"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
