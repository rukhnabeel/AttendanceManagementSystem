import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCheck, ShieldCheck, Monitor, LogOut } from 'lucide-react';

const Navbar = ({ toggleDarkMode }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="w-full border-b border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm sticky top-0 z-40 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md group-hover:bg-blue-700 transition-colors">
                        <Monitor className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-xl font-bold tracking-tight block leading-none">Attendly</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Enterprise</span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex gap-2">
                    <Link
                        to="/"
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/')
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <UserCheck className="h-4 w-4" />
                        Portal
                    </Link>
                    <Link
                        to="/admin"
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/admin')
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Console
                    </Link>
                </div>

                {/* Status & Add-ons */}
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-900/30">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">System Online</span>
                    </div>

                    {location.pathname !== '/login' && (
                        <button
                            onClick={() => {
                                localStorage.removeItem('staffToken');
                                localStorage.removeItem('staffUser');
                                localStorage.removeItem('isAdminAuthenticated');
                                window.location.href = '/login';
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Logout</span>
                        </button>
                    )}

                    <button
                        onClick={toggleDarkMode}
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:scale-105 transition-transform"
                    >
                        <Monitor className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
