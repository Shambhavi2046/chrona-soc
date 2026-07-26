import { Moon, Sun, Monitor, Type, Layout, Sidebar as SidebarIcon } from "lucide-react";

export default function AppearanceSettings() {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300 space-y-10">
      
      {/* Theme */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white">Theme Preferences</h2>
          <p className="text-sm text-gray-400 mt-1">Customize the visual appearance of the Chrona SOC platform.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-soc-card border-2 border-soc-border hover:border-soc-accent rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group">
            <div className="p-3 bg-soc-bg rounded-full group-hover:text-soc-accent transition-colors"><Sun className="w-6 h-6" /></div>
            <span className="text-sm font-medium text-white">Light Mode</span>
          </div>
          <div className="p-4 bg-soc-bg border-2 border-soc-accent rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-soc-accent" />
            <div className="p-3 bg-soc-card rounded-full text-soc-accent"><Moon className="w-6 h-6" /></div>
            <span className="text-sm font-medium text-white">Dark Mode</span>
          </div>
          <div className="p-4 bg-soc-card border-2 border-soc-border hover:border-soc-accent rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group">
            <div className="p-3 bg-soc-bg rounded-full group-hover:text-soc-accent transition-colors"><Monitor className="w-6 h-6" /></div>
            <span className="text-sm font-medium text-white">System Default</span>
          </div>
        </div>
      </section>

      {/* Interface Options */}
      <section>
        <h3 className="text-md font-bold text-white mb-4">Interface Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-4 bg-soc-bg border border-soc-border rounded-lg flex items-center justify-between group">
            <div>
              <h4 className="text-sm font-medium text-white flex items-center gap-2"><Layout className="w-4 h-4 text-soc-accent" /> Compact Mode</h4>
              <p className="text-xs text-gray-500 mt-0.5">Reduce padding across all components to show more data.</p>
            </div>
            <button className="w-8 h-4 rounded-full relative bg-gray-700 transition-colors">
              <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform" />
            </button>
          </div>

          <div className="p-4 bg-soc-bg border border-soc-border rounded-lg flex items-center justify-between group">
            <div>
              <h4 className="text-sm font-medium text-white flex items-center gap-2"><SidebarIcon className="w-4 h-4 text-soc-accent" /> Auto-Hide Sidebar</h4>
              <p className="text-xs text-gray-500 mt-0.5">Collapse the navigation menu on smaller screens automatically.</p>
            </div>
            <button className="w-8 h-4 rounded-full relative bg-soc-accent transition-colors">
              <div className="absolute top-0.5 left-4 w-3 h-3 rounded-full bg-white transition-transform" />
            </button>
          </div>

          <div className="p-4 bg-soc-bg border border-soc-border rounded-lg col-span-1 md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-medium text-white flex items-center gap-2"><Type className="w-4 h-4 text-soc-accent" /> Table Density</h4>
                <p className="text-xs text-gray-500 mt-0.5">Adjust row height for data tables (Alerts, Investigations).</p>
              </div>
            </div>
            <div className="flex bg-soc-card rounded-lg p-1 border border-soc-border">
              <button className="flex-1 py-1.5 text-xs font-medium text-gray-400 hover:text-white rounded transition-colors">Comfortable</button>
              <button className="flex-1 py-1.5 text-xs font-medium bg-soc-bg text-white border border-soc-border rounded shadow-sm">Standard</button>
              <button className="flex-1 py-1.5 text-xs font-medium text-gray-400 hover:text-white rounded transition-colors">Compact</button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
