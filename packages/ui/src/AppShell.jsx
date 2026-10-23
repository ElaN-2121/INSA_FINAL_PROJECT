import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  LogOut,
  ChevronDown,
  Shield,
} from 'lucide-react';

function getInitials(name) {
  if (!name) return 'U';
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

export function AppShell({
  portalName = 'EthioCred',
  portalTagline = 'Digital Academic Credentials',
  portalBadge = 'Portal',
  portalAccent = 'emerald', // 'emerald', 'amber', 'teal', 'slate'
  navLinks = [],
  user,
  onLogout,
  notificationCount = 0,
  onNotificationClick,
  logoSrc,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userName = user?.full_name || user?.company_name || user?.name || user?.email || 'User';
  const firstName = userName.split(' ')[0];
  const initials = getInitials(userName);

  const accentStyles = {
    emerald: {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      activeIcon: 'text-emerald-400',
      activeBorder: 'border-emerald-500',
    },
    amber: {
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      activeIcon: 'text-amber-400',
      activeBorder: 'border-amber-500',
    },
    teal: {
      badge: 'bg-teal-50 text-teal-800 border-teal-200',
      activeIcon: 'text-teal-400',
      activeBorder: 'border-teal-500',
    },
    slate: {
      badge: 'bg-slate-900 text-slate-100 border-slate-700',
      activeIcon: 'text-sky-400',
      activeBorder: 'border-sky-500',
    },
  };

  const accent = accentStyles[portalAccent] || accentStyles.emerald;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 focus-ring ${
      isActive
        ? 'bg-navy-900 text-white shadow-soft'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const sidebarContent = (
    <>
      {/* Brand Header */}
      <div className="px-5 py-6 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="EthioCred"
              className="h-10 w-10 rounded-xl object-contain p-0.5 bg-navy-50/50 border border-slate-200/80 shadow-soft"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-soft">
              <Shield size={20} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base font-bold text-navy-950 tracking-tight font-display">
                EthioCred
              </span>
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${accent.badge}`}
              >
                {portalBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate font-medium">{portalTagline}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navLinks.map(({ to, label, Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            {({ isActive }) => (
              <>
                {Icon && (
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive ? accent.activeIcon : 'text-slate-400'
                    }`}
                  />
                )}
                <span className="flex-1 truncate">{label}</span>
                {badge && (
                  <span
                    className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="px-4 py-4 border-t border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center gap-3 rounded-xl bg-white border border-slate-200/80 p-3 shadow-soft">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white shadow-soft">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{firstName}</p>
            <p className="truncate text-xs text-slate-500">{portalName}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-soft transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end px-4 pt-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-ring"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur px-4 py-3 sm:px-6 lg:px-8 shadow-soft">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-ring lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {portalName}
              </p>
              <h2 className="text-base sm:text-lg font-bold text-navy-950 font-display">
                National Credential Platform
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={onNotificationClick}
              className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-ring shadow-soft"
              aria-label="View notifications"
            >
              <Bell size={18} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow-soft animate-pulse">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 focus-ring shadow-soft"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-navy-900 text-xs font-bold text-white">
                  {initials}
                </div>
                <span className="hidden sm:inline-block max-w-[140px] truncate text-xs font-semibold text-slate-700">
                  {userName}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-card z-40 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout?.();
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors focus-ring"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Slot */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
