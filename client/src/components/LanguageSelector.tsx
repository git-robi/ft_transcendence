import { useState } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import type { Language } from '../i18n/translations';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [showLanguages, setShowLanguages] = useState(false);

  const languages: { code: Language; name: string }[] = [
    { code: 'es', name: 'Castellano' },
    { code: 'ca', name: 'Català' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'pl', name: 'Polski' },
  ];

  const currentLanguageName = languages.find(lang => lang.code === language)?.name || 'English';

  return (
    <div className="relative">
      <button
        onClick={() => setShowLanguages(!showLanguages)}
        className="text-sm hover:text-neutral-600 px-4 py-2 bg-white text-dark rounded transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]"
      >
        {currentLanguageName}
      </button>
      {showLanguages && (
        <div className="absolute right-0 mt-2 w-40 bg-white text-dark rounded shadow-lg z-10 border border-neutral-700">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setShowLanguages(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-neutral-600 hover:text-white text-sm"
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
