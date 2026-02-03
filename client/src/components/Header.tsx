import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../i18n/useLanguage';

interface HeaderProps {
  titleKey?: keyof typeof import('../i18n/translations').translations.en.header;
}

const Header = ({ titleKey = 'logInSignUp' }: HeaderProps) => {
  const { t } = useLanguage();
  
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-light text-dark shadow-[0_2px_5px_4px_rgba(0,0,0,0.5)]">
      <div className="text-sm font-medium">{t.header[titleKey]}</div>
      <LanguageSelector />
    </header>
  );
};

export default Header;
