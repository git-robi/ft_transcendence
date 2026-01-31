import { useLanguage } from '../i18n/useLanguage';
import { useNavigate } from 'react-router-dom';
import FooterButton from './Footer/FooterButton';

interface FooterProps {
  showLogout?: boolean,
  showHome?: boolean;
}

const Footer = ({ showLogout = true, showHome = true }: FooterProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleHomeClick = () => {
    navigate('/home');
  };

  const handleTOSClick = () => {
    navigate('/tos')
  }

  return (
    <footer className="w-full py-4 px-6 bg-neutral-800 flex justify-end shadow-[0_0_10px_5px_rgba(255,255,255,0.3)] mt-auto">
      <div className="flex gap-6">
        {showHome && (
          <FooterButton onClick={handleHomeClick}>
            {t.footer.home}
          </FooterButton>
        )}
        {showLogout && (
          <FooterButton>
            {t.footer.logout}
          </FooterButton>
        )}
        <FooterButton onClick={handleTOSClick}>
            {t.footer.termsOfService}
        </FooterButton>
        <FooterButton>
            {t.footer.privacyPolicy}
        </FooterButton>
      </div>
    </footer>
  );
};


export default Footer;