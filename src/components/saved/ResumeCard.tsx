import React from 'react';
import { FileText, Clock, ExternalLink, Trash2 } from 'lucide-react';
import type { SavedResume } from '../../services/firestore';

interface ResumeCardProps {
  resume: SavedResume;
  onOpen: (resume: SavedResume) => void;
  onDelete: (id: string) => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onOpen, onDelete }) => {
  // Format the timestamp robustly without throwing on serialized JSON objects
  const getFormattedDate = (timestamp: any): string => {
    if (!timestamp) return 'Recently';
    let date: Date;
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (typeof timestamp.seconds === 'number') {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp.getTime === 'function') {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return isNaN(date.getTime()) 
      ? 'Recently' 
      : date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
  };

  const formattedDate = getFormattedDate(resume.updatedAt);

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-5 shadow-sm hover:border-indigo-500/50 transition-all group flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white truncate max-w-[200px]" title={resume.title}>
              {resume.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <Clock className="w-3 h-3" />
              <span>Edited {formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Snippet preview */}
      <div className="flex-1 bg-gray-950/50 rounded-xl p-3 border border-gray-800/50 mb-4 overflow-hidden relative">
        <p className="text-sm text-gray-400 line-clamp-3">
          {resume.currentTailoredResume.replace(/[#*]/g, '')}
        </p>
        {/* Gradient fade out at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-950/50 to-transparent"></div>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={() => onOpen(resume)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Open Session
        </button>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this tailored resume? This cannot be undone.')) {
              onDelete(resume.id);
            }
          }}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
          title="Delete Resume"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
