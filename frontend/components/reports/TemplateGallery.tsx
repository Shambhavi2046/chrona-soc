import { FilePlus, FileText, Calendar, ShieldCheck, Activity } from "lucide-react";
import { ReportTemplate } from "@/types";

interface TemplateGalleryProps {
  templates: ReportTemplate[];
  onUseTemplate?: (templateId: string) => void;
}

export default function TemplateGallery({ templates, onUseTemplate }: TemplateGalleryProps) {
  const getIcon = (category: string) => {
    switch (category) {
      case "Executive": return <Activity className="w-5 h-5 text-purple-400" />;
      case "Operational": return <FileText className="w-5 h-5 text-blue-400" />;
      case "Compliance": return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white font-medium">
          <FilePlus className="w-5 h-5 text-soc-accent" />
          Report Templates
        </div>
        <button className="text-xs text-soc-accent hover:text-white transition-colors">
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {templates.map((template) => (
          <div 
            key={template.id} 
            onClick={() => onUseTemplate?.(template.id)}
            className="bg-soc-bg border border-soc-border hover:border-soc-accent/50 rounded-lg p-4 transition-all group relative cursor-pointer"
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-soc-card rounded-lg group-hover:bg-soc-accent/10 transition-colors">
                {getIcon(template.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{template.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{template.category}</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-3 line-clamp-2 h-8">
              {template.description}
            </p>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-soc-border/50">
              <span className="text-[10px] text-gray-500 flex items-center">
                <Calendar className="w-3 h-3 mr-1" /> {template.lastUpdated}
              </span>
              <span className="text-xs font-medium text-soc-accent opacity-0 group-hover:opacity-100 transition-opacity">
                Use Template
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
