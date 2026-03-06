import { useState } from "react";
import Button from "./Button";

const ServerKeyGenerator = () => {
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [plainKey, setPlainKey] = useState<string | null >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createKey = async () => {
    setLoading(true);
    setError(null);
    try {
      const body: any = { name };
      if (expiresAt) 
        body.expiresAt = expiresAt;
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.message ?? "Failed to create key")
      }
      const data = await res.json();
      setPlainKey(data?.apiKey?.plainKey ?? null);
    } catch (err: any) {
      setError(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!plainKey) return;
    try {
      await navigator.clipboard.writeText(plainKey);
    } catch {
      const ta = document.createElement("textarea");
      ta.value= plainKey;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/50 transition-colors';
  const sectionClass = 'bg-white/5 border border-white/10 rounded-xl p-6 space-y-4';
  const labelClass = 'text-sm font-medium text-text-secondary';

  return (
    <div>
      {!plainKey ? (
        <div>
          <div className={sectionClass}>
            <input 
              placeholder="key name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="date"
              onChange={(e) =>
                setExpiresAt(e.target.value ?
                  new Date(e.target.value).toISOString() : null)
              }
            />
            <Button
              variant="primary"
              onClick={createKey}
              type="submit"
            >
              {loading ? "Generating..." : "Generate server key"}
            </Button>
          </div>
          {error && 
            <div className="text-red-500">
              {error}
            </div>}
        </div>
      ) : (
        <div>
          <div>
            Copy this API key now as is shown only temporary!
          </div>
          <div className="inputClass">
            {plainKey}
          </div>
          <Button 
            onClick={copy}
            type="button"
          >
            Copy to clipboard
          </Button>
          <Button 
            onClick={() => setPlainKey(null)}
            type="button"
          >
            Hide the key
          </Button>
          <div>
            This key is shown only in-memory and will disappear when you refresh the page!
          </div>
        </div>

      )}
    </div>
  )
}

export default ServerKeyGenerator;