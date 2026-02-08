import { useEffect, useState } from 'react';
import { useLanguage } from '../../i18n/useLanguage';
import profileAPI from '../../APIs/profile'
import Input from '../Input';

const UserSettingsForm = () => {
  const { t } = useLanguage();
  const [currentName, setCurrentName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentBio, setBio] = useState('');

  useEffect(() => {
    profileAPI.get('/me')
      .then(res => setCurrentName(res.data.name || ''))
      .catch(() => {})
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;

    try {
      await profileAPI.patch('/me', { name });
    } catch (error) {
      console.error('Failed to update name:', error);
    }
  }

  return (
    <div className='items-left gap-6 px-6'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Name section*/}
        <div>Your Name</div>
        <Input 
          type="text"
          placeholder="Your Name"
          value={currentName}
          onChange={(e) => setCurrentName(e.target.value)}
        />
        <div className='pb-6'>Only alphanumeric (letters and numbers) + apostrophe (')</div>
        
        {/* Password section */}
        <div>Change Password</div>
        <Input 
          type={showPassword ? 'text' : 'password'}
          placeholder='Your new Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className='w-4 h-4'
            />
            Show Password
          </label>
        </div>

        {/* Bio section */}
        <div>Edit Your Bio</div>
        <textarea
          placeholder='Your Bio'
          value={currentBio}
          onChange={(e) => setBio(e.target.value)}
          className='w-full h-32 p-3 bg-neutral-800 text-white rounded-lgresize-none align-top'
        />
      </form>
    </div>
  )
}
  
export default UserSettingsForm;