import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { PongSettings } from "../components/Game/pong/settings"
import { MAX_NAME_LENGTH } from '../constants';
import PongGame from '../components/Game/PongGame';
import PlayerOpponentBar from '../components/Game/PlayerOpponentBar';
import { useLanguage } from '../i18n/useLanguage';
import { useAuth } from '../context/AuthContext';
import Matches from '../APIs/matches';
import Profile from '../APIs/profile';
import type { Match, MatchResult } from '../types';

const Game = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [playMode, setPlayMode] = useState<'AI' | 'LOCAL'>('AI');
  const [aiLevel, setAiLevel] = useState<'EASY' | 'MID' | 'HARD'>('EASY');
  const [guestName, setGuestName] = useState('');
  const [liveScore, setScore] = useState({ left: 0, right: 0 });
  const [winPoints, setWinPoints] = useState(5);
  const [paddle, setPaddle] = useState<'LEFT' | 'RIGHT'>('LEFT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playerAvatar, setPlayerAvatar] = useState<string | null>(null);

  useEffect(() => {
    Profile.get('/me', { withCredentials: true })
      .then(res => {
        if (res.data.avatarUrl) {
          setPlayerAvatar(res.data.avatarUrl);
        }
      })
      .catch(() => {});
  }, []);

  const handleMatchEnd = async (leftScore: number, rightScore: number) => {
	if (!match) return;
	
  const actualUserScore = match.paddle === 'LEFT' ? leftScore : rightScore;
  const actualOpponentScore = match.paddle === 'LEFT' ? rightScore : leftScore;

	try {
		await Matches.patch(`/${match.id}`, { userScore: actualUserScore, opponentScore: actualOpponentScore });
	} catch {}

  const playerName = user?.name || t.chat.you;
  const opponentName = match.playMode === 'AI'
    ? `${t.game.ai} (${match.aiLevel.charAt(0) + match.aiLevel.slice(1).toLowerCase()})`
    : match.guestName || t.game.player2;

	setResult({
		winnerName: actualUserScore > actualOpponentScore ? playerName : opponentName,
		userScore: actualUserScore,
		opponentScore: actualOpponentScore,
	});

	setMatch(null);
  };

  const handleStart = async () => {
    setError('');
    setLoading(true);
    setScore({left: 0, right: 0});
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

  const handleScoreUpdate = useCallback(
    (left: number, right: number) => {
    setScore({left, right});
  }, []);

  const toggleClass = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-accent-purple text-black'
        : 'bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10'
    }`;

  const [isLandscape, setIsLandscape] = useState(
    () => window.innerWidth > window.innerHeight
  );

  useEffect(() => {
    const checkOrientation = () => {
      // Small delay to let the browser finish updating dimensions
      setTimeout(() => {
        setIsLandscape(window.innerWidth > window.innerHeight);
      }, 100);
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Game is running
  if (match) {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0;

    const settings = new PongSettings();

    settings.device = isMobile ? "Mobile" : "PC";
    settings.maxPoints = match.winPoints;
    settings.mode = match.playMode === 'AI' ? '1vsAI' : '1vs1Off';
    settings.ai_level = match.aiLevel?.toLocaleLowerCase() || 'easy';

    settings.your_pad = match.paddle === 'LEFT' ? 'left' : 'right';
    settings.plL_name = user?.name || t.chat.you;
    settings.plR_name = match.playMode === 'AI' ? t.game.ai : match.guestName || t.game.player2;
    settings.onGameEnd = handleMatchEnd;

    const userScore = settings.your_pad === "left" ? liveScore.left : liveScore.right;
    const opponentScore = settings.your_pad === "left" ? liveScore.right : liveScore.left;

    if (isMobile) {
      return (
        <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden">
          {!isLandscape ? (
            /* Portrait mode warning */
            <div className="absolute inset-0 z-20 bg-black flex flex-col items-center justify-center text-center gap-4 p-8">
              <div className="text-5xl">↻</div>
              <p className="text-text-muted">Rotate your device to play</p>
            </div>
          ) : (
            /* Landscape layout */
            <div className="flex flex-col h-full w-full">
              <div className="shrink-0 px-2 py-1 border-b border-white/10">
                <PlayerOpponentBar
                  playerName={user?.name || t.chat.you}
                  opponentName={settings.plR_name}
                  playerScore={userScore}
                  opponentScore={opponentScore}
                  winPoints={match.winPoints}
                  paddle={match.paddle}
                  playerAvatar={playerAvatar}
                  playMode={match.playMode}
                />
              </div>
              <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                <PongGame key={match.id} pongSet={settings} onScoreChange={handleScoreUpdate} onGameEnd={handleMatchEnd}/>
                <button
                  onClick={() => setMatch(null)}
                  className="absolute top-2 right-2 z-30 px-3 py-1 text-sm rounded-lg bg-white/10 hover:bg-white/20 border border-white/20"
                >
                  {t.chat.back}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="min-h-dvh bg-bg-primary text-text-primary flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-1 py-2">
          <div className="flex flex-col origin-top">
            <PlayerOpponentBar
              playerName={user?.name || t.chat.you}
              opponentName={settings.plR_name}
              playerScore={userScore}
              opponentScore={opponentScore}
              winPoints={match.winPoints}
              paddle={match.paddle}
              playerAvatar={playerAvatar}
              playMode={match.playMode}
            />

            <PongGame key={match.id} pongSet={settings} onScoreChange={handleScoreUpdate} onGameEnd={handleMatchEnd}/>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div className="min-h-dvh bg-bg-primary text-text-primary flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md text-center space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan bg-clip-text text-transparent">
              {result.winnerName} {t.game.won}
            </h1>
            <p className="text-4xl font-bold text-text-primary">
              {result.userScore} – {result.opponentScore}
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={() => { setResult(null); handleStart(); }}>
                {t.game.rematch}
              </Button>
              <Button variant="outline" onClick={() => setResult(null)}>
                {t.game.newGame}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/')}>
                {t.game.goHome}
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Settings screen
  return (
    <div className="min-h-dvh bg-bg-primary text-text-primary flex flex-col">
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
          <div className='min-h-[80px] flex flex-col justify-between'>
            {playMode === 'AI' ? (
              <div>
                <label className="block text-sm text-text-muted mb-2">{t.game.difficulty}</label>
                <div className="flex gap-2 m-1">
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
                  maxLength={MAX_NAME_LENGTH}
                  onChange={e => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple"
                  placeholder={t.game.player2}
                />
              </div>
            )}
          </div>

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
              <button
                onClick={() => setPaddle('LEFT')}
                className={`${toggleClass(paddle === 'LEFT')} flex-1`}
              >
                {t.game.paddleLeft}
              </button>
              <button
                onClick={() => setPaddle('RIGHT')}
                className={`${toggleClass(paddle === 'RIGHT')} flex-1`}
              >
                {t.game.paddleRight}
              </button>
            </div>
          </div>

          {/* Start */}
          <Button className="w-full py-3" onClick={handleStart} disabled={loading}>
            {loading ? '...' : t.game.startGame}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Game;
