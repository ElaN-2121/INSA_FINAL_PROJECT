import { NavLink, Outlet } from 'react-router-dom';
import { Home, Upload, ClipboardList, Settings, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/Gemini_Generated_Image_pguz57pguz57pguz.png';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
  { to: '/upload', label: 'Upload Batch', icon: <Upload size={18} /> },
  { to: '/credentials', label: 'Issued Credentials', icon: <ClipboardList size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
    isActive
      ? 'bg-slate-100 text-slate-900 shadow-sm'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const userName = user?.full_name || user?.email || 'User';
  const firstName = userName.split(' ')[0];

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      <aside className="w-[280px] shrink-0 bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="EthioCred logo"
              className="h-11 w-11 rounded-2xl border border-white/10 bg-white/10 object-cover"
            />
            <div>
              <p className="text-lg font-semibold tracking-tight">EthioCred</p>
              <p className="text-xs text-slate-400">University Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-2">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              <span className="text-slate-300">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-slate-800">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-200">
              <UserCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">{firstName}</p>
              <p className="text-xs text-slate-500">{user?.role || 'Member'}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Welcome back</p>
            <h1 className="text-2xl font-semibold text-slate-900">Hello, {firstName}.</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              <UserCircle size={20} className="text-slate-500" />
              <div className="text-sm text-slate-700 font-medium truncate">
                {userName}
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
