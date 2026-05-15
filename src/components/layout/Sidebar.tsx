import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Bookmark, Settings, LogOut } from 'lucide-react';
import { auth } from '../../firebase/firebase';
import { signOut } from 'firebase/auth';

export const Sidebar: React.FC = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', end: true },
    { name: 'Tailor Resume', icon: FileText, path: '/dashboard/tailor' },
    { name: 'Saved Resumes', icon: Bookmark, path: '/dashboard/saved' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 h-full">
      <div className="flex items-center gap-2 p-6 h-16 border-b border-gray-800">
        <LayoutDashboard className="w-6 h-6 text-indigo-500" />
        <span className="font-bold text-xl tracking-tight text-white">AI Tailor</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg font-medium transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};
