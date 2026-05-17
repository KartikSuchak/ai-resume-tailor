import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, FileText, Loader2, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUserResumes, deleteResume } from '../services/firestore';
import type { SavedResume } from '../services/firestore';
import { ResumeCard } from '../components/saved/ResumeCard';

export const SavedResumes: React.FC = () => {
  const { currentUser: user } = useAuth();
  const navigate = useNavigate();
  
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResumes = async () => {
      if (!user) return;
      try {
        const fetchedResumes = await getUserResumes(user.uid);
        setResumes(fetchedResumes);
      } catch (err) {
        setError('Failed to load saved resumes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteResume(id);
      setResumes(resumes.filter(resume => resume.id !== id));
    } catch (err) {
      alert('Failed to delete resume.');
    }
  };

  const handleOpen = (resume: SavedResume) => {
    navigate('/dashboard/tailor', { state: { savedResume: resume } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <Bookmark className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Saved Resumes</h1>
            <p className="text-gray-400 mt-1">Access and manage your tailored resumes</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/dashboard/tailor')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New Resume</span>
        </button>
      </div>

      {isLoading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-gray-400 font-medium">Loading your saved resumes...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
          {error}
        </div>
      ) : resumes.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
          <div className="p-4 bg-gray-800/50 rounded-full mb-4">
            <FileText className="w-12 h-12 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No saved resumes yet</h2>
          <p className="text-gray-400 max-w-md mb-6">
            When you generate a tailored resume using the AI workspace, it will automatically be saved here.
          </p>
          <button 
            onClick={() => navigate('/dashboard/tailor')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl font-medium transition-colors border border-indigo-500/20"
          >
            <Plus className="w-5 h-5" />
            Create Your First Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resumes.map(resume => (
            <ResumeCard 
              key={resume.id}
              resume={resume}
              onOpen={handleOpen}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
