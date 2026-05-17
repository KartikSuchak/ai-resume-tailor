import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { tailorResume, refineResume } from '../services/gemini';
import { saveResume, updateResume } from '../services/firestore';
import type { SavedResume } from '../services/firestore';
import { useAuth } from '../hooks/useAuth';
import { ResumeOutput } from '../components/workspace/ResumeOutput';
import { RefinementChat } from '../components/workspace/RefinementChat';
import type { Message } from '../components/workspace/ChatMessage';

export const Workspace: React.FC = () => {
  const { currentUser: user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  
  // Document state
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [originalTailoredResume, setOriginalTailoredResume] = useState<string | null>(null);
  const [currentTailoredResume, setCurrentTailoredResume] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load from state if opened from Saved Resumes page
  useEffect(() => {
    if (location.state?.savedResume) {
      const savedData = location.state.savedResume as SavedResume;
      setDocumentId(savedData.id);
      setResume(savedData.originalResume);
      setJobDescription(savedData.jobDescription);
      setOriginalTailoredResume(savedData.originalTailoredResume);
      setCurrentTailoredResume(savedData.currentTailoredResume);
      
      // Parse dates properly from Firestore if needed, though they might already be parsed or plain objects
      // Map to ensure timestamp is a Date object for ChatMessage
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
  }, [location, navigate]);

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
      const result = await tailorResume(resume, jobDescription);
      setCurrentTailoredResume(result);
      setOriginalTailoredResume(result);
      
      if (user) {
        const newDocId = await saveResume(user.uid, resume, jobDescription, result);
        setDocumentId(newDocId);
      }

      setToast({ message: 'Resume tailored and saved!', type: 'success' });
    } catch (error: any) {
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
        await updateResume(documentId, newResume, finalChatMessages);
      }

      setToast({ message: 'Resume refined and saved!', type: 'success' });
    } catch (error: any) {
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
