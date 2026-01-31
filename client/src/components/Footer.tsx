import { useLanguage } from '../i18n/useLanguage';
import { useNavigate } from 'react-router-dom';
import FooterButton from './Footer/FooterButton';

interface FooterProps {
  showLogout?: boolean,
  showHome?: boolean,
  showChat?: boolean,
  showTOS?:boolean,
  showPrivacy?:boolean;
}

const Footer = ({ showLogout = true, showHome = true, showChat = true, showTOS = true, showPrivacy = true }: FooterProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleHomeClick = () => {
    navigate('/home');
  };

  const handleLogoutClick = () => {
    navigate('/');
  }

  const handleTOSClick = () => {
    navigate('/tos')
  }
  
  const handlePrivacyClick = () => {
    navigate('/privacy')
  }
  const handleChat = () => {
    navigate('/chat')
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
          <FooterButton onClick={handleLogoutClick}>
            {t.footer.logout}
          </FooterButton>
        )}
        {showChat && (
          <FooterButton onClick={handleChat}>
            {t.footer.chat}
          </FooterButton>

        )}
        {showTOS && (
          <FooterButton onClick={handleTOSClick}>
              {t.footer.termsOfService}
          </FooterButton>
        )}
        {showPrivacy && (
          <FooterButton onClick={handlePrivacyClick}>
              {t.footer.privacyPolicy}
          </FooterButton>
        )}
      </div>
    </footer>
  );
};


export default Footer;