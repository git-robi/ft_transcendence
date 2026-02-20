import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PongGameLarge from '../components/Game/PongGameLarge';
import PlayerOpponentBar from '../components/Game/PlayerOpponentBar';
import { useLanguage } from '../i18n/useLanguage';
import { useAuth } from '../context/AuthContext';
import Matches from '../APIs/matches';

interface Match {
  id: number;
  userId: number;
  guestName: string | null;
  userScore: number;
  opponentScore: number;
  status: string;
  winPoints: number;
  playMode: 'AI' | 'LOCAL';
  aiLevel: 'EASY' | 'MID' | 'HARD';
  paddle: 'LEFT' | 'RIGHT';
}

const Game = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [playMode, setPlayMode] = useState<'AI' | 'LOCAL'>('AI');
  const [aiLevel, setAiLevel] = useState<'EASY' | 'MID' | 'HARD'>('EASY');
  const [guestName, setGuestName] = useState('');
  const [winPoints, setWinPoints] = useState(5);
  const [paddle, setPaddle] = useState<'LEFT' | 'RIGHT'>('LEFT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await Matches.post('/', {
        playMode,
        aiLevel: playMode === 'AI' ? aiLevel : undefined,
        guestName: playMode === 'LOCAL' ? guestName.trim() || undefined : undefined,
        winPoints,
        paddle,
      });
      setMatch(res.data);
    } catch {
      setError('Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-accent-purple text-white'
        : 'bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10'
    }`;

  // Game is running
  if (match) {
    const opponentName = match.playMode === 'AI'
      ? `AI (${match.aiLevel.charAt(0) + match.aiLevel.slice(1).toLowerCase()})`
      : match.guestName || 'Player 2';

    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-1 py-2">
          <div className="flex flex-col origin-top">
            <PlayerOpponentBar
              playerName={user?.name || 'You'}
              opponentName={opponentName}
              playerScore={match.userScore}
              opponentScore={match.opponentScore}
              winPoints={match.winPoints}
              paddle={match.paddle}
            />
            <PongGameLarge />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Settings screen
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-center">{t.game.settings}</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Play Mode */}
          <div>
            <label className="block text-sm text-text-muted mb-2">{t.game.mode}</label>
            <div className="flex gap-2">
              <button onClick={() => setPlayMode('AI')} className={toggleClass(playMode === 'AI')}>
                {t.game.modeAI}
              </button>
              <button onClick={() => setPlayMode('LOCAL')} className={toggleClass(playMode === 'LOCAL')}>
                {t.game.modeLocal}
              </button>
            </div>
          </div>

          {/* AI Difficulty or Guest Name */}
          {playMode === 'AI' ? (
            <div>
              <label className="block text-sm text-text-muted mb-2">{t.game.difficulty}</label>
              <div className="flex gap-2">
                <button onClick={() => setAiLevel('EASY')} className={toggleClass(aiLevel === 'EASY')}>
                  {t.game.easy}
                </button>
                <button onClick={() => setAiLevel('MID')} className={toggleClass(aiLevel === 'MID')}>
                  {t.game.medium}
                </button>
                <button onClick={() => setAiLevel('HARD')} className={toggleClass(aiLevel === 'HARD')}>
                  {t.game.hard}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-text-muted mb-2">{t.game.guestName}</label>
              <input
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple"
                placeholder="Player 2"
              />
            </div>
          )}

          {/* Points to Win */}
          <div>
            <label className="block text-sm text-text-muted mb-2">{t.game.pointsToWin}</label>
            <div className="flex gap-2">
              {[3, 5, 7, 10].map(n => (
                <button key={n} onClick={() => setWinPoints(n)} className={toggleClass(winPoints === n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Paddle Side */}
          <div>
            <label className="block text-sm text-text-muted mb-2">{t.game.paddle}</label>
            <div className="flex gap-2">
              <button onClick={() => setPaddle('LEFT')} className={toggleClass(paddle === 'LEFT')}>
                {t.game.paddleLeft}
              </button>
              <button onClick={() => setPaddle('RIGHT')} className={toggleClass(paddle === 'RIGHT')}>
                {t.game.paddleRight}
              </button>
            </div>
          </div>

          {/* Start */}
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? '...' : t.game.startGame}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Game;
