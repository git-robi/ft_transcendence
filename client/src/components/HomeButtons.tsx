import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useLanguage } from '../i18n/useLanguage';
import type Home from '../routes/Home';

const HomeButtons = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleCurrentUserSettings = () => {
    navigate('/currentUserSettings');
  }

  const handleProfilePage = () =>
    navigate('/profile')

  return (
    <div className="flex justify-center items-center w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-3.5xl">
        {/* Left column - 2 buttons aligned to the top*/}
        <div className='flex flex-col gap-4 items-start'>
          <Button onClick={handleCurrentUserSettings}>
            {t.home.currentUserSettings}
          </Button>
          <Button onClick={handleProfilePage}>
            {t.home.yourProfilePage}
          </Button>
        </div>

        {/* Right column - 3 buttons aligned to the top*/}
        <div className="flex flex-col gap-4 items-start">
          <Button>
            {t.home.gameStatistics}
          </Button>
          <Button>
            {t.home.playLastSettings}
          </Button>
          <Button>
            {t.home.playCustomSettings}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HomeButtons;
