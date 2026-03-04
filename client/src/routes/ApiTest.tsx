import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import Card from "../components/Card";
import { useLanguage } from "../i18n/useLanguage";
import { useState } from "react";

type ApiChoice = 'leaderBoard' | 'stats' | 'feedback' | 'updateProfile'

const ApiTest = () => {
  const { t } = useLanguage();
  const [whichAPI, setWhichAPI] = useState<ApiChoice>('leaderBoard')
  const handleSubmit = async () => {
    try {
      
    } catch {

    }
  }
  
  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/50 transition-colors';
  const sectionClass = 'bg-white/5 border border-white/10 rounded-xl p-6 space-y-4';
  const labelClass = 'text-sm font-medium text-text-secondary';

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Header />
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {/* KEY SECTION*/}
          <div className={sectionClass}>
            <p className={labelClass}>API public key</p>
            <p className={inputClass}>PUBLIC_KEY_PLACEHOLDER</p>
          </div>

          {/* FORM SECTION */}
          <form onSubmit={handleSubmit}>
            <div className={sectionClass}>
              aaa
              
              <Button 
                variant="secondary"
                onClick={handleSubmit} 
              >
                {t.common.submit}
              </Button>
            </div>
          </form>
        </main>
      <Footer />
    </div>
  )
}

export default ApiTest;