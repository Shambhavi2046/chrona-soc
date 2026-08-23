import { useState, useEffect } from "react";
import { User, Mail, Save } from "lucide-react";
import { AdminUser } from "@/services/admin";
import { getMyProfile, updateMyProfile } from "@/services/profile";

export default function ProfileSettings() {
  const [profile, setProfile] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
      setName(data.name);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      setMessage(null);
      const data = await updateMyProfile({ name });
      setProfile(data);
      setName(data.name);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-soc-text-secondary">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-6 text-red-400">Failed to load profile data.</div>;
  }

  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-soc-text-primary">Public Profile</h2>
          <p className="text-sm text-soc-text-secondary mt-1">Manage your account information.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving || name === profile.name}
          className="flex items-center gap-2 bg-soc-accent hover:bg-soc-accent/80 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded text-sm font-medium ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-soc-bg border-2 border-soc-border flex items-center justify-center relative overflow-hidden group">
            <User className="w-10 h-10 text-soc-text-muted" />
          </div>
        </div>

        {/* Basic Info */}
        <div className="flex-1 space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-soc-text-secondary flex items-center gap-2"><User className="w-3.5 h-3.5" /> Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent transition-colors" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-soc-text-secondary flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email Address</label>
            <input 
              type="email" 
              value={profile.email} 
              disabled 
              className="w-full bg-soc-bg/50 border border-soc-border/50 rounded-lg px-3 py-2 text-sm text-soc-text-muted cursor-not-allowed" 
            />
            <p className="text-xs text-soc-text-muted mt-1">Email address cannot be changed directly.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-soc-border pt-8 mt-8">
        <h3 className="text-md font-bold text-soc-text-primary mb-4">Change Password</h3>
        <ChangePasswordForm />
      </div>
    </div>
  );
}

import { changePassword } from "@/services/profile";

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      const result = await changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      setMessage({ type: 'success', text: result.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm font-medium ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-soc-danger/10 text-soc-danger'}`}>
          {message.text}
        </div>
      )}
      
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-soc-text-secondary">Current Password</label>
        <input 
          type="password" 
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent transition-colors" 
        />
      </div>
      
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-soc-text-secondary">New Password</label>
        <input 
          type="password" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent transition-colors" 
        />
      </div>
      
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-soc-text-secondary">Confirm New Password</label>
        <input 
          type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent transition-colors" 
        />
      </div>
      
      <button 
        type="submit"
        disabled={loading}
        className="mt-4 bg-soc-accent hover:bg-soc-accent/80 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
