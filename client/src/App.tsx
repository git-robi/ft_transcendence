import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './routes/Login';
import Home from './routes/Home';
import Game from './routes/Game';
import TermsOfService from './routes/TermsOfService';
import { LanguageProvider } from './i18n/LanguageProvider';

const App = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/tos" element={<TermsOfService />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
