import React, { useState, useRef } from 'react';
import { Image, X, Loader2 } from 'lucide-react';
import { extractTextFromImage } from '../../services/ocr';

interface OCRUploaderProps {
  currentText: string;
  onTextExtracted: (text: string) => void;
  onClear: () => void;
  onToast: (toast: { message: string; type: 'success' | 'error' }) => void;
  placeholderText?: string;
  maxSizeMB?: number;
}

export const OCRUploader: React.FC<OCRUploaderProps> = ({
  currentText,
  onTextExtracted,
  onClear,
  onToast,
  placeholderText = 'Drag & drop image here, or browse',
  maxSizeMB = 5,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validations
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      onToast({ message: 'Only PNG, JPG, JPEG, and WEBP images are supported.', type: 'error' });
      return;
    }

    const MAX_SIZE = maxSizeMB * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      onToast({ message: `Image is too large. Max size allowed is ${maxSizeMB}MB.`, type: 'error' });
      return;
    }

    setIsParsing(true);
    setProgress(0);
    setFileName(file.name);
    
    // Create image preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    try {
      const extractedText = await extractTextFromImage(file, (percent) => {
        setProgress(percent);
      });
      
      onTextExtracted(extractedText);
      onToast({ message: `Successfully extracted text from: ${file.name}`, type: 'success' });
    } catch (error: any) {
      setFileName(null);
      setPreviewUrl(null);
      onToast({ message: error.message || 'OCR parsing failed.', type: 'error' });
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onToast({ message: 'Removed uploaded image.', type: 'success' });
  };

  // If there's already extracted text and we are NOT parsing, show a clean compact header actions layout
  if (currentText && !isParsing) {
    return (
      <div className="flex items-center gap-2.5 bg-gray-800/40 border border-gray-700/50 rounded-xl px-3 py-1.5 transition-all">
        <Image className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-gray-200 truncate max-w-[120px] sm:max-w-[150px]" title={fileName || 'Scanned Document'}>
          {fileName || 'Scanned Document'}
        </span>
        <button
          onClick={handleRemoveFile}
          className="p-1 hover:bg-gray-700/50 text-gray-400 hover:text-red-400 rounded-md transition-colors"
          title="Clear uploaded image"
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
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isParsing && fileInputRef.current?.click()}
        className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer select-none group text-center min-h-[300px] overflow-hidden ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
            : 'border-gray-700 bg-gray-800/20 hover:border-indigo-500/50 hover:bg-gray-800/30'
        } ${isParsing ? 'pointer-events-none' : ''}`}
      >
        {isParsing ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200 w-full max-w-[280px]">
            {previewUrl && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-700 shadow-lg mb-2">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-60 filter blur-xs" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
              </div>
            )}
            
            <div className="w-full text-center">
              <h4 className="font-semibold text-white">Performing OCR...</h4>
              <p className="text-xs text-gray-400 mt-1">Initializing models and parsing text</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-700/50 mt-1">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs font-semibold text-indigo-400">{progress}%</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 group-hover:scale-102 transition-transform duration-200">
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-2xl group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-all">
              <Image className="w-8 h-8 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {placeholderText}
              </p>
              <p className="text-xs text-gray-500 mt-1.5">PNG, JPG, JPEG, WEBP images up to {maxSizeMB}MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
