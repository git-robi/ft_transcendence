import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-bg-primary">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan bg-clip-text text-transparent tracking-tight">
          TRANSCENDENCE
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              {t.header.home}
            </Link>
            {user && (
              <>
                <Link to="/game" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t.header.game}
                </Link>
                <Link to="/chat" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t.header.chat}
                </Link>
              </>
            )}
          </nav>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-primary hidden sm:inline">{user.name}</span>
              <button
                onClick={logout}
                className="text-sm px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
              >
                {t.footer.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
              >
                {t.logIn.signIn}
              </Link>
              <Link
                to="/signUp"
                className="text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue text-white hover:opacity-90 transition-opacity"
              >
                {t.header.signUp}
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan" />
    </header>
  );
};

export default Header;
