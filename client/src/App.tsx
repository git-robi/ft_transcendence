import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import SignUp from './routes/SignUp';
import LogIn from './routes/LogIn';
import Home from './routes/Home';
import Game from './routes/Game';
import Chat from './routes/Chat';
import TermsOfService from './routes/TermsOfService';
import PrivacyPolicy from './routes/PrivacyPolicy';
import { LanguageProvider } from './i18n/LanguageProvider';
import type { PublicUser } from './types';

const App = () => {
  const [user, setUser] = useState<PublicUser | null>(null);

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
