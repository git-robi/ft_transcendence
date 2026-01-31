import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import { useLanguage } from '../../i18n/useLanguage';
import Input from '../Input';

const SignUpForm = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const handleSubmit = () => {
    navigate('/home');
  };

  return (
    <div className="w-80">
      <form className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder={t.signUp.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className='text-sm text-gray-400 mt-1 px-4'>{t.signUp.nameComment}</div>
        </div>
        <div>
          <Input
            type="email"
            placeholder={t.signUp.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className='text-sm text-gray-400 mt-1 px-4'>{t.signUp.emailComment}</div>
        </div>
        <div>
          <Input
            type="password"
            placeholder={t.signUp.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className='text-sm text-gray-400 mt-1 px-4'>{t.signUp.passwordComment}</div>
        </div>
        <label className='flex items-center justify-left gap-2 text-sm'>
          <input
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
            className='w-4 h-4'
          />
          {t.signUp.keepLoggedIn}
        </label>
        <div>
          <Button onClick={handleSubmit}>{t.signUp.submit}</Button>
        </div>
      </form>
    </div>
  )
}

export default SignUpForm;