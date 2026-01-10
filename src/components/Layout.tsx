import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { logoutUser } from '../store/slices/authSlice';
import { LogOut, X, CheckSquare, Calendar, Settings, User, Menu } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    console.log('sidebarOpen changed:', sidebarOpen);
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error('Logout failed');
    }
  };

  const toggleSidebar = () => {
    console.log('Toggling sidebar from', sidebarOpen, 'to', !sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: CheckSquare },
    { name: 'Tasks', href: '/todos', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => {
                  console.log('Background overlay clicked - current state:', sidebarOpen);
                  setSidebarOpen(false);
                  console.log('Background overlay called setSidebarOpen(false)');
                }}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2 pr-2 z-50">
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                        <span className="text-white text-lg font-medium">
                          {user?.username?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                      <div className="text-xs font-medium text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full hover:bg-gray-100"
                    title="Close sidebar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive(item.href)
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button (always visible on mobile) */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full hover:bg-gray-100 bg-white shadow-lg"
          title="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4 py-6 border-b border-gray-200">
            {!sidebarCollapsed && (
              <div className="flex items-center flex-1">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.username?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                  <div className="text-xs font-medium text-gray-500">{user?.email}</div>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full hover:bg-gray-100"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {!sidebarCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 bg-white shadow border-b border-gray-200">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden mr-4 p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full hover:bg-gray-100"
                  title="Toggle Sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2v2a2 2 0 002 2h2M9 5v6m0 0v2a2 2 0 002 2h2m-6 9V7"/>
                    </svg>
                  </div>
                  <h1 className="text-lg font-semibold text-gray-900">TaskFlow</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Welcome, {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full hover:bg-gray-100"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
