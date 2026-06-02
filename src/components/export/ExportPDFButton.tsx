import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { ExportModal } from './ExportModal';

interface ExportPDFButtonProps {
  content: string;
  sessionTitle: string | null;
  onToast: (toast: { message: string; type: 'success' | 'error' }) => void;
}

/**
 * PDF Export Button for the resume tailorer.
 * Triggers the professional preview and formatting configurations modal.
 */
export const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
  content,
  sessionTitle,
  onToast
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20 cursor-pointer"
        title="Open Export Modal to customize and preview your PDF resume"
      >
        <FileText className="w-4 h-4" />
        <span>Export PDF</span>
      </button>

      {isModalOpen && (
        <ExportModal
          content={content}
          sessionTitle={sessionTitle}
          onClose={() => setIsModalOpen(false)}
          onToast={onToast}
        />
      )}
    </>
  );
};
