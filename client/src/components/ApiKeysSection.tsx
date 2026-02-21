import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import Button from './Button';
import ApiKeysAPI from '../APIs/api-keys';
import type { ApiKey } from '../types';

const ApiKeysSection = () => {
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

  const inputClass = 'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple';

  if (loading) {
    return <div className="text-accent-purple text-xl animate-pulse text-center py-8">{t.common.loading}</div>;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{t.apiKeys.title}</h2>

      {generatedKey && (
        <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-xl p-4 space-y-2">
          <p className="text-sm text-accent-purple font-medium">{t.apiKeys.keyWarning}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-sm font-mono break-all">
              {generatedKey}
            </code>
            <Button variant="ghost" onClick={handleCopy} className="shrink-0">
              {copied ? t.apiKeys.keyCopied : t.apiKeys.copyKey}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-secondary">{t.apiKeys.generate}</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            placeholder={t.apiKeys.namePlaceholder}
            className={inputClass}
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
          <Button onClick={handleGenerate} disabled={generating || !newKeyName.trim()}>
            {t.apiKeys.generate}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {keys.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-4">{t.apiKeys.noKeys}</p>
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
              <Button variant="danger" onClick={() => handleDelete(key.id)} className="shrink-0">
                {t.apiKeys.delete}
              </Button>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ApiKeysSection;
