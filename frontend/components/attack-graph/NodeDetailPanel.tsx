import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NodeDetailPanelProps {
  node: any;
  onClose: () => void;
}

export default function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;
  
  const { type, data } = node;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="absolute top-4 right-4 w-80 max-h-[calc(100%-2rem)] overflow-y-auto glass-card rounded-xl border border-soc-border shadow-2xl z-50 flex flex-col"
      >
        <div className="p-4 border-b border-soc-border flex justify-between items-center bg-soc-bg/50">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{type} Details</span>
            <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{data.label}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-soc-card rounded transition-colors text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-4">
          
          {Object.entries(data).map(([key, value]) => {
            if (key === 'label') return null;
            return (
              <div key={key} className="flex flex-col">
                <span className="text-[10px] uppercase font-mono text-gray-500 mb-1">{key.replace('_', ' ')}</span>
                <span className="text-sm text-gray-200 font-mono">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            );
          })}
          
          <div className="pt-4 border-t border-soc-border mt-2">
            <button className="w-full py-2 bg-soc-bg border border-soc-border hover:border-soc-accent rounded text-xs font-semibold text-gray-300 hover:text-white transition-colors">
              View Full Profile
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
