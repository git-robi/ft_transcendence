import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SignUp from './routes/SignUp';
import LogIn from './routes/LogIn';
import Home from './routes/Home';
import UserSettings from './routes/UserSettings';
import GameSettings from './routes/GameSettings';
import Game from './routes/Game';
import Chat from './routes/Chat';
import TermsOfService from './routes/TermsOfService';
import PrivacyPolicy from './routes/PrivacyPolicy';
import { LanguageProvider } from './i18n/LanguageProvider';
import type { PublicUser } from './types';
import Auth from './APIs/auth';
import { Navigate  } from 'react-router-dom';

Auth.defaults.withCredentials = true;

const App = () => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await Auth.get("/me");
        // Transform the response to match PublicUser type
        const userData = res.data;
        setUser({
          id: userData.id,
          name: userData.profile?.name || '',
          email: userData.email
        });
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/home" /> : <Navigate to="/login" />} />
          <Route path="/home" element={user ? <Home user={user} setUser={setUser}/> : <Navigate to="/login" />} />
          <Route path="/signUp" element={user ? <Navigate to="/home" /> : <SignUp setUser={setUser}/>} />
          <Route path="/login" element={user ? <Navigate to="/home" /> : <LogIn setUser={setUser}/>} />
          <Route path="/userSettings" element={<UserSettings user={user} setUser={setUser}/>} />
          <Route path='/gameSettings' element={<GameSettings user={user} setUser={setUser} />} />
          <Route path="/game" element={<Game />} />
          <Route path='/chat' element={<Chat />} />
          <Route path="/tos" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
