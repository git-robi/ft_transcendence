import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import ServerKeyGenerator from "../components/ServerKeyGenerator";
import { useLanguage } from "../i18n/useLanguage";
import { useState } from "react";

type ApiChoice = '' | 'leaderboard' | 'stats' | 'feedback' | 'profile' | 'account'

const ApiTest = () => {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState('');
  const [whichAPI, setWhichAPI] = useState<ApiChoice>('');
  const [feedback, setFeedback] = useState('');
  const [profilePayload, setProfilePayload] = useState(
    '{\n  "name": "",\n "bio": ""\n}'
  );
  const [serverResponse, setServerResponse]= useState("");

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/50 transition-colors';
  const sectionClass = 'bg-white/5 border border-white/10 rounded-xl p-6 space-y-4';
  const labelClass = 'text-sm font-medium text-text-secondary';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // don’t let the form reload the page

    if (!whichAPI) {
      setServerResponse("no operation selected!");
      return;
    }

    let url = "";
    let opts: RequestInit = { method: "GET", credentials: "include"};
    const API_BASE = "/api/v1/public"
    const headers: Record<string,string> = { "Content-Type": "application/json"}
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    switch (whichAPI) {
      case "leaderboard":
        url = `${API_BASE}/leaderboard`;
        break;
      case "stats":
        url = `${API_BASE}/stats`;
        break;
      case "feedback":
        url = `${API_BASE}/feedback`;
        opts = {
          method: "POST",
          headers,
          body: JSON.stringify({ feedback }),
          credentials: "include",
        };
        break;
      case "profile":
        url = `${API_BASE}/api/profile`
        opts = {
          method: "PATCH",
          headers,
          body: profilePayload,
          credentials: "include"
        };
        break;
      case "account":
        url = `${API_BASE}/account`;
        opts = { method: "DELETE", credentials: "include" };
        break;
    }

    try {
      const res = await fetch(url, opts);
      const text = await res.json();
      setServerResponse(`${res.status} ${res.statusText}\n${text}`);
      
    } catch (err) {
      setServerResponse(`request failed: ${err}`);
    }
  };
  


  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Header />
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {/* KEY SECTION*/}
          <div className={sectionClass}>
            <p className={labelClass}>API public key</p>
            <ServerKeyGenerator />
            <div>
              Key generation section
            </div>
            <textarea
              onChange={(e) => setProfilePayload(e.target.value)}
              placeholder={
                "paste public key here"
              }
              maxLength={300}
              rows={6}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* FORM SECTION */}
          <form onSubmit={handleSubmit}>
            <div className={sectionClass}>

              {/* GET THE GAME LEADERBOARD*/}
              <div>
                <Button
                  type="button"
                  variant={whichAPI === 'leaderboard' ? 'primary' : 'secondary'}
                  onClick={() => setWhichAPI('leaderboard')}
                >
                  Get the game leaderboard
                </Button>                
              </div>

              {/* GET PLAYER STATISTICS*/}
              <div>
                <Button
                  type="button"
                  variant={whichAPI === 'stats' ? 'primary' : 'secondary'}
                  onClick={() => setWhichAPI('stats')}
                >
                  Get player statistics
                </Button>                
              </div>

              {/* SUBMIT FEEDBACK*/}
              <div>
                <Button
                  type="button"
                  variant={whichAPI === 'feedback' ? 'primary' : 'secondary'}
                  onClick={() => setWhichAPI('feedback')}
                >
                  Submit feedback
                </Button>
                {whichAPI === 'feedback' && (
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Please type your feedback here"
                    maxLength={300}
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
                  Update user profile
                </Button>
                {whichAPI === 'profile' && (
                  <textarea
                    value={profilePayload}
                    onChange={(e) => setProfilePayload(e.target.value)}
                    placeholder={
                      "JSON WITH NAME AND BIO HERE:\n{\n  \"name\": \"new name\"\n  \"bio\": \"new bio\"\n}"
                    }
                    maxLength={300}
                    rows={10}
                    className={`${inputClass} resize-none`}
                  />
                )}
              </div>

              {/* DELETE ACCOUNT */}
              <div>
                <Button
                  variant={whichAPI === 'account' ? 'primary' : 'secondary'}
                  onClick={() => setWhichAPI('account')}
                >
                  Delete user account
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
            <p className={labelClass}>SERVER RESPONSE</p>
            <p className={inputClass}>{serverResponse}</p>
          </div>
        </main>
      <Footer />
    </div>
  )
}

export default ApiTest;