import { Moon, Sun, Monitor } from "lucide-react";
import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export default function AppearanceSettings() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("chrona-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("chrona-theme", newTheme);
    
    // Apply globally immediately
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (newTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else if (newTheme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      if (prefersDark) {
        root.classList.remove('light');
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
  };

  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300 space-y-10">
      
      {/* Theme */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-soc-text-primary">Theme Preferences</h2>
          <p className="text-sm text-soc-text-secondary mt-1">Customize the visual appearance of the Chrona SOC platform.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => handleThemeChange("light")}
            className={`p-4 bg-soc-card border-2 ${theme === 'light' ? 'border-soc-accent shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-soc-border hover:border-soc-accent/50'} rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group relative overflow-hidden`}
          >
            {theme === 'light' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-soc-accent" />}
            <div className={`p-3 rounded-full transition-colors ${theme === 'light' ? 'bg-soc-bg text-soc-accent' : 'bg-soc-bg text-soc-text-secondary group-hover:text-soc-text-secondary'}`}>
              <Sun className="w-6 h-6" />
            </div>
            <span className={`text-sm font-medium ${theme === 'light' ? 'text-soc-text-primary' : 'text-soc-text-secondary'}`}>Light Mode</span>
          </div>
          
          <div 
            onClick={() => handleThemeChange("dark")}
            className={`p-4 bg-soc-card border-2 ${theme === 'dark' ? 'border-soc-accent shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-soc-border hover:border-soc-accent/50'} rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group relative overflow-hidden`}
          >
            {theme === 'dark' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-soc-accent" />}
            <div className={`p-3 rounded-full transition-colors ${theme === 'dark' ? 'bg-soc-bg text-soc-accent' : 'bg-soc-bg text-soc-text-secondary group-hover:text-soc-text-secondary'}`}>
              <Moon className="w-6 h-6" />
            </div>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-soc-text-primary' : 'text-soc-text-secondary'}`}>Dark Mode</span>
          </div>

          <div 
            onClick={() => handleThemeChange("system")}
            className={`p-4 bg-soc-card border-2 ${theme === 'system' ? 'border-soc-accent shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-soc-border hover:border-soc-accent/50'} rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group relative overflow-hidden`}
          >
            {theme === 'system' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-soc-accent" />}
            <div className={`p-3 rounded-full transition-colors ${theme === 'system' ? 'bg-soc-bg text-soc-accent' : 'bg-soc-bg text-soc-text-secondary group-hover:text-soc-text-secondary'}`}>
              <Monitor className="w-6 h-6" />
            </div>
            <span className={`text-sm font-medium ${theme === 'system' ? 'text-soc-text-primary' : 'text-soc-text-secondary'}`}>System Default</span>
          </div>
        </div>
      </section>
    </div>
  );
}
