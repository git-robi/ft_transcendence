import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../i18n/useLanguage';
import ApiKeysAPI from '../APIs/api-keys';
import type { ApiKey } from '../types';

const ApiKeys = () => {
  const { t } = useLanguage();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    ApiKeysAPI.get('/')
      .then(res => setKeys(res.data.apiKeys))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!newKeyName.trim()) return;
    setGenerating(true);
    try {
      const res = await ApiKeysAPI.post('/', {
        name: newKeyName.trim(),
        expiresAt: newKeyExpiry || null,
      });
      setGeneratedKey(res.data.apiKey.plainKey);
      setNewKeyName('');
      setNewKeyExpiry('');
      // Refresh list
      const listRes = await ApiKeysAPI.get('/');
      setKeys(listRes.data.apiKeys);
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ApiKeysAPI.delete(`/${id}`);
      setKeys(prev => prev.filter(k => k.id !== id));
    } catch {
      // silently fail
    }
  };

  const handleCopy = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">

          <h1 className="text-2xl font-bold">{t.apiKeys.title}</h1>

          {/* Generated key banner */}
          {generatedKey && (
            <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-xl p-4 space-y-2">
              <p className="text-sm text-accent-purple font-medium">{t.apiKeys.keyWarning}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-sm font-mono break-all">
                  {generatedKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 px-3 py-2 rounded-lg bg-accent-purple/20 text-accent-purple text-sm hover:bg-accent-purple/30 transition-colors"
                >
                  {copied ? t.apiKeys.keyCopied : t.apiKeys.copyKey}
                </button>
              </div>
            </div>
          )}

          {/* Generate form */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t.apiKeys.generate}</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder={t.apiKeys.namePlaceholder}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple"
              />
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={newKeyExpiry}
                  onChange={e => setNewKeyExpiry(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple [color-scheme:dark]"
                />
                <span className="text-xs text-text-muted">{t.apiKeys.noExpiry}</span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !newKeyName.trim()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {t.apiKeys.generate}
              </button>
            </div>
          </div>

          {/* Keys list */}
          <div className="space-y-3">
            {keys.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">{t.apiKeys.noKeys}</p>
            ) : (
              keys.map(key => (
                <div
                  key={key.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{key.name || '—'}</div>
                    <div className="text-xs text-text-muted mt-1">
                      {t.apiKeys.created}: {new Date(key.createdAt).toLocaleDateString()}
                      {key.expiresAt && (
                        <span className="ml-3">
                          {t.apiKeys.expiresAt}: {new Date(key.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(key.id)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-red-400 border border-red-400/20 text-sm hover:bg-red-400/10 transition-colors"
                  >
                    {t.apiKeys.delete}
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApiKeys;
