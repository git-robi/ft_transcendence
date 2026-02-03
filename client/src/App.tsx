import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SignUp from './routes/SignUp';
import LogIn from './routes/LogIn';
import Home from './routes/Home';
import Game from './routes/Game';
import Chat from './routes/Chat';
import TermsOfService from './routes/TermsOfService';
import PrivacyPolicy from './routes/PrivacyPolicy';
import { LanguageProvider } from './i18n/LanguageProvider';
import type { PublicUser } from './types';
import Auth from './APIs/auth';

const App = () => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await Auth.get("/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
        console.error(err);
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
          <Route path="/" element={<LogIn setUser={setUser}/>} />
          <Route path="/signUp" element={<SignUp setUser={setUser}/>} />
          <Route path="/home" element={<Home user={user} setUser={setUser}/>} />
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
