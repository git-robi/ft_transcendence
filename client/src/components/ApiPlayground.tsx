import { useState } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import Auth from '../APIs/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ENDPOINTS = [
  { id: 'leaderboard', method: 'GET', path: '/public/leaderboard' },
  { id: 'stats', method: 'GET', path: '/public/stats/:id' },
  { id: 'feedback', method: 'POST', path: '/public/feedback' },
  { id: 'profile', method: 'PUT', path: '/public/profile' },
  { id: 'account', method: 'DELETE', path: '/public/account' },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-green-400',
  POST: 'text-accent-purple',
  PUT: 'text-accent-blue',
  DELETE: 'text-red-400',
};

const ApiPlayground = () => {
  const { t } = useLanguage();
  const { logout, setUser } = useAuth();

  const [selected, setSelected] = useState(ENDPOINTS[0]);
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!apiKey.trim()) return;
    setSending(true);
    setResponse(null);
    setStatus(null);

    try {
      const res = await fetch(BASE_URL + selected.path, {
        method: selected.method,
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
      });
      setStatus(res.status);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));

      if (res.ok) {
        if (selected.id === 'account') await logout();
        if (selected.id === 'profile') {
          const me = await Auth.get('/me');
          setUser(me.data);
        }
      }
    } catch {
      setStatus(0);
      setResponse('Network error — could not reach the server.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{t.apiPlayground.title}</h2>

      <input
        type="text"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder={t.apiPlayground.apiKeyPlaceholder}
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple"
      />

      <div className="space-y-2">
        {ENDPOINTS.map(ep => (
          <button
            key={ep.id}
            onClick={() => { setSelected(ep); setResponse(null); setStatus(null); }}
            className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
              selected.id === ep.id
                ? 'bg-accent-purple/10 border-accent-purple/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className={`font-bold text-sm mr-2 ${METHOD_COLORS[ep.method] || 'text-text-primary'}`}>{ep.method}</span>
            <span className="text-sm text-text-secondary">{ep.path}</span>
          </button>
        ))}
      </div>

      <Button className="w-full py-3" onClick={handleSend} disabled={sending || !apiKey.trim()}>
        {sending ? '...' : t.apiPlayground.send}
      </Button>

      {response !== null && (
        <div>
          {status !== null && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              status >= 200 && status < 300 ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
            }`}>
              {status}
            </span>
          )}
          <pre className="bg-white/5 border border-white/10 rounded-lg p-4 mt-2 text-sm overflow-x-auto whitespace-pre-wrap break-words font-mono">
            {response}
          </pre>
        </div>
      )}
    </section>
  );
};

export default ApiPlayground;
