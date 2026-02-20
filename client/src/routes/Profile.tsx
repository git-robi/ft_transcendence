import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../i18n/useLanguage';
import { useAuth } from '../context/AuthContext';
import ProfileAPI from '../APIs/profile';
import Matches from '../APIs/matches';

interface ProfileData {
  userId: number;
  name: string;
  avatarUrl: string;
  bio: string;
  level: number;
  xp: number;
}

interface StatsData {
  gamesPlayed: number;
  wins: number;
  losses: number;
  rank: number;
  achievements: { id: number; type: string; unlockedAt: string }[];
}

const ALL_ACHIEVEMENTS = ['first_game', 'first_win', 'perfect_game', 'five_games'];

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

const Profile = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ProfileAPI.get('/me', { withCredentials: true }).then(res => setProfile(res.data)).catch(() => {});
    if (user) {
      Matches.get(`/stats/${user.id}`).then(res => setStats(res.data)).catch(() => {});
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await ProfileAPI.patch('/me', { name: editName, bio: editBio }, { withCredentials: true });
      setProfile(prev => prev ? { ...prev, name: res.data.name, bio: res.data.bio } : prev);
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
      setProfile(prev => prev ? { ...prev, avatarUrl: res.data.avatarUrl } : prev);
    } catch {
      // upload failed silently
    }
  };

  const startEdit = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditBio(profile.bio);
    setEditing(true);
  };

  const getAvatarUrl = (url: string) => {
    if (url.startsWith('/avatars/') && url !== '/avatars/avatar_default.png') {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      return `${base}/profile${url}`;
    }
    return url;
  };

  const achievementLabels: Record<string, string> = {
    first_game: t.profile.firstGame,
    first_win: t.profile.firstWin,
    perfect_game: t.profile.perfectGame,
    five_games: t.profile.fiveGames,
  };

  if (!profile || !stats) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-accent-purple text-xl animate-pulse">{t.common.loading}</div>
        </main>
        <Footer />
      </div>
    );
  }

  const xpThreshold = calculateXpThreshold(profile.level);
  const prevThreshold = calculatePrevThreshold(profile.level);
  const xpInLevel = profile.xp - prevThreshold;
  const xpNeeded = xpThreshold - prevThreshold;
  const xpPercent = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 0;

  const unlockedTypes = new Set(stats.achievements.map(a => a.type));

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Profile Header */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative group">
                <img
                  src={getAvatarUrl(profile.avatarUrl)}
                  alt="avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-white/10"
                />
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
              </div>

              {/* Info */}
              <div className="flex-1">
                {editing ? (
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
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {t.profile.save}
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-4 py-1.5 rounded-lg border border-white/10 text-text-secondary text-sm hover:bg-white/5 transition-colors"
                      >
                        {t.profile.cancel}
                      </button>
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
                    <button
                      onClick={startEdit}
                      className="text-sm text-accent-purple hover:text-accent-blue transition-colors"
                    >
                      {t.profile.editProfile}
                    </button>
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

          {/* Stats */}
          <div>
            <h2 className="text-lg font-semibold mb-3">{t.profile.stats}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
                <div className="text-xs text-text-muted mt-1">{t.profile.gamesPlayed}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.wins}</div>
                <div className="text-xs text-text-muted mt-1">{t.profile.wins}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{stats.losses}</div>
                <div className="text-xs text-text-muted mt-1">{t.profile.losses}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent-purple">#{stats.rank}</div>
                <div className="text-xs text-text-muted mt-1">{t.profile.rank}</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h2 className="text-lg font-semibold mb-3">{t.profile.achievements}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ALL_ACHIEVEMENTS.map(type => {
                const unlocked = unlockedTypes.has(type);
                return (
                  <div
                    key={type}
                    className={`border rounded-xl p-4 text-center transition-colors ${
                      unlocked
                        ? 'bg-accent-purple/10 border-accent-purple/30'
                        : 'bg-white/5 border-white/10 opacity-40'
                    }`}
                  >
                    <div className="text-2xl mb-1">{unlocked ? '✓' : '✗'}</div>
                    <div className="text-xs font-medium">{achievementLabels[type]}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
