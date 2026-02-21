import { useState, useRef } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import { useAuth } from '../context/AuthContext';
import Auth from '../APIs/auth';
import ProfileAPI from '../APIs/profile';
import Button from './Button';
import type { ProfileData } from '../types';

const calculateXpThreshold = (level: number) => {
  let threshold = 200;
  for (let i = 1; i < level; i++) {
    threshold += (i + 1) * 100;
  }
  return threshold;
};

const calculatePrevThreshold = (level: number) => {
  if (level <= 1) return 0;
  let threshold = 200;
  for (let i = 1; i < level - 1; i++) {
    threshold += (i + 1) * 100;
  }
  return threshold;
};

interface ProfileHeaderProps {
  profile: ProfileData;
  isOwnProfile: boolean;
  onProfileUpdate: (profile: ProfileData) => void;
}

const ProfileHeader = ({ profile, isOwnProfile, onProfileUpdate }: ProfileHeaderProps) => {
  const { t } = useLanguage();
  const { setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await ProfileAPI.patch('/me', { name: editName, bio: editBio }, { withCredentials: true });
      onProfileUpdate({ ...profile, name: res.data.name, bio: res.data.bio });
      const me = await Auth.get('/me');
      setUser(me.data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await ProfileAPI.patch('/upload', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onProfileUpdate({ ...profile, avatarUrl: res.data.avatarUrl });
    } catch {
      // upload failed silently
    }
  };

  const startEdit = () => {
    setEditName(profile.name);
    setEditBio(profile.bio);
    setEditing(true);
  };

  const xpThreshold = calculateXpThreshold(profile.level);
  const prevThreshold = calculatePrevThreshold(profile.level);
  const xpInLevel = profile.xp - prevThreshold;
  const xpNeeded = xpThreshold - prevThreshold;
  const xpPercent = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative group">
          <img
            src={profile.avatarUrl}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-white/10"
          />
          {isOwnProfile && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white"
              >
                {t.profile.changeAvatar}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          {isOwnProfile && editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple"
              />
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                maxLength={255}
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {t.profile.save}
                </Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  {t.profile.cancel}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <span className="px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-medium">
                  {t.profile.level} {profile.level}
                </span>
              </div>
              <p className="text-text-muted text-sm mb-3">
                {profile.bio || t.profile.noBio}
              </p>
              {isOwnProfile && (
                <button
                  onClick={startEdit}
                  className="text-sm text-accent-purple hover:text-accent-blue transition-colors"
                >
                  {t.profile.editProfile}
                </button>
              )}
            </>
          )}

          {/* XP Bar */}
          {!editing && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>{t.profile.xp}</span>
                <span>{xpInLevel} / {xpNeeded}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-purple to-accent-blue rounded-full transition-all"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
