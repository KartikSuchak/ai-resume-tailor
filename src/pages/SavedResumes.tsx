import React from 'react';
import { Bookmark, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SavedResumes: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
        <Bookmark className="w-10 h-10 text-indigo-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3">No Saved Resumes Yet</h2>
      <p className="text-gray-400 max-w-md mb-8">
        You haven't saved any tailored resumes. Head over to the workspace to create your first tailored resume using AI.
      </p>

      <button 
        onClick={() => navigate('/dashboard/tailor')}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20 active:scale-95"
      >
        <Plus className="w-5 h-5" />
        Create New Resume
      </button>
    </div>
  );
};
