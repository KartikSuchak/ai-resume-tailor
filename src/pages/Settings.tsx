import React from 'react';
import { User, Moon, Bell, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Settings: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Section */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Profile</h2>
        </div>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input 
              type="text" 
              disabled 
              value={currentUser?.email || ''} 
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe"
              className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm">
            Save Profile
          </button>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Moon className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-200">Dark Mode</p>
              <p className="text-sm text-gray-400">Use dark theme across the app</p>
            </div>
            <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full translate-x-6 transition-transform"></div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-800 pt-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-200">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive product updates and news</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-gray-700 rounded-full flex items-center p-1 cursor-pointer">
              <div className="w-4 h-4 bg-gray-400 rounded-full transition-transform"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-sm border-l-4 border-l-red-500/50">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-semibold text-white">Danger Zone</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors text-sm">
          Delete Account
        </button>
      </div>
    </div>
  );
};
