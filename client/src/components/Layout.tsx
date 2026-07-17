import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
  }`;

export function Layout() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <span className="text-xl font-semibold text-indigo-600">Acadex</span>
            <nav className="flex items-center gap-1">
              <NavLink to="/" end className={navLinkClass}>
                Dashboard
              </NavLink>
              {(user.role === 'Admin' || user.role === 'Teacher') && (
                <NavLink to="/students" className={navLinkClass}>
                  Students
                </NavLink>
              )}
              {user.role === 'Admin' && (
                <NavLink to="/teachers" className={navLinkClass}>
                  Teachers
                </NavLink>
              )}
              <NavLink to="/classrooms" className={navLinkClass}>
                Classes
              </NavLink>
              {user.role === 'Admin' && (
                <NavLink to="/subjects" className={navLinkClass}>
                  Subjects
                </NavLink>
              )}
              <NavLink to="/timetable" className={navLinkClass}>
                Timetable
              </NavLink>
              {(user.role === 'Admin' || user.role === 'Teacher') && (
                <NavLink to="/attendance" className={navLinkClass}>
                  Attendance
                </NavLink>
              )}
              <NavLink to="/grades" className={navLinkClass}>
                Grades
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {user.firstName} {user.lastName}{' '}
              <span className="text-gray-400">({user.role})</span>
            </span>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
