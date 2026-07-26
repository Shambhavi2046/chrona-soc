import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, ExternalLink, Activity, RefreshCw } from 'lucide-react';
import { CopilotMessage, CopilotQuickAction } from "@/types";
import Link from 'next/link';
import ClientDate from '../common/ClientDate';

interface MessageBubbleProps {
  message: CopilotMessage;
  quickActions?: CopilotQuickAction[];
  isLatest?: boolean;
  onRegenerate?: () => void;
}

export default function MessageBubble({ message, quickActions, isLatest, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      
      {!isUser && (
        <div className="flex-shrink-0 mr-4">
          <div className="w-8 h-8 rounded-full bg-soc-accent/20 border border-soc-accent flex items-center justify-center text-soc-accent shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Bot className="w-5 h-5" />
          </div>
        </div>
      )}

      <div className={`flex flex-col max-w-[85%] md:max-w-[75%]`}>
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs font-bold text-gray-300">
            {isUser ? 'You' : 'Chrona Copilot'}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            <ClientDate date={message.timestamp} format="time" />
          </span>
        </div>

        <div className={`relative px-5 py-4 rounded-2xl group ${
          isUser 
            ? 'bg-soc-card border border-soc-border text-gray-200 rounded-tr-sm' 
            : 'glass-card border border-soc-accent/30 text-gray-200 rounded-tl-sm shadow-lg'
        }`}>
          
          {/* Markdown Content */}
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-a:text-soc-accent hover:prose-a:text-blue-400 prose-code:text-soc-warning prose-code:bg-soc-bg prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-soc-bg prose-pre:border prose-pre:border-soc-border">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Quick Actions for Assistant Messages */}
          {!isUser && quickActions && quickActions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-soc-border/50 flex flex-wrap gap-2">
              {quickActions.map((action, idx) => (
                <Link 
                  key={idx} 
                  href={action.url}
                  className="inline-flex items-center px-3 py-1.5 bg-soc-bg/50 hover:bg-soc-accent/20 border border-soc-border hover:border-soc-accent rounded-full text-xs font-semibold text-gray-300 hover:text-white transition-all group"
                >
                  <Activity className="w-3 h-3 mr-1.5 text-soc-accent group-hover:scale-110 transition-transform" />
                  {action.label}
                  <ExternalLink className="w-3 h-3 ml-1.5 opacity-50 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}

          {/* Actions for Assistant Messages */}
          {!isUser && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => copyToClipboard(message.content)}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-soc-bg rounded transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {isLatest && onRegenerate && (
                <button 
                  onClick={onRegenerate}
                  className="p-1.5 text-gray-500 hover:text-soc-accent hover:bg-soc-bg rounded transition-colors"
                  title="Regenerate response"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 ml-4">
          <div className="w-8 h-8 rounded-full bg-soc-card border border-soc-border flex items-center justify-center text-gray-400">
            <User className="w-5 h-5" />
          </div>
        </div>
      )}

    </div>
  );
}
