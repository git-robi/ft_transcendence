import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import { useLanguage } from '../../i18n/useLanguage';
import Input from '../Input';
import Auth from '../../APIs/auth';
import type { PublicUser } from '../../types';

interface SignUpFormProps {
  setUser: (user: PublicUser | null) => void;
}

const SignUpForm = ({ setUser }: SignUpFormProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  //const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await Auth.post('/register', { 
        name: name.trim(), 
        email: email.trim(), 
        password 
      });
      
      // Transform the response to match PublicUser type
      const userData = res.data.user;
      setUser({
        id: userData.id,
        name: userData.profile?.name || userData.name || '',
        email: userData.email
      });
      navigate('/home');
    } catch (err: unknown) {
      console.error('Registration failed - Full error:', err);
      console.error('Error type:', typeof err);
      console.error('Error object:', JSON.stringify(err, null, 2));
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        console.error('Response data:', response?.data);
        errorMessage = response?.data?.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogIn = () => {
    navigate('/');
  };

  return (
    <div className="w-80">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500 text-white p-3 rounded text-sm">
            {error}
          </div>
        )}
        
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
            type={showPassword ? "text" : "password"}
            placeholder={t.signUp.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className='flex items-center justify-between text-sm'>
            <label className='flex items-center gap-2 text-gray-400 cursor-pointer'>
              <input
               type="checkbox"
               checked={showPassword}
               onChange={(e) => setShowPassword(e.target.checked)}
               className="w-4 h-4"
               />
               {t.signUp.showPassword}
            </label>
          </div>
          <div className='text-sm text-gray-400 mt-1 px-4'>{t.signUp.passwordComment}</div>
        </div>
        {/**<label className='flex items-center justify-left gap-2 text-sm'>
          <input
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
            className='w-4 h-4'
          />
          {t.signUp.keepLoggedIn}
        </label>*/}
        <div>
          <Button type="submit">
            {loading ? 'Signing up...' : t.signUp.submit}
          </Button>
        </div>
        
        <div className="text-center text-sm">
          <span className="text-gray-400">Already have an account? </span>
          <button
            type="button"
            onClick={handleLogIn}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Log In
          </button>
        </div>
      </form>
    </div>
  )
}

export default SignUpForm;