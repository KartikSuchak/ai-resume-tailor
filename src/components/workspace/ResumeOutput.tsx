import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Copy, RefreshCw, Download, RotateCcw, Loader2 } from 'lucide-react';

interface ResumeOutputProps {
  content: string | null;
  isTailoring: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  onDownload: () => void;
  onReset: () => void;
  hasRefinements: boolean;
}

export const ResumeOutput: React.FC<ResumeOutputProps> = ({
  content,
  isTailoring,
  onCopy,
  onRegenerate,
  onDownload,
  onReset,
  hasRefinements
}) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          AI Tailored Output
        </h2>
        
        {content && (
          <div className="flex flex-wrap items-center gap-2">
            {hasRefinements && (
              <button 
                onClick={onReset}
                disabled={isTailoring}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/20 disabled:opacity-50"
                title="Reset to the first tailored version"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
            <button 
              onClick={onCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors border border-gray-700"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy</span>
            </button>
            <button 
              onClick={onDownload}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors border border-gray-700"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">TXT</span>
            </button>
            <button 
              onClick={onRegenerate}
              disabled={isTailoring}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTailoring ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          </div>
        )}
      </div>

      {content ? (
        <div className="flex-1 bg-gray-950 rounded-xl p-6 border border-gray-800 overflow-y-auto max-h-[600px] scroll-smooth">
          <div className="prose prose-invert prose-indigo max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-indigo-400 prose-strong:text-gray-100 prose-ul:text-gray-300 prose-li:marker:text-gray-600">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
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
  );
};
