"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, AlertCircle, Loader2, Shield, Activity, Target } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { CopilotMessage, CopilotQuickAction, CopilotActiveContext } from "@/types";
import { sendCopilotMessage } from "@/services";

export default function ChatInterface() {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    "Summarize the latest critical case",
    "What assets are currently affected?",
    "Recommend containment steps"
  ]);
  const [quickActions, setQuickActions] = useState<CopilotQuickAction[]>([]);
  const [activeContext, setActiveContext] = useState<CopilotActiveContext | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, presetPrompt?: string) => {
    if (e) e.preventDefault();
    
    const promptText = presetPrompt || input;
    if (!promptText.trim() || isLoading) return;

    const userMessage: CopilotMessage = {
      role: 'user',
      content: promptText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setSuggestedPrompts([]);
    setQuickActions([]);

    try {
      const response = await sendCopilotMessage(promptText, messages);
      
      const aiMessage: CopilotMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setSuggestedPrompts(response.suggested_prompts);
      setQuickActions(response.quick_actions);
      
      if (response.active_context) {
        setActiveContext(response.active_context);
      }
    } catch (error) {
      console.error("Copilot Error:", error);
      const errorMessage: CopilotMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error connecting to the SOC intelligence fabric. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRegenerate = async (index: number) => {
    if (isLoading || index === 0) return;
    
    // Get the user prompt that preceded this AI response
    const previousUserMessage = messages[index - 1];
    if (previousUserMessage.role !== 'user') return;

    // Slice history to remove this AI response and the preceding user prompt
    const newHistory = messages.slice(0, index - 1);
    
    // Set history and resubmit the user prompt
    setMessages(newHistory);
    handleSubmit(undefined, previousUserMessage.content);
  };

  return (
    <div className="flex flex-col h-full bg-soc-bg border border-soc-border rounded-xl overflow-hidden glass-card relative">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-soc-border bg-soc-card flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-soc-accent/20 border border-soc-accent/50 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Bot className="w-6 h-6 text-soc-accent" />
          </div>
          <div>
            <h2 className="text-soc-text-primary font-bold tracking-wide">Chrona Copilot</h2>
            <p className="text-xs text-soc-success flex items-center">
              <span className="w-2 h-2 rounded-full bg-soc-success mr-1.5 animate-pulse"></span>
              Online & Monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Context Banner */}
      {activeContext && (
        <div className="px-6 py-2 bg-soc-accent/10 border-b border-soc-accent/20 flex items-center justify-between text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-4 text-soc-text-secondary">
            <div className="flex items-center gap-1.5 font-mono">
              <Shield className="w-3.5 h-3.5 text-soc-accent" />
              <span className="text-soc-accent font-bold">{activeContext.id}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 border-l border-soc-border pl-4">
              <Target className="w-3.5 h-3.5 text-soc-warning" />
              <span className="truncate max-w-[200px]">{activeContext.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
              activeContext.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              activeContext.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {activeContext.priority}
            </span>
            <div className="flex items-center gap-1.5 border-l border-soc-border pl-4 text-soc-text-secondary">
              <Activity className="w-3.5 h-3.5" />
              <span>Risk: {activeContext.risk_score}</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-70">
            <Sparkles className="w-12 h-12 text-soc-text-muted mb-4" />
            <h3 className="text-lg font-bold text-soc-text-primary mb-2">How can I assist?</h3>
            <p className="text-sm text-soc-text-secondary">
              I have deep context into your alerts, cases, and infrastructure. Ask me to summarize an incident, map an attack path, or recommend containment steps.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isLatest = idx === messages.length - 1;
            return (
              <MessageBubble 
                key={idx} 
                message={msg} 
                quickActions={msg.role === 'assistant' && isLatest ? quickActions : []} 
                isLatest={isLatest}
                onRegenerate={() => handleRegenerate(idx)}
              />
            );
          })
        )}
        
        {isLoading && (
          <div className="flex items-center gap-3 text-soc-text-secondary">
            <div className="w-8 h-8 rounded-full bg-soc-accent/10 border border-soc-accent/30 flex items-center justify-center text-soc-accent">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <span className="text-sm font-medium animate-pulse">Analyzing telemetry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Area */}
      {suggestedPrompts.length > 0 && !isLoading && (
        <div className="px-6 pb-2 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2 duration-300">
          {suggestedPrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(undefined, sp)}
              className="px-3 py-1.5 rounded-full border border-soc-border bg-soc-card hover:bg-soc-accent/10 hover:border-soc-accent text-xs font-medium text-soc-text-secondary hover:text-white transition-all shadow-sm"
            >
              {sp}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-soc-card border-t border-soc-border">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Copilot to investigate an alert, summarize a case, or map an attack path..."
              className="w-full bg-soc-bg border border-soc-border rounded-xl px-4 py-3.5 text-sm text-soc-text-primary placeholder-gray-500 focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent resize-none transition-all pr-12 min-h-[52px] max-h-[150px]"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-3 top-3.5 text-soc-text-muted">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-[52px] h-[52px] rounded-xl bg-soc-accent hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-soc-accent flex items-center justify-center text-white transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)]"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-[10px] text-soc-text-muted flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            AI-generated insights should be verified by a human analyst before executing containment.
          </p>
        </div>
      </div>
      
    </div>
  );
}
