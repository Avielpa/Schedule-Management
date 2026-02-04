import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getStoredUser();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/events', label: 'Events', icon: '📅' },
    { path: '/soldiers', label: 'Soldiers', icon: '👥' },
    { path: '/scheduling-runs', label: 'Scheduling Runs', icon: '🗓️' },
    { path: '/calendar', label: 'Calendar View', icon: '📆' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎖️</div>
              <div>
                <h1 className="text-2xl font-bold">Military Scheduler</h1>
                <p className="text-sm text-primary-100">Soldier Scheduling System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">{user?.username || 'User'}</span>
              <button
                onClick={handleLogout}
                className="bg-primary-700 hover:bg-primary-800 px-3 py-1 rounded text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
