import React, { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLanguage } from "../i18n/useLanguage";
import { getCsrfToken } from "../APIs/csrf";
import Button from "./Button";

type Props = {
  setApiKey?: Dispatch<SetStateAction<string | null>>;
};

const ServerKeyGenerator = ({ setApiKey }: Props) => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [plainKey, setPlainKey] = useState<string | null >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createKey = async () => {
    if (!name.trim()) {
      setError(t.apiTest.keyNameRequired);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body: any = { name };
      if (expiresAt)
        body.expiresAt = expiresAt.toISOString();
      const csrfToken = await getCsrfToken();
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.message ?? 'Failed to create key!')
      }
      const data = await res.json();
      const key = data?.apiKey?.plainKey ?? null;
      setPlainKey(key);
      if (setApiKey) setApiKey(key);
    } catch (err: any) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!plainKey) return;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(plainKey);
        return;
      } catch {
        setError("Automatic copy failed — please copy the key manually from the prompt.");
      }
    }
    window.prompt(t.apiTest.windowPromptCopyErr, plainKey);
  };

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/50 transition-colors';
  const sectionClass = 'bg-white/5 border border-white/10 rounded-xl p-6 space-y-4';
  const labelClass = 'text-sm font-medium text-text-secondary';

  return (
    <div>
      {!plainKey ? (
        <div>
          <div className={sectionClass}>
            <p className={labelClass}>{t.apiTest.keyGenSection}</p>
            <input 
              className={inputClass}
              placeholder={t.apiTest.keyNamePlaceholder}
              value={name}
              maxLength={50}
              onChange={(e) => setName(e.target.value)}
            />
            <span className={labelClass}>{t.apiTest.expiresAt}</span>
            <DatePicker
              selected={expiresAt}
              onChange={(d: Date | null) => setExpiresAt(d)}
              dateFormat="dd/MM/yyyy"
              placeholderText={t.apiTest.expiresAtPlaceholder}
              className={inputClass}
              isClearable
            />
            <div>
              <Button
                variant="primary"
                onClick={createKey}
                type="submit"
              >
                {loading ? t.common.generating : t.apiTest.generateServKeyButton}
              </Button> 
              </div>

          </div>
          {error && 
            <div className="text-red-500">
              {error}
            </div>}
        </div>
      ) : (
        <div>
          <div>{t.apiTest.copyWarning}</div>
          <div className={inputClass}>
            {plainKey}
          </div>
          <Button 
            onClick={copy}
            type="button"
            variant="secondary"
            className="mr-3"
          >
            {t.common.copyToClipboard}
          </Button>
          <Button 
            onClick={() => { setPlainKey(null); if (setApiKey) setApiKey(null); }}
            type="button"
            variant="secondary"
          >
            {t.apiTest.hideKey}
          </Button>
          <div>{t.apiTest.warningAboutDisappearing}</div>
        </div>
      )}
    </div>
  )
}

export default ServerKeyGenerator;