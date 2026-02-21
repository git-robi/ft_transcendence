import Header from '../components/Header';
import Footer from '../components/Footer';
import ApiKeysSection from '../components/ApiKeysSection';
import ApiPlayground from '../components/ApiPlayground';
import { useLanguage } from '../i18n/useLanguage';

const PublicApi = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-10">
          <h1 className="text-2xl font-bold">{t.publicApi.title}</h1>
          <a
            href="/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors text-sm"
          >
            <span className="font-medium">{t.publicApi.swaggerDocs}</span>
            <span className="text-text-muted ml-2">{t.publicApi.swaggerDesc}</span>
          </a>
          <ApiKeysSection />
          <ApiPlayground />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicApi;
