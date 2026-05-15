import React from 'react';
import { User, Sparkles } from 'lucide-react';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-4 p-4 rounded-xl ${isUser ? 'bg-gray-800/30' : 'bg-indigo-500/5 border border-indigo-500/10'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${isUser ? 'bg-gray-700 text-gray-300' : 'bg-indigo-500/20 text-indigo-400'}`}>
        {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-200">
            {isUser ? 'You' : 'AI Assistant'}
          </p>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>
      </div>
    </div>
  );
};
