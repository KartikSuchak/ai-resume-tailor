import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { exportResumeToPDF } from '../../services/pdfExport';

interface ExportPDFButtonProps {
  content: string;
  onToast: (toast: { message: string; type: 'success' | 'error' }) => void;
}

/**
 * A highly polished PDF Export Button for the resume tailorer.
 * Automatically parses candidate name from markdown for personalized, dynamic filenames.
 * Handles async exporting state with micro-animations and status toasts.
 */
export const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({ content, onToast }) => {
  const [isExporting, setIsExporting] = useState(false);

  // Extracts candidate name from H1 tag at the top of markdown for polished filenames
  const getDynamicFilename = (): string => {
    const lines = content.split('\n');
    const h1Line = lines.find(line => line.trim().startsWith('# '));
    if (h1Line) {
      const name = h1Line.replace('# ', '').trim();
      return `${name}_Tailored_Resume`;
    }
    return 'Tailored_Resume';
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const filename = getDynamicFilename();
      
      // Delay slightly to ensure browser updates DOM painting of the hidden element
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await exportResumeToPDF('resume-pdf-template', filename);
      onToast({ message: 'Professional PDF exported successfully!', type: 'success' });
    } catch (error: any) {
      onToast({ message: error.message || 'Failed to export PDF resume.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all border shadow-sm ${
        isExporting
          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500 hover:border-indigo-600'
      }`}
      title="Export tailored resume as recruiter-ready PDF"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          <span>Export PDF</span>
        </>
      )}
    </button>
  );
};
