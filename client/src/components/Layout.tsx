import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  Award,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './ui/Avatar';
import type { UserRole } from '../types';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
}

const isMockMode = import.meta.env.VITE_USE_MOCKS === 'true';

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users, roles: ['Admin', 'Teacher'] },
  { to: '/teachers', label: 'Teachers', icon: GraduationCap, roles: ['Admin'] },
  { to: '/classrooms', label: 'Classes', icon: School },
  { to: '/subjects', label: 'Subjects', icon: BookOpen, roles: ['Admin'] },
  { to: '/timetable', label: 'Timetable', icon: CalendarClock },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['Admin', 'Teacher'] },
  { to: '/grades', label: 'Grades', icon: Award },
];

function SidebarContent({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 px-5 h-16 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm transition-transform duration-300 hover:rotate-[12deg] hover:scale-110">
          A
        </div>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">Acadex</span>
      </div>
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role)).map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            style={{ animationDelay: `${i * 35}ms` }}
            className={({ isActive }) =>
              `animate-fade-in-up group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:pl-3.5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="w-4.5 h-4.5 transition-transform duration-150 group-hover:scale-110" size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      {isMockMode && (
        <div className="mx-3 mb-3 mt-2 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium dark:bg-amber-500/10 dark:text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          Demo mode &middot; mock data
        </div>
      )}
    </>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111016] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#15141a] fixed inset-y-0">
        <SidebarContent role={user.role} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="animate-fade-in absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="animate-slide-in-left absolute inset-y-0 left-0 w-64 bg-white dark:bg-[#15141a] flex flex-col shadow-xl">
            <div className="flex justify-end px-3 pt-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-transform duration-150 hover:rotate-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent role={user.role} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <header className="h-16 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#15141a] flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="lg:hidden font-semibold text-gray-900 dark:text-white">Acadex</span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-transform duration-300 hover:-rotate-12 active:scale-90"
              aria-label="Toggle dark mode"
            >
              <span className="block animate-pop-in" key={theme}>
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5" size={18} /> : <Moon className="w-4.5 h-4.5" size={18} />}
              </span>
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
                <span className="hidden sm:block text-sm text-left">
                  <span className="block font-medium text-gray-700 dark:text-gray-200 leading-tight">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="block text-xs text-gray-400 leading-tight">{user.role}</span>
                </span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="animate-scale-in origin-top-right absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a20] border border-gray-200 dark:border-white/10 rounded-lg shadow-lg z-50 py-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-7xl w-full mx-auto">
          <div key={location.pathname} className="animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
