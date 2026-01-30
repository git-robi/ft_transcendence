import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './routes/Login';
import Home from './routes/Home';
import { LanguageProvider } from './i18n/LanguageProvider';

const App = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
