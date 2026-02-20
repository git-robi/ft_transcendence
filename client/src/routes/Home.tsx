import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../i18n/useLanguage';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          {user ? (
            <>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan bg-clip-text text-transparent">
                {t.home.welcome}, {user.name}!
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mt-4">
                <Link
                  to="/game"
                  className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors"
                >
                  <span className="text-text-primary font-medium">{t.home.playLastSettings}</span>
                </Link>
                <Link
                  to="/game"
                  className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors"
                >
                  <span className="text-text-primary font-medium">{t.home.playCustomSettings}</span>
                </Link>
                <Link
                  to="/chat"
                  className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors"
                >
                  <span className="text-text-primary font-medium">{t.header.chat}</span>
                </Link>
                <Link
                  to="/"
                  className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors"
                >
                  <span className="text-text-primary font-medium">{t.home.gameStatistics}</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan bg-clip-text text-transparent tracking-tight">
                TRANSCENDENCE
              </h1>

              <div className="flex gap-4 mt-4">
                <Link
                  to="/login"
                  className="px-8 py-3 rounded-lg border border-accent-purple text-accent-purple hover:bg-accent-purple/10 transition-colors font-medium"
                >
                  {t.logIn.signIn}
                </Link>
                <Link
                  to="/signUp"
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:opacity-90 transition-opacity"
                >
                  {t.header.signUp}
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
