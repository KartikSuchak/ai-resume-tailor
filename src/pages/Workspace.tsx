import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Image, Trash2, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { tailorResume, refineResume } from '../services/gemini';
import { saveResume, updateResume } from '../services/firestore';
import type { SavedResume } from '../services/firestore';
import { useAuth } from '../hooks/useAuth';
import { ResumeOutput } from '../components/workspace/ResumeOutput';
import { RefinementChat } from '../components/workspace/RefinementChat';
import { PDFUploader } from '../components/upload/PDFUploader';
import { OCRUploader } from '../components/upload/OCRUploader';
import type { Message } from '../components/workspace/ChatMessage';

const generateTitle = (jobDesc: string): string => {
  const firstLine = jobDesc.split('\n')[0].trim();
  const title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  return title || 'Untitled Resume';
};

export const Workspace: React.FC = () => {
  const { currentUser: user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Load initial state from localStorage or route state
  const [initialData] = useState(() => {
    let localData: any = null;
    try {
      const stored = localStorage.getItem('ai_resume_tailor_workspace_state');
      if (stored) {
        localData = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading workspace state from localStorage', e);
    }

    const hasLocalChanges = localData && (
      (localData.resume && localData.resume.trim() !== '') ||
      (localData.jobDescription && localData.jobDescription.trim() !== '')
    );

    // If navigated from Saved Resumes and there are NO unsaved changes, initialize directly
    if (location.state?.savedResume && !hasLocalChanges) {
      const savedData = location.state.savedResume as SavedResume;
      const parsedMessages = savedData.chatMessages.map(msg => ({
        ...msg,
        // @ts-ignore
        timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
      }));
      return {
        resume: savedData.originalResume || '',
        jobDescription: savedData.jobDescription || '',
        originalTailoredResume: savedData.originalTailoredResume || null,
        currentTailoredResume: savedData.currentTailoredResume || null,
        chatMessages: parsedMessages,
        documentId: savedData.id || null,
        sessionTitle: savedData.title || null,
        resumeSourceType: 'manual' as const,
        jobDescriptionSourceType: 'manual' as const
      };
    }

    // Otherwise load from localStorage or default
    if (localData) {
      if (localData.chatMessages) {
        localData.chatMessages = localData.chatMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
      return localData;
    }

    return null;
  });

  const [resume, setResume] = useState(() => initialData?.resume ?? '');
  const [jobDescription, setJobDescription] = useState(() => initialData?.jobDescription ?? '');
  const [isTailoring, setIsTailoring] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isPasteMode, setIsPasteMode] = useState(() => {
    if (initialData?.resume && initialData?.resumeSourceType === 'manual') {
      return true;
    }
    return false;
  });

  // Unified upload states
  const [resumeUploadMode, setResumeUploadMode] = useState<'pdf' | 'ocr'>('pdf');
  const [resumeSourceType, setResumeSourceType] = useState<'pdf' | 'ocr' | 'manual'>(() => initialData?.resumeSourceType ?? 'manual');
  
  const [jobDescriptionSourceType, setJobDescriptionSourceType] = useState<'ocr' | 'manual'>(() => initialData?.jobDescriptionSourceType ?? 'manual');
  const [isJobDescriptionOcrMode, setIsJobDescriptionOcrMode] = useState(() => {
    if (initialData?.jobDescription && initialData?.jobDescriptionSourceType === 'ocr') {
      return true;
    }
    return false;
  });
  
  // Document state
  const [documentId, setDocumentId] = useState<string | null>(() => initialData?.documentId ?? null);
  const [sessionTitle, setSessionTitle] = useState<string | null>(() => initialData?.sessionTitle ?? null);
  const [originalTailoredResume, setOriginalTailoredResume] = useState<string | null>(() => initialData?.originalTailoredResume ?? null);
  const [currentTailoredResume, setCurrentTailoredResume] = useState<string | null>(() => initialData?.currentTailoredResume ?? null);
  const [chatMessages, setChatMessages] = useState<Message[]>(() => initialData?.chatMessages ?? []);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load from state if opened from Saved Resumes page, with unsaved changes safeguard
  useEffect(() => {
    if (location.state?.savedResume) {
      const savedData = location.state.savedResume as SavedResume;
      
      const hasUnsavedChanges = 
        (resume.trim() !== '' || jobDescription.trim() !== '') && 
        documentId !== savedData.id;

      if (hasUnsavedChanges) {
        const confirmReplace = window.confirm(
          "Opening this saved resume will replace your current workspace. Continue?"
        );
        if (!confirmReplace) {
          // Clear route state to prevent repeating the prompt and return
          navigate(location.pathname, { replace: true });
          return;
        }
      }

      setDocumentId(savedData.id);
      setResume(savedData.originalResume);
      setJobDescription(savedData.jobDescription);
      setOriginalTailoredResume(savedData.originalTailoredResume);
      setCurrentTailoredResume(savedData.currentTailoredResume);
      setSessionTitle(savedData.title || null);
      
      // Parse dates properly from Firestore if needed
      const parsedMessages = savedData.chatMessages.map(msg => ({
        ...msg,
        // @ts-ignore - Handle firestore timestamp format
        timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
      }));
      setChatMessages(parsedMessages);
      
      // Clear location state so refresh doesn't reload old data
      navigate(location.pathname, { replace: true });
      
      setToast({ message: 'Loaded saved session.', type: 'success' });
    }
  }, [location, navigate, resume, jobDescription, documentId]);

  // Persist state to localStorage on change
  useEffect(() => {
    const stateToPersist = {
      resume,
      jobDescription,
      originalTailoredResume,
      currentTailoredResume,
      chatMessages,
      documentId,
      sessionTitle,
      resumeSourceType,
      jobDescriptionSourceType
    };
    try {
      localStorage.setItem('ai_resume_tailor_workspace_state', JSON.stringify(stateToPersist));
    } catch (e) {
      console.error('Failed to save workspace state to localStorage:', e);
    }
  }, [
    resume,
    jobDescription,
    originalTailoredResume,
    currentTailoredResume,
    chatMessages,
    documentId,
    sessionTitle,
    resumeSourceType,
    jobDescriptionSourceType
  ]);

  const MIN_CHARS = 50;
  const isInputValid = resume.length >= MIN_CHARS && jobDescription.length >= MIN_CHARS;

  const handleTailor = async () => {
    if (!isInputValid) {
      setToast({ message: 'Please provide more detail in both fields.', type: 'error' });
      return;
    }

    setIsTailoring(true);
    setCurrentTailoredResume(null);
    setOriginalTailoredResume(null);
    setChatMessages([]);
    setDocumentId(null);
    setToast(null);

    try {
      console.log(`[SAVE] handleTailor triggered. Auth user:`, user ? `uid=${user.uid}` : 'null');
      const result = await tailorResume(resume, jobDescription);
      setCurrentTailoredResume(result);
      setOriginalTailoredResume(result);
      setSessionTitle(generateTitle(jobDescription));
      
      if (user) {
        console.log(`[SAVE] Attempting automatic save after tailoring...`);
        const newDocId = await saveResume(user.uid, resume, jobDescription, result);
        console.log(`[SAVE] saveResume resolved. documentId=${newDocId}`);
        setDocumentId(newDocId);
      } else {
        console.warn(`[SAVE] Auto-save skipped: User is not authenticated.`);
      }

      setToast({ message: 'Resume tailored and saved!', type: 'success' });
    } catch (error: any) {
      console.error(`[SAVE] handleTailor save pipeline failed:`, error);
      setToast({ message: error.message || 'An error occurred.', type: 'error' });
    } finally {
      setIsTailoring(false);
    }
  };

  const handleRefine = async (instruction: string) => {
    if (!currentTailoredResume) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: instruction, timestamp: new Date() };
    const newChatMessages = [...chatMessages, userMsg];
    setChatMessages(newChatMessages);
    setIsRefining(true);

    try {
      console.log(`[SAVE] handleRefine triggered. Auth user:`, user ? `uid=${user.uid}` : 'null', `documentId=${documentId}`);
      const newResume = await refineResume(currentTailoredResume, instruction, jobDescription);
      setCurrentTailoredResume(newResume);
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: 'I have updated your resume based on your instructions. Check the output above.', 
        timestamp: new Date() 
      };
      
      const finalChatMessages = [...newChatMessages, aiMsg];
      setChatMessages(finalChatMessages);
      
      if (documentId) {
        console.log(`[SAVE] Attempting automatic update after refinement for documentId=${documentId}...`);
        await updateResume(documentId, newResume, finalChatMessages);
      } else if (user) {
        console.log(`[SAVE] No active documentId. Creating new Firestore document during refinement...`);
        const newDocId = await saveResume(user.uid, resume, jobDescription, newResume);
        setDocumentId(newDocId);
        setSessionTitle(generateTitle(jobDescription));
        console.log(`[SAVE] Created new documentId=${newDocId} during refinement. Syncing chat history...`);
        await updateResume(newDocId, newResume, finalChatMessages);
      } else {
        console.warn(`[SAVE] Auto-save refinement skipped: User is not authenticated and no documentId is active.`);
      }

      setToast({ message: 'Resume refined and saved!', type: 'success' });
    } catch (error: any) {
      console.error(`[SAVE] handleRefine save pipeline failed:`, error);
      setToast({ message: error.message || 'Failed to refine resume.', type: 'error' });
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: 'Sorry, I encountered an error while trying to refine the resume. Please try again.', 
        timestamp: new Date() 
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsRefining(false);
    }
  };

  const handleClearSession = () => {
    if (window.confirm('Are you sure you want to clear your current workspace session? This will remove all unsaved progress.')) {
      setResume('');
      setJobDescription('');
      setOriginalTailoredResume(null);
      setCurrentTailoredResume(null);
      setChatMessages([]);
      setDocumentId(null);
      setSessionTitle(null);
      setResumeSourceType('manual');
      setJobDescriptionSourceType('manual');
      localStorage.removeItem('ai_resume_tailor_workspace_state');
      setToast({ message: 'Workspace cleared.', type: 'success' });
    }
  };

  const handleCopy = async () => {
    if (currentTailoredResume) {
      try {
        await navigator.clipboard.writeText(currentTailoredResume);
        setToast({ message: 'Copied to clipboard!', type: 'success' });
      } catch (err) {
        setToast({ message: 'Failed to copy text.', type: 'error' });
      }
    }
  };

  const handleDownload = () => {
    if (!currentTailoredResume) return;
    const blob = new Blob([currentTailoredResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Tailored_Resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast({ message: 'Resume downloaded!', type: 'success' });
  };

  const handleReset = async () => {
    if (originalTailoredResume) {
      setCurrentTailoredResume(originalTailoredResume);
      setChatMessages([]);
      
      if (documentId) {
        try {
          await updateResume(documentId, originalTailoredResume, []);
        } catch (error) {
          console.error('Failed to sync reset to Firestore', error);
        }
      }
      
      setToast({ message: 'Reset to original tailored version.', type: 'success' });
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

      {/* Workspace Header / Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/40 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex flex-wrap items-center gap-2">
              <span>Tailoring Workspace</span>
              {sessionTitle && (
                <span className="text-xs font-normal text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 max-w-[200px] sm:max-w-[300px] truncate" title={sessionTitle}>
                  {sessionTitle}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {documentId ? 'Synced with Firestore' : 'Unsaved Local Draft'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleClearSession}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-gray-800 hover:border-red-500/20 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Section */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col h-[520px]">
          <div className="flex justify-between items-center mb-4 min-h-[44px]">
            <h2 className="text-lg font-medium text-white">Your Resume</h2>
            
            {resume ? (
              // Active document controls depending on how the resume got populated
              <div className="flex items-center gap-2">
                {resumeSourceType === 'pdf' && (
                  <PDFUploader
                    resumeText={resume}
                    onTextExtracted={(text) => {
                      setResume(text);
                      setResumeSourceType('pdf');
                      setIsPasteMode(false);
                    }}
                    onClearResume={() => {
                      setResume('');
                      setResumeSourceType('manual');
                      setIsPasteMode(false);
                    }}
                    onToast={(t) => setToast(t)}
                  />
                )}
                {resumeSourceType === 'ocr' && (
                  <OCRUploader
                    currentText={resume}
                    onTextExtracted={(text) => {
                      setResume(text);
                      setResumeSourceType('ocr');
                      setIsPasteMode(false);
                    }}
                    onClear={() => {
                      setResume('');
                      setResumeSourceType('manual');
                      setIsPasteMode(false);
                    }}
                    onToast={(t) => setToast(t)}
                  />
                )}
                {resumeSourceType === 'manual' && (
                  <button
                    onClick={() => {
                      setResume('');
                      setIsPasteMode(false);
                    }}
                    className="text-xs font-semibold text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-lg border border-gray-700/50 hover:border-red-500/20 bg-gray-800/40 hover:bg-red-500/5 transition-colors"
                  >
                    Clear Text
                  </button>
                )}
              </div>
            ) : (
              // Upload mode tab selection when the resume field is empty
              !isPasteMode && (
                <div className="flex bg-gray-800/40 p-1 rounded-xl border border-gray-700/50">
                  <button 
                    onClick={() => setResumeUploadMode('pdf')} 
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      resumeUploadMode === 'pdf' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    PDF
                  </button>
                  <button 
                    onClick={() => setResumeUploadMode('ocr')} 
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      resumeUploadMode === 'ocr' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Image OCR
                  </button>
                </div>
              )
            )}
          </div>
          
          {!resume && !isPasteMode ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex-1 flex flex-col">
                {resumeUploadMode === 'pdf' ? (
                  <PDFUploader
                    resumeText={resume}
                    onTextExtracted={(text) => {
                      setResume(text);
                      setResumeSourceType('pdf');
                      setIsPasteMode(false);
                    }}
                    onClearResume={() => {
                      setResume('');
                      setResumeSourceType('manual');
                      setIsPasteMode(false);
                    }}
                    onToast={(t) => setToast(t)}
                  />
                ) : (
                  <OCRUploader
                    currentText={resume}
                    onTextExtracted={(text) => {
                      setResume(text);
                      setResumeSourceType('ocr');
                      setIsPasteMode(false);
                    }}
                    onClear={() => {
                      setResume('');
                      setResumeSourceType('manual');
                      setIsPasteMode(false);
                    }}
                    onToast={(t) => setToast(t)}
                    placeholderText="Drag & drop scanned resume image here, or browse"
                  />
                )}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setIsPasteMode(true);
                    setResumeSourceType('manual');
                  }}
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors focus:outline-none"
                >
                  Or paste your resume text manually
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <textarea
                value={resume}
                onChange={(e) => {
                  setResume(e.target.value);
                  if (resumeSourceType !== 'manual') {
                    setResumeSourceType('manual');
                  }
                }}
                className="flex-1 w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                placeholder="Paste your original resume content here..."
              />
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <div>
                  {!resume && isPasteMode && (
                    <button
                      onClick={() => setIsPasteMode(false)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Use File Uploaders instead
                    </button>
                  )}
                </div>
                <div>
                  {resume.length} characters {resume.length > 0 && resume.length < MIN_CHARS && `(min ${MIN_CHARS})`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Job Description Section */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col h-[520px]">
          <div className="flex justify-between items-center mb-4 min-h-[44px]">
            <h2 className="text-lg font-medium text-white">Job Description</h2>
            
            {jobDescription ? (
              // Active controls for job description
              <div className="flex items-center gap-2">
                {jobDescriptionSourceType === 'ocr' && (
                  <OCRUploader
                    currentText={jobDescription}
                    onTextExtracted={(text) => {
                      setJobDescription(text);
                      setJobDescriptionSourceType('ocr');
                      setIsJobDescriptionOcrMode(false);
                    }}
                    onClear={() => {
                      setJobDescription('');
                      setJobDescriptionSourceType('manual');
                    }}
                    onToast={(t) => setToast(t)}
                  />
                )}
                {jobDescriptionSourceType === 'manual' && (
                  <button
                    onClick={() => {
                      setJobDescription('');
                      setIsJobDescriptionOcrMode(false);
                    }}
                    className="text-xs font-semibold text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-lg border border-gray-700/50 hover:border-red-500/20 bg-gray-800/40 hover:bg-red-500/5 transition-colors"
                  >
                    Clear Text
                  </button>
                )}
              </div>
            ) : (
              // Toggle Scan / OCR mode when job description field is empty
              <button
                onClick={() => setIsJobDescriptionOcrMode(!isJobDescriptionOcrMode)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-700 bg-gray-850 hover:bg-gray-800 text-gray-300 hover:text-white transition-all shadow-xs"
              >
                <Image className="w-3.5 h-3.5" />
                {isJobDescriptionOcrMode ? 'Manual Paste' : 'Scan listing screenshot'}
              </button>
            )}
          </div>

          {isJobDescriptionOcrMode && !jobDescription ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex-1 flex flex-col">
                <OCRUploader
                  currentText={jobDescription}
                  onTextExtracted={(text) => {
                    setJobDescription(text);
                    setJobDescriptionSourceType('ocr');
                    setIsJobDescriptionOcrMode(false);
                  }}
                  onClear={() => {
                    setJobDescription('');
                    setJobDescriptionSourceType('manual');
                  }}
                  onToast={(t) => setToast(t)}
                  placeholderText="Drag & drop job listing screenshot here, or browse"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <textarea
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  if (jobDescriptionSourceType !== 'manual') {
                    setJobDescriptionSourceType('manual');
                  }
                }}
                className="flex-1 w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                placeholder="Paste the target job description here..."
              />
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <div>
                  {!jobDescription && !isJobDescriptionOcrMode && (
                    <button
                      onClick={() => setIsJobDescriptionOcrMode(true)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Use Screenshot OCR instead
                    </button>
                  )}
                </div>
                <div>
                  {jobDescription.length} characters {jobDescription.length > 0 && jobDescription.length < MIN_CHARS && `(min ${MIN_CHARS})`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Section */}
      <div className="flex justify-center py-4">
        <button
          onClick={handleTailor}
          disabled={isTailoring || isRefining || !isInputValid}
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
              {originalTailoredResume ? 'Regenerate Base Resume' : 'Tailor Resume Now'}
            </>
          )}
        </button>
      </div>

      {/* Result & Refinement Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResumeOutput 
            content={currentTailoredResume} 
            isTailoring={isTailoring || isRefining} 
            onCopy={handleCopy}
            onRegenerate={handleTailor}
            onDownload={handleDownload}
            onReset={handleReset}
            hasRefinements={chatMessages.length > 0}
            onToast={(t) => setToast(t)}
            sessionTitle={sessionTitle}
          />
        </div>
        <div className="lg:col-span-1">
          {originalTailoredResume && (
            <RefinementChat 
              messages={chatMessages} 
              onSendMessage={handleRefine} 
              isGenerating={isRefining} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
