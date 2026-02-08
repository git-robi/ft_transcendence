import Header from '../components/Header';
import Footer from '../components/Footer';
import type { PublicUser } from '../types';
import AvatarSection from '../components/UserSettings/AvatarSection';
import UserSettingsForm from '../components/UserSettings/UserSettingsForm';

interface UserSettingsProps {
  user: PublicUser | null;
  setUser: (user: PublicUser | null) => void;

}

const UserSettings = ({ user, setUser }: UserSettingsProps) => {
  return (
    <div className="min-h-screen bg-neutral-700 text-white flex flex-col">
      <Header titleKey='userSettings' />
      {/*Main content*/}
      <main className='flex-1 p-6'>
        <div className='grid grid-cols-2 gap-6 max-w-7xl mx-auto'>
          {/* Left column - user settings*/}
          <div className='w-full'>
            <AvatarSection />
            <UserSettingsForm />
          </div>
          {/* right column - friends*/}
          <div>
            
          </div>
        </div>
      </main>

      <Footer setUser={setUser} />
    </div>
  )
}

export default UserSettings;