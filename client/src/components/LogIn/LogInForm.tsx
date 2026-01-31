import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import GoogleButton from '../GoogleButton';
import Input from '../Input';
import { useLanguage } from '../../i18n/useLanguage';

const LogInForm = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleSignIn = () => {
    navigate('/home');
  };

  const handleSignUp = () => {
    navigate('/signUp')
  };

  return (
    <div className="w-80">
      <form  className="space-y-4">
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

        <Button type="submit" onClick={handleSignIn}>
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
