import { User, Camera, Mail, Briefcase, Building, Globe, MapPin } from "lucide-react";
import { UserProfile } from "@/types";

interface ProfileSettingsProps {
  profile: UserProfile;
}

export default function ProfileSettings({ profile }: ProfileSettingsProps) {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white">Public Profile</h2>
        <p className="text-sm text-gray-400 mt-1">This information will be displayed across the Chrona SOC platform.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-soc-bg border-2 border-soc-border flex items-center justify-center relative overflow-hidden group">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-gray-500" />
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <button className="text-xs font-medium text-soc-accent hover:text-white transition-colors">
            Upload new picture
          </button>
        </div>

        {/* Basic Info */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Full Name</label>
              <input type="text" defaultValue={profile.name} className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-soc-accent transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email Address</label>
              <input type="email" defaultValue={profile.email} disabled className="w-full bg-soc-bg/50 border border-soc-border/50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Job Title</label>
              <input type="text" defaultValue={profile.jobTitle} className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-soc-accent transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 flex items-center gap-2"><Building className="w-3.5 h-3.5" /> Organisation</label>
              <input type="text" defaultValue={profile.organisation} disabled className="w-full bg-soc-bg/50 border border-soc-border/50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-soc-border pt-8 mb-6">
        <h3 className="text-md font-bold text-white mb-4">Localisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Time Zone</label>
            <select className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-soc-accent transition-colors">
              <option>{profile.timeZone}</option>
              <option>(UTC+00:00) Greenwich Mean Time</option>
              <option>(UTC+05:30) Indian Standard Time</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Language</label>
            <select className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-soc-accent transition-colors">
              <option>{profile.language}</option>
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </div>
      </div>
      
    </div>
  );
}
