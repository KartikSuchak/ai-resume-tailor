import React from 'react';
import { Menu, UserCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, title = 'Dashboard' }) => {
  const { currentUser } = useAuth();

  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 relative">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-400 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-sm font-medium text-gray-200">
            {currentUser?.email?.split('@')[0] || 'User'}
          </span>
          <span className="text-xs text-gray-400">{currentUser?.email}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <UserCircle className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
};
