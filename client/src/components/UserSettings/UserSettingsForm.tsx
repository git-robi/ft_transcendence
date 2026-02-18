import { useEffect, useState } from 'react';
import { useLanguage } from '../../i18n/useLanguage';
import profileAPI from '../../APIs/profile'
import Input from '../Input';
import Button  from '../Button';

const UserSettingsForm = () => {
  const { t } = useLanguage();
  const [currentName, setCurrentName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [currentBio, setBio] = useState('');

  useEffect(() => {
    profileAPI.get('/me')
      .then(res => {
        setCurrentName(res.data.name || '');
        setBio(res.data.bio || '');
      })
      .catch(() => {})
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await profileAPI.patch('/me', { name: currentName });
      alert(t.userSettings.nameUpdated)
    } catch (error) {
      console.error('Failed to update name:', error);
      alert(t.userSettings.nameUpdateFailed)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    //validation
    if (!oldPassword) {
      setPasswordError(t.userSettings.oldPasswordRequired);
      return;
    }
    if (!newPassword) {
      setPasswordError(t.userSettings.newPasswordRequired);
      return;
    }
    if (newPassword.length < 12) {
      setPasswordError(t.userSettings.newPasswordTooShort);
      return;
    }
    if (newPassword === oldPassword) {
      setPasswordError(t.userSettings.passwordSameAsOld)
      return;
    }
    if (!confirmPassword) {
      setPasswordError(t.userSettings.confirmPasswordRequired)
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t.userSettings.passwordsMismatch);
      return;
    }

    try {
      await profileAPI.patch('/password', {
        oldPassword,
        newPassword
      });
      //clear fields on success
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      alert(t.userSettings.passwordUpdated)
    } catch (error) {
      console.error('Failed to update password:', error);
      setPasswordError(t.userSettings.passwordUpdateFailed)
    }
  }

  const handleBioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await profileAPI.patch('/me', { bio: currentBio });
      alert(t.userSettings.bioUpdated);
    } catch (error) {
      console.error('Failed to update bio:', error);
      alert(t.userSettings.bioUpdateFailed);
    }
  }

  return (
    <div className='items-left gap-6 px-6 mb-8'>
      {/* Name section*/}
      <form onSubmit={handleSubmit} className='space-y-2 mb-8'>
        <div>{t.userSettings.changeYourName}</div>
        <Input 
          type="text"
          placeholder={t.userSettings.namePlaceholder}
          value={currentName}
          onChange={(e) => setCurrentName(e.target.value)}
          className='mb-0'
        />
        <div className='text-sm text-gray-400 mt-1 px-4'>{t.userSettings.nameHint}</div>
        <Button type="submit">
          {t.userSettings.submitChange}
        </Button>
      </form>

      {/* Password section */}
      <form onSubmit={handlePasswordChange} className='space-y-4 mb-8'>
        <div>{t.userSettings.changePassword}</div>
        <div>
          <label className='block mb-1 text-sm'>{t.userSettings.oldPassword}</label>
          <Input 
            type={showPassword ? 'text' : 'password'}
            placeholder={t.userSettings.oldPasswordPlaceholder}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div>
          <label className='block mb-1 text-sm'>{t.userSettings.newPassword}</label>
          <Input 
            type={showPassword ? 'text' : 'password'}
            placeholder={t.userSettings.newPasswordPlaceholder}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className='text-sm text-gray-400 mt-1 px-4'>{t.signUp.passwordComment}</div>
        </div>

        <div>
          <label className='block mb-1 text-sm'>{t.userSettings.confirmNewPassword}</label>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder={t.userSettings.confirmNewPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        
        <div className='-mt-2'>
          <label className='text-sm'>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className='w-4 h-4 mr-2'
            />
            {t.userSettings.showPassword}
          </label>
        </div>
        {passwordError && (
          <div className='text-red-500 text-sm'>{passwordError}</div>
        )}

        <Button type='submit'>
          {t.userSettings.changePasswordButton}
        </Button>
      </form>


      
      {/* Bio section */}
      <form onSubmit={handleBioSubmit} className='space-y-4 mb-8'>
        <div>{t.userSettings.editYourBio}</div>
        <textarea
          placeholder={t.userSettings.bioPlaceholder}
          value={currentBio}
          onChange={(e) => setBio(e.target.value)}
          className='w-full h-32 p-3 bg-white text-neutral-900 rounded-lg resize-none align-top'
        />
        <Button type='submit'>
          {t.userSettings.saveBio}
        </Button>
      </form>
    </div>
  )
}
  
export default UserSettingsForm;