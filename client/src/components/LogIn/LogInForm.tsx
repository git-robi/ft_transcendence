import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import GoogleButton from '../GoogleButton';
import Input from '../Input';
import { useLanguage } from '../../i18n/useLanguage';
import Auth from '../../APIs/auth';
import Profile from '../../APIs/profile';
import type { PublicUser } from '../../types';
import normalizeApiUser from '../../utils/normalizeUser';

interface LogInFormProps {
  setUser: (user: PublicUser | null) => void;
}

const LogInForm = ({ setUser }: LogInFormProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handles the sign-in form submission.
   *
   * Prevents the default form submission, validates the email and password fields,
   * attempts to authenticate the user via the Auth API, and fetches the user's profile data.
   * On successful login, sets the user context and navigates to the home page.
   * Handles and displays errors if authentication fails.
   *
   * @param e - The form submission event.
   */
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }
    try {
      const res = await Auth.post('/login', { email, password });
      const userData = res.data.user as { id: string | number; name?: string; email: string };

      type profileData = { name?: string; [k: string]: any}
      let profileData: Partial<PublicUser> = {};
      try {
        const profileRes = await Profile.get('/me');
        profileData = profileRes.data as Partial<PublicUser>;
      } catch {
        profileData = {};
      }
      setUser(normalizeApiUser({ ...userData, profile: profileData }));
      navigate('/home');
    } catch (err: unknown) {
      console.error('Login failed:', err);

      let errorMessage = 'Login failed. Please try again.';

      // clearer message for network/backend down
      if (err && typeof err === 'object' && 'message' in err && (err as any).message === 'Network Error') {
        errorMessage = 'Cannot reach backend — is the server running?';
      } else if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        errorMessage = response?.data?.message || errorMessage;
      }

      setError(errorMessage);
    }
  };

  const handleSignUp = () => {
    navigate('/signUp')
  };

  return (
    <div className="w-80">
      <form onSubmit={handleSignIn} className="space-y-4">
        {error && (
          <div className="bg-red-500 text-white p-3 rounded text-sm">
            {error}
          </div>
        )}
        
        <Input
          type="text"
          placeholder={t.logIn.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t.logIn.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4"
              />
              {t.logIn.showPassword}
            </label>
            {/*<a href="#" className="text-neutral-300 hover:text-white underline">
              {t.logIn.forgotPassword}
            </a>*/}
          </div>
        </div>

        <Button type="submit">
          {t.logIn.signIn}
        </Button>

        {/*<label className="flex items-center justify-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
            className="w-4 h-4"
          />
          {t.logIn.keepLoggedIn}
        </label>*/}

        <div className="space-y-2 pt-4">
          <Button 
            variant="github" 
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL ?? '/api/v1'}/auth/github`}
          >
            {t.logIn.githubLogIn}
          </Button>
          <GoogleButton />
        </div>

        <div className="pt-4" onClick={handleSignUp}>
          <Button variant="secondary" >
            {t.logIn.signUp}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LogInForm;
