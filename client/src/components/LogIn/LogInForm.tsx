import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/useLanguage';
import { useAuth } from '../../context/AuthContext';
import Auth from '../../APIs/auth';
import GoogleIcon from '../icons/GoogleIcon';
import OctocatIcon from '../icons/OctocatIcon';

const LogInForm = () => {
  const { t } = useLanguage();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(t.logIn.emailPasswordRequired);
      return;
    }

    try {
      const res = await Auth.post('/login', { email, password });
      setUser(res.data.user);
      navigate('/');
    } catch (err: unknown) {
      let errorMessage = t.logIn.loginFailed;
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        errorMessage = response?.data?.message || errorMessage;
      }
      setError(errorMessage);
    }
  };

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/50 transition-colors';

  return (
    <form onSubmit={handleSignIn} className="space-y-5">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <input
        type="email"
        placeholder={t.logIn.emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={t.logIn.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          )}
        </button>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:opacity-90 transition-opacity"
      >
        {t.logIn.signIn}
      </button>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-text-muted text-sm">{t.logIn.orContinueWith}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`}
          className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-text-primary"
        >
          <OctocatIcon className="w-5 h-5" />
          <span className="text-sm">GitHub</span>
        </button>
        <button
          type="button"
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
          className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-text-primary"
        >
          <GoogleIcon />
          <span className="text-sm">Google</span>
        </button>
      </div>

      <p className="text-center text-sm text-text-muted">
        {t.logIn.noAccount}{' '}
        <button
          type="button"
          onClick={() => navigate('/signUp')}
          className="text-accent-purple hover:text-accent-blue transition-colors"
        >
          {t.logIn.signUp}
        </button>
      </p>
    </form>
  );
};

export default LogInForm;
