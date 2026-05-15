import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Loader2, Copy, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { tailorResume } from '../services/gemini';

export const Workspace: React.FC = () => {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredResult, setTailoredResult] = useState<string | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const MIN_CHARS = 50;
  const isInputValid = resume.length >= MIN_CHARS && jobDescription.length >= MIN_CHARS;

  const handleTailor = async () => {
    if (!isInputValid) {
      setToast({ message: 'Please provide more detail in both fields.', type: 'error' });
      return;
    }

    setIsTailoring(true);
    setTailoredResult(null);
    setToast(null);

    try {
      const result = await tailorResume(resume, jobDescription);
      setTailoredResult(result);
      setToast({ message: 'Resume successfully tailored!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'An error occurred during tailoring.', type: 'error' });
    } finally {
      setIsTailoring(false);
    }
  };

  const handleCopy = async () => {
    if (tailoredResult) {
      try {
        await navigator.clipboard.writeText(tailoredResult);
        setToast({ message: 'Copied to clipboard!', type: 'success' });
      } catch (err) {
        setToast({ message: 'Failed to copy text.', type: 'error' });
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-medium text-sm">{toast.message}</p>
        </div>
      )}

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
            placeholder="Paste your original resume content here..."
          />
          <div className="mt-2 text-right text-xs text-gray-500">
            {resume.length} characters {resume.length > 0 && resume.length < MIN_CHARS && `(min ${MIN_CHARS})`}
          </div>
        </div>

        {/* Job Description Section */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col h-[500px]">
          <h2 className="text-lg font-medium text-white mb-4">Job Description</h2>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="flex-1 w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
            placeholder="Paste the target job description here..."
          />
          <div className="mt-2 text-right text-xs text-gray-500">
            {jobDescription.length} characters {jobDescription.length > 0 && jobDescription.length < MIN_CHARS && `(min ${MIN_CHARS})`}
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="flex justify-center py-4">
        <button
          onClick={handleTailor}
          disabled={isTailoring || !isInputValid}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
        >
          {isTailoring ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Tailoring your resume with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Tailor Resume Now
            </>
          )}
        </button>
      </div>

      {/* Result Section */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Tailored Output
          </h2>
          
          {tailoredResult && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors border border-gray-700"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button 
                onClick={handleTailor}
                disabled={isTailoring}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isTailoring ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </div>
          )}
        </div>

        {tailoredResult ? (
          <div className="flex-1 bg-gray-950 rounded-xl p-6 border border-gray-800 overflow-y-auto max-h-[600px]">
            <pre className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
              {tailoredResult}
            </pre>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-800 rounded-xl">
            {isTailoring ? (
              <>
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium">Analyzing inputs and generating your perfect resume...</p>
                <p className="text-sm text-gray-500 mt-2">This usually takes about 5-10 seconds.</p>
              </>
            ) : (
              <>
                <Sparkles className="w-10 h-10 text-gray-700 mb-4" />
                <p className="text-gray-400 font-medium">Your highly-optimized, tailored resume will appear here.</p>
                <p className="text-sm text-gray-500 mt-2">Fill in your resume and job description above to get started.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
