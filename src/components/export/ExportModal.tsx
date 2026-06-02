import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, FileText, Download, Loader2, Sparkles } from 'lucide-react';
import { exportResumeToPDF } from '../../services/pdfExport';

interface ExportModalProps {
  content: string;
  sessionTitle: string | null;
  onClose: () => void;
  onToast: (toast: { message: string; type: 'success' | 'error' }) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  content,
  sessionTitle,
  onClose,
  onToast
}) => {
  const [template, setTemplate] = useState<'modern' | 'professional' | 'minimal'>('modern');
  const [isExporting, setIsExporting] = useState(false);

  // Determine default filename
  const [filename, setFilename] = useState(() => {
    if (sessionTitle && sessionTitle.trim().length > 0) {
      return `${sessionTitle.trim()} Resume`;
    }
    return 'Tailored_Resume';
  });

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const finalFilename = filename.trim().length > 0 ? filename : 'Tailored_Resume';
      // Wait for layout rendering setup
      await new Promise(resolve => setTimeout(resolve, 300));
      await exportResumeToPDF(content, finalFilename, template);
      onToast({ message: 'Professional PDF exported successfully!', type: 'success' });
      onClose();
    } catch (error: any) {
      console.error(error);
      onToast({ message: error.message || 'Failed to export PDF resume.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xs">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sidebar Configuration */}
        <div className="w-full md:w-80 bg-gray-950 border-b md:border-b-0 md:border-r border-gray-800 p-6 flex flex-col justify-between overflow-y-auto select-none">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Export PDF Options
              </h2>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-950/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Editable Filename */}
            <div className="space-y-2">
              <label htmlFor="filename-field" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                File Name
              </label>
              <div className="relative">
                <input
                  id="filename-field"
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="e.g. Juspay Resume"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-3 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">.pdf</span>
              </div>
            </div>

            {/* Template Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Template Layout
              </label>
              <div className="flex flex-col gap-2">
                {(['modern', 'professional', 'minimal'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                      template === t
                        ? 'bg-indigo-500/10 border-indigo-500/60 text-indigo-300 font-bold'
                        : 'bg-gray-900/50 border-gray-800/80 text-gray-400 hover:bg-gray-900 hover:text-gray-300 hover:border-gray-700'
                    }`}
                  >
                    <div className="text-sm capitalize">{t}</div>
                    <div className="text-[10px] opacity-75 font-normal mt-0.5">
                      {t === 'modern' && 'Clean margins with blue accent headers'}
                      {t === 'professional' && 'ATS-friendly serif, classic corporate'}
                      {t === 'minimal' && 'High whitespace, ultra-simple layout'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 mt-8 md:mt-0">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all border border-indigo-500 shadow-md cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full text-center text-gray-400 hover:text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 border border-transparent hover:border-gray-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Preview Pane */}
        <div className="flex-1 bg-gray-950 p-6 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Live HTML Preview
            </h3>
            <span className="text-[10px] text-gray-500">A4 Dimensions (approximate)</span>
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-800/80 bg-gray-900/10 p-4 sm:p-6 flex justify-center shadow-inner scroll-smooth">
            <div className="w-full max-w-[800px] bg-gray-950 rounded-lg shadow-xl overflow-hidden self-start">
              <div className="p-6">
                <div className="prose prose-invert prose-indigo max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-indigo-400 prose-strong:text-gray-100 prose-ul:text-gray-300 prose-li:marker:text-gray-600">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
