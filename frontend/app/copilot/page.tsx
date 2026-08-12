import React from 'react';

import ChatInterface from '@/components/copilot/ChatInterface';
import { Bot, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'AI Copilot | Chrona SOC',
  description: 'AI Security Operations Copilot',
};

export default function CopilotPage() {
  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-theme(spacing.16))] max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-soc-text-primary mb-1 flex items-center">
            <Bot className="w-6 h-6 mr-3 text-soc-accent" />
            Security Copilot
          </h1>
          <p className="text-soc-text-secondary text-sm">Natural language intelligence and automated SOC orchestration.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center px-4 py-2 bg-soc-bg border border-soc-border rounded-lg shadow-sm">
            <ShieldCheck className="w-4 h-4 text-soc-success mr-2" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-soc-text-muted font-bold tracking-wider">Access</span>
              <span className="text-sm font-mono font-bold text-soc-text-primary">L4 Authorized</span>
            </div>
          </div>
        </div>
      </div>
      

      
      <div className="flex-1 w-full relative min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}
