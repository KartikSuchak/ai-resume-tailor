import React, { useState } from 'react';
import { Upload, Sparkles, Loader2 } from 'lucide-react';

export const Workspace: React.FC = () => {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);

  const handleTailor = () => {
    setIsTailoring(true);
    // Placeholder for AI logic
    setTimeout(() => {
      setIsTailoring(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Section */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-white">Your Resume</h2>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20">
              <Upload className="w-4 h-4" />
              Upload PDF
            </button>
          </div>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            className="flex-1 w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
            placeholder="Paste your resume content here..."
          />
          <div className="mt-2 text-right text-xs text-gray-500">
            {resume.length} characters
          </div>
        </div>

        {/* Job Description Section */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col h-[500px]">
          <h2 className="text-lg font-medium text-white mb-4">Job Description</h2>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="flex-1 w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
            placeholder="Paste the job description here..."
          />
          <div className="mt-2 text-right text-xs text-gray-500">
            {jobDescription.length} characters
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="flex justify-center py-4">
        <button
          onClick={handleTailor}
          disabled={isTailoring || !resume || !jobDescription}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
        >
          {isTailoring ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Tailoring Resume...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Tailor Resume Now
            </>
          )}
        </button>
      </div>

      {/* Result Section Placeholder */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-sm min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Your tailored resume will appear here.</p>
        </div>
      </div>
    </div>
  );
};
