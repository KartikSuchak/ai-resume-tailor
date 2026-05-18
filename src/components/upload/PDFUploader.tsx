import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Loader2 } from 'lucide-react';
import { extractTextFromPDF } from '../../services/pdf';

interface PDFUploaderProps {
  resumeText: string;
  onTextExtracted: (text: string) => void;
  onClearResume: () => void;
  onToast: (toast: { message: string; type: 'success' | 'error' }) => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({
  resumeText,
  onTextExtracted,
  onClearResume,
  onToast,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validations
    if (file.type !== 'application/pdf') {
      onToast({ message: 'Only PDF files are supported.', type: 'error' });
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      onToast({ message: 'File is too large. Max size allowed is 5MB.', type: 'error' });
      return;
    }

    setIsParsing(true);
    setFileName(file.name);
    
    try {
      const extractedText = await extractTextFromPDF(file);
      onTextExtracted(extractedText);
      onToast({ message: `Successfully extracted resume: ${file.name}`, type: 'success' });
    } catch (error: any) {
      setFileName(null);
      onToast({ message: error.message || 'Parsing failed.', type: 'error' });
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemoveFile = () => {
    setFileName(null);
    onClearResume();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onToast({ message: 'Removed uploaded resume.', type: 'success' });
  };

  // If there's already resume text and we are NOT parsing, we show a clean compact header actions layout
  if (resumeText && !isParsing) {
    return (
      <div className="flex items-center gap-2.5 bg-gray-800/40 border border-gray-700/50 rounded-xl px-3 py-1.5 transition-all">
        <FileText className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-gray-200 truncate max-w-[150px] sm:max-w-[200px]" title={fileName || 'Uploaded PDF'}>
          {fileName || 'Uploaded PDF'}
        </span>
        <button
          onClick={handleRemoveFile}
          className="p-1 hover:bg-gray-700/50 text-gray-400 hover:text-red-400 rounded-md transition-colors"
          title="Clear uploaded resume"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="application/pdf"
        className="hidden"
      />

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isParsing && fileInputRef.current?.click()}
        className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer select-none group text-center min-h-[300px] ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
            : 'border-gray-700 bg-gray-800/20 hover:border-indigo-500/50 hover:bg-gray-800/30'
        } ${isParsing ? 'pointer-events-none opacity-80' : ''}`}
      >
        {isParsing ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400/80" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white">Extracting your text...</h4>
              <p className="text-xs text-gray-400 mt-1">This happens securely on your browser</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 group-hover:scale-102 transition-transform duration-200">
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-2xl group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-all">
              <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Drag & drop your PDF resume here, or <span className="text-indigo-400 group-hover:underline">browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-1.5">Only PDF documents up to 5MB are accepted</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
