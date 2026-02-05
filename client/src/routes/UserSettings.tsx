import Header from '../components/Header';
import Footer from '../components/Footer';
import type { PublicUser } from '../types';
import AvatarSection from '../components/UserSettings/AvatarSection';

interface UserSettingsProps {
  user: PublicUser | null;
  setUser: (user: PublicUser | null) => void;

}

const UserSettings = ({ user, setUser }: UserSettingsProps) => {
  return (
    <div className="min-h-screen bg-neutral-700 text-white flex flex-col">
      <Header titleKey='userSettings' />
      {/*Main content*/}
      <main>
        <div>
          <AvatarSection />
        </div>
      </main>

      <Footer setUser={setUser} />
    </div>
  )
}

export default UserSettings;