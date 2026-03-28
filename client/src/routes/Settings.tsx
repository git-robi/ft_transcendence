import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import EyeIcon from '../components/icons/EyeIcon';
import EyeOffIcon from '../components/icons/EyeOffIcon';
import { useLanguage } from '../i18n/useLanguage';
import { useAuth } from '../context/AuthContext';
import ProfileAPI from '../APIs/profile';
import Auth from '../APIs/auth';
import { getCsrfToken } from '../APIs/csrf';
import { MAX_NAME_LENGTH } from '../constants';

interface ApiKey {
  id: number;
  name: string;
  createdAt: string;
  expiresAt: string | null;
}

const Settings = () => {
  const { t } = useLanguage();
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [nameMsg, setNameMsg] = useState('');
  const [bioMsg, setBioMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/v1/api-keys', { credentials: 'include' });
      const data = await res.json();
      setApiKeys(data.apiKeys || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    ProfileAPI.get('/me').then(res => {
      setAvatarUrl(res.data.avatarUrl);
      setName(res.data.name);
      setBio(res.data.bio || '');
    }).finally(() => setLoading(false));
    fetchApiKeys();
  }, []);

  const [avatarError, setAvatarError] = useState('');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError(t.settings.avatarTooLarge);
      return;
    }
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await ProfileAPI.patch('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatarUrl(res.data.avatarUrl);
    } catch { /* upload failed */ }
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      setNameMsg(t.settings.nameRequired);
      return;
    }
    if (name.length > MAX_NAME_LENGTH) {
      setNameMsg(t.common.nameMaxLen);
      return;
    }

    try {
      await ProfileAPI.patch('/me', { name });
      const me = await Auth.get('/me');
      setUser(me.data);
      setNameMsg(t.settings.saved);
      setTimeout(() => setNameMsg(''), 2000);
    } catch { setNameMsg('Error'); }
  };

  const handleSaveBio = async () => {
    try {
      await ProfileAPI.patch('/me', { bio });
      setBioMsg(t.settings.saved);
      setTimeout(() => setBioMsg(''), 2000);
    } catch { setBioMsg('Error'); }
  };

  const handleSavePassword = async () => {
    setPwMsg('');
    setPwError(false);

    if (!oldPassword.trim()) {
      setPwMsg(t.settings.oldPasswordRequired);
      setPwError(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg(t.settings.passwordMismatch);
      setPwError(true);
      return;
    }
    if (newPassword.length < 12) {
      setPwMsg(t.settings.passwordMinLength);
      setPwError(true);
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPwMsg(t.settings.passwordRequirements);
      setPwError(true);
      return;
    }

    try {
      await ProfileAPI.patch('/password', { oldPassword, newPassword });
      setPwMsg(t.settings.saved);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwMsg(''), 2000);
    } catch (err: unknown) {
      setPwError(true);
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        setPwMsg(response?.data?.message || 'Error');
      } else {
        setPwMsg('Error');
      }
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (!confirm(t.settings.confirmDelete)) return;
    try {
      const csrfToken = await getCsrfToken();
      await fetch(`/api/v1/api-keys/${id}`, { method: 'DELETE', credentials: 'include', headers: { 'X-CSRF-Token': csrfToken } });
      setApiKeys(prev => prev.filter(k => k.id !== id));
    } catch { /* ignore */ }
  };

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/50 transition-colors';
  const sectionClass = 'bg-white/5 border border-white/10 rounded-xl p-6 space-y-4';
  const labelClass = 'text-sm font-medium text-text-secondary';

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg-primary text-text-primary flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-accent-purple text-xl animate-pulse">{t.common.loading}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg-primary text-text-primary flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="max-w-lg mx-auto space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan bg-clip-text text-transparent">
            {t.settings.title}
          </h1>

          {/* Avatar */}
          <div className={sectionClass}>
            <p className={labelClass}>{t.settings.avatar}</p>
            <div className="flex items-center gap-4">
              <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-white/10" />
              <div>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  {t.settings.changeAvatar}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleAvatarUpload} className="hidden" />
              </div>
            </div>
            {avatarError && <span className="text-sm text-red-400">{avatarError}</span>}
          </div>

          {/* Id */}
          <div className={sectionClass}>
            <p className={labelClass}>{t.settings.userId}</p>
            <div>{user?.id ?? '-'}</div>
          </div>

          {/* Name */}
          <div className={sectionClass}>
            <p className={labelClass}>{t.settings.name}</p>
            <input
              type="text"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={e => setName(e.target.value)}
              className={inputClass}
            />
            <div className="flex items-center gap-3">
              <Button onClick={handleSaveName}>{t.settings.save}</Button>
              {nameMsg && <span className="text-sm text-accent-blue">{nameMsg}</span>}
            </div>
          </div>

          {/* Bio */}
          <div className={sectionClass}>
            <p className={labelClass}>{t.settings.bio}</p>
            <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={255} rows={3} className={`${inputClass} resize-none`} />
            <div className="flex items-center gap-3">
              <Button onClick={handleSaveBio}>{t.settings.save}</Button>
              {bioMsg && <span className="text-sm text-accent-blue">{bioMsg}</span>}
            </div>
          </div>

          {/* Password — disabled for OAuth users */}
          <div className={`${sectionClass} ${user?.githubId ? 'opacity-50 pointer-events-none' : ''}`}>
              <p className={labelClass}>{t.settings.password}</p>

              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  placeholder={t.settings.oldPassword}
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  disabled={!!user?.githubId}
                  className={`${inputClass} pr-12`}
                />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors" tabIndex={-1} disabled={!!user?.githubId}>
                  {showOld ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder={t.settings.newPassword}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  disabled={!!user?.githubId}
                  className={`${inputClass} pr-12`}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors" tabIndex={-1} disabled={!!user?.githubId}>
                  {showNew ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <input
                type="password"
                placeholder={t.settings.confirmPassword}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={!!user?.githubId}
                className={inputClass}
              />

              <div className="flex items-center gap-3">
                <Button onClick={handleSavePassword} disabled={!!user?.githubId}>{t.settings.save}</Button>
                {pwMsg && <span className={`text-sm ${pwError ? 'text-red-400' : 'text-accent-blue'}`}>{pwMsg}</span>}
              </div>
            </div>

          {/* API Keys */}
          <div className={sectionClass}>
            <p className={labelClass}>{t.settings.apiKeys}</p>
            {apiKeys.length === 0 ? (
              <p className="text-sm text-text-muted">{t.settings.noKeys}</p>
            ) : (
              <div className="space-y-3">
                {apiKeys.map(key => (
                  <div key={key.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{key.name}</p>
                      <p className="text-xs text-text-muted">
                        {t.settings.created}: {new Date(key.createdAt).toLocaleDateString()}
                        {' · '}
                        {t.settings.expires}: {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : t.settings.never}
                      </p>
                    </div>
                    <Button variant="danger" onClick={() => handleDeleteKey(key.id)}>
                      {t.settings.deleteKey}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
