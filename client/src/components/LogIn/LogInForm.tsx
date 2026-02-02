import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import GoogleButton from '../GoogleButton';
import Input from '../Input';
import { useLanguage } from '../../i18n/useLanguage';
import Auth from '../../APIs/auth';
import type { PublicUser } from '../../types';

interface LogInFormProps {
  setUser: (user: PublicUser | null) => void;
}

const LogInForm = ({ setUser }: LogInFormProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      console.error("Name and password are required");
      return;
    }
    try {
      const res = await Auth.post('/login', {email, password} )
      setUser(res.data.user);
      navigate('/home');
    } catch (error) {
      console.log(error);
    }  
  };

  const handleSignUp = () => {
    navigate('/signUp')
  };

  return (
    <div className="w-80">
      <form onSubmit={handleSignIn} className="space-y-4">
        <Input
          type="text"
          placeholder={t.logIn.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <div className="space-y">
          <Input
            type="password"
            placeholder={t.logIn.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="text-left">
            <a href="#" className="text-sm text-neutral-300 hover:text-white underline">
              {t.logIn.forgotPassword}
            </a>
          </div>
        </div>

        <Button type="submit">
          {t.logIn.signIn}
        </Button>

        <label className="flex items-center justify-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
            className="w-4 h-4"
          />
          {t.logIn.keepLoggedIn}
        </label>

        <div className="space-y-2 pt-4">
          <Button variant="github">{t.logIn.githubLogIn}</Button>
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
