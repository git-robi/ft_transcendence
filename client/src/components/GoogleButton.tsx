import { useLanguage } from '../i18n/useLanguage';
import GoogleIcon from './icons/GoogleIcon';

const GoogleButton = () => {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3 bg-neutral-800 text-white border border-neutral-600 px-6 py-3 rounded font-medium transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] hover:bg-neutral-700"
    >
      <GoogleIcon />
      <span className="text-sm font-medium text-white">
        {t.login.googleLogin}
      </span>
    </button>
  );
};

export default GoogleButton;