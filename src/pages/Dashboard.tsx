import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { LogOut, LayoutDashboard } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-indigo-500" />
              <span className="font-bold text-xl tracking-tight">AI Resume Tailor</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:block">
                {currentUser?.email}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-8 shadow-2xl backdrop-blur-xl">
          <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard</h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            You're successfully logged in. This is a protected route that only authenticated users can access. 
            Start building your tailored resumes here.
          </p>
        </div>
      </main>
    </div>
  );
};
