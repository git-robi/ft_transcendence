import { useLanguage } from '../i18n/useLanguage';

interface FooterProps {
  showLogout?: boolean;
}

const Footer = ({ showLogout = true }: FooterProps) => {
  const { t } = useLanguage();
  
  return (
    <footer className="absolute bottom-0 w-full py-4 px-6 bg-neutral-800 flex justify-end shadow-[0_0_10px_5px_rgba(255,255,255,0.3)]">
      <div className="flex gap-6">
        {showLogout && (
          <a href="#" className="text-sm text-neutral-300 hover:text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)]">
            {t.footer.logout}
          </a>
        )}
        <a href="#" className="text-sm text-neutral-300 hover:text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)]">
          {t.footer.termsOfService}
        </a>
        <a href="#" className="text-sm text-neutral-300 hover:text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)]">
          {t.footer.privacyPolicy}
        </a>
      </div>
    </footer>
  );
};


export default Footer;