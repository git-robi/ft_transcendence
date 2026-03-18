import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import ServerKeyGenerator from "../components/ServerKeyGenerator";
import { useLanguage } from "../i18n/useLanguage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ApiChoice = '' | 'leaderboard' | 'stats' | 'feedback' | 'profile' | 'account'

const ApiTest = () => {
  const { t } = useLanguage();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [whichAPI, setWhichAPI] = useState<ApiChoice>('');
  const [statsUserId, setStatsUserId] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [profilePayload, setProfilePayload] = useState(
    '{\n  "name": "",\n "bio": ""\n}'
  );
  const [serverResponse, setServerResponse]= useState("");

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/50 transition-colors';
  const sectionClass = 'bg-white/5 border border-white/10 rounded-xl p-6 space-y-4';
  const labelClass = 'text-sm font-medium text-text-secondary';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!whichAPI) {
      setServerResponse(t.apiTest.noOperationErr);
      return;
    }

    let url = "";
    const API_BASE = "/api/v1/public";
    const headers: Record<string,string> = { "Content-Type": "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    let opts: RequestInit = { method: "GET", credentials: "include", headers };
    switch (whichAPI) {
      case "leaderboard":
        url = `${API_BASE}/leaderboard`;
        break;
      case "stats": {
        const id = statsUserId.trim() || user?.id;
        if (!id) {
          setServerResponse(t.apiTest.statsIdRequired);
          return;
        }
        url = `${API_BASE}/stats/${id}`;
        break;
      }
      case "feedback":
        if (!feedback.trim()) {
          setServerResponse(t.apiTest.feedbackRequired);
          return;
        }
        url = `${API_BASE}/feedback`;
        opts = {
          method: "POST",
          headers,
          body: JSON.stringify({ text: feedback }),
          credentials: "include",
        };
        break;
      case "profile":
        url = `${API_BASE}/profile`
        opts = {
          method: "PUT",
          headers,
          body: profilePayload,
          credentials: "include"
        };
        break;
      case "account":
        url = `${API_BASE}/account`;
        opts = { 
          method: "DELETE", 
          headers, 
          credentials: "include" };
        break;
    }

    try {
      const res = await fetch(url, opts);
      let bodyText: string;
      try {
        const data = await res.json();
        bodyText = JSON.stringify(data, null, 2);
      } catch {
        bodyText = await res.text();
      }
      setServerResponse(`${res.status} ${res.statusText}\n${bodyText}`);

      // If account was deleted successfully, clear user and redirect home
      if (whichAPI === 'account' && res.ok) {
        setUser(null);
        navigate('/');
        return;
      }
        
    } catch (err) {
      setServerResponse(`request failed: ${err}`);
    }
  };
  
  return (
    <div className="min-h-dvh bg-bg-primary text-text-primary flex flex-col">
      <Header />
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {/* KEY SECTION*/}
          <div className={sectionClass}>
            <div>{t.apiTest.apiKeySection}</div>
            <ServerKeyGenerator setApiKey={setApiKey} />
            <input 
              className={inputClass} 
              placeholder={t.apiTest.pastePublicKeyHere}
              value={apiKey ?? ""}
              onChange={e => setApiKey(e.currentTarget.value)}
            />
          </div>

          {/* FORM SECTION */}
          
          <form onSubmit={handleSubmit}>
            <div className={sectionClass}>
              <div>{t.apiTest.selectApiAction}</div>
              {/* GET THE GAME LEADERBOARD*/}
              <div>
                <Button
                  type="button"
                  variant={whichAPI === 'leaderboard' ? 'primary' : 'secondary'}
                  onClick={() => setWhichAPI('leaderboard')}
                >
                  {t.apiTest.getLeaderboard}
                </Button>                
              </div>

              {/* GET PLAYER STATISTICS*/}
              <div>
                <Button
                  type="button"
                  variant={whichAPI === 'stats' ? 'primary' : 'secondary'}
                  onClick={() => setWhichAPI('stats')}
                >
                  {t.apiTest.getStatistics}
                </Button>                
                {whichAPI === 'stats' && (
                  <input
                    className={inputClass}
                    placeholder={t.apiTest.statsUserIdPlaceholder}
                    value={statsUserId}
                    onChange={(e) => setStatsUserId(e.currentTarget.value)}
                  />
                )}
              </div>

              {/* SUBMIT FEEDBACK*/}
              <div>
                <Button
                  type="button"
                  variant={whichAPI === 'feedback' ? 'primary' : 'secondary'}
                  onClick={() => setWhichAPI('feedback')}
                >
                  {t.apiTest.submitFeedback}
                </Button>
                {whichAPI === 'feedback' && (
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={t.apiTest.feedbackPlaceholder}
                    maxLength={500}
                    rows={7}
                    className={`${inputClass} resize-none`}
                  />
                )}
              </div>

              {/* UPDATE USER PROFILE */}
              <div>
                <Button
                  type="button"
                  variant={whichAPI === 'profile' ? 'primary' : 'secondary'}
                  onClick={() => setWhichAPI('profile')}
                >
                  {t.apiTest.updateProfile}
                </Button>
                {whichAPI === 'profile' && (
                  <textarea
                    value={profilePayload}
                    onChange={(e) => setProfilePayload(e.target.value)}
                    placeholder={t.apiTest.nameAndBioPlaceholder}
                    maxLength={300}
                    rows={10}
                    className={`${inputClass} resize-none`}
                  />
                )}
              </div>

              {/* DELETE ACCOUNT */}
              <div>
                <Button
                  type="button"
                  variant={whichAPI === 'account' ? 'primary' : 'secondary'}
                  onClick={() => setWhichAPI('account')}
                >
                  {t.apiTest.deleteAccount}
                </Button>                
              </div>
              
            </div>
            <div className={sectionClass}>
              <Button 
                variant="danger"
                type="submit" 
              >
                {t.common.submit}
              </Button>
            </div>
          </form>

          {/* SERVER RESPONSE */}
          <div className={sectionClass}>
              <div>{t.apiTest.serverResponse}</div>
            <p className={inputClass}>{serverResponse}</p>
          </div>
        </main>
      <Footer />
    </div>
  )
}

export default ApiTest;