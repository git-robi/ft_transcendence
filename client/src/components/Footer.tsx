import { useLanguage } from '../i18n/useLanguage';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

interface FooterProps {
  showTOS?: boolean;
  showPrivacy?: boolean;
}

const Footer = ({ showTOS = true, showPrivacy = true }: FooterProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const linkClass = 'text-xs md:text-sm text-text-muted hover:text-text-primary transition-colors';

  return (
    <footer className="mt-auto">
      <div className="h-px bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan" />
      <div className="bg-bg-primary px-6 py-4 flex items-center justify-between md:flex-wrap md:justify-end gap-4">
        <div className="flex flex-col items-start gap-1 flex-1 min-w-0 md:flex-none md:flex-row md:items-center md:gap-4">
          {showTOS && (
            <button onClick={() => navigate('/tos')} className={linkClass}>
              {t.footer.termsOfService}
            </button>
          )}
          {showPrivacy && (
            <button onClick={() => navigate('/privacy')} className={linkClass}>
              {t.footer.privacyPolicy}
            </button>
          )}
        </div>
        <div className="flex-shrink-0">
          <LanguageSelector />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
