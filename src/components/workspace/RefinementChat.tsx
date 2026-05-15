import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { ChatMessage, type Message } from './ChatMessage';

interface RefinementChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
}

export const RefinementChat: React.FC<RefinementChatProps> = ({ 
  messages, 
  onSendMessage, 
  isGenerating 
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isGenerating) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2 bg-gray-900/80">
        <MessageSquare className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-white">Refinement Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-3">
            <MessageSquare className="w-10 h-10 text-gray-700" />
            <p className="max-w-[250px] text-sm">
              Ask the AI to refine your tailored resume (e.g., "Make it shorter" or "Focus more on React").
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        {isGenerating && (
          <div className="flex items-center gap-3 p-4 text-gray-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            AI is refining your resume...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-900/80">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isGenerating}
            placeholder="Type your refinement instructions here..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isGenerating}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
