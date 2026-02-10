import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import { useLanguage } from '../../i18n/useLanguage';
import type { PublicUser } from '../../types';

interface HomeButtonsProps {
  user: PublicUser | null;
  //setUser: (user: PublicUser | null) => void;
}
const HomeButtons = ({ user }: HomeButtonsProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleUserSettings = () => {
    navigate('/userSettings');
  };

  const handleProfilePage = () => {
    navigate('/profile');
  };

  const handlePlayLast = () => {
    navigate('/game');
  };

  return (
    <div className="flex flex-col items-center w-full gap-8">
      {user && (
        <div className="text-center text-xl">
          {t.home.welcome}, {user.name}!
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-3.5xl">
        {/* Left column - 2 buttons aligned to the top*/}
        <div className='flex flex-col gap-4 items-start'>
          <Button onClick={handleUserSettings}>
            {t.home.userSettings}
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
          <Button onClick={handlePlayLast}>
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
