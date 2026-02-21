import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../i18n/useLanguage';
import { useAuth } from '../context/AuthContext';
import Matches from '../APIs/matches';
import type { LeaderboardEntry } from '../types';

const Home = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const userRank = user ? leaderboard.findIndex(e => e.userId === user.id) + 1 : 0;

  useEffect(() => {
    if (user) {
      Matches.get('/leaderboard').then(res => setLeaderboard(res.data)).catch(() => {});
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        {user ? (
          <>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan bg-clip-text text-transparent text-center">
              {t.home.welcome}, {user.name}!
            </h1>
            {userRank > 0 && (
              <p className="text-text-muted mt-2 text-lg">
                {t.home.rank}: <span className="text-accent-purple font-semibold">#{userRank}</span>
              </p>
            )}
            <Link
              to="/game"
              className="mt-6 px-8 py-3 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:opacity-90 transition-opacity"
            >
              {t.home.newGame}
            </Link>

            <div className="flex gap-3 mt-4">
              <Link
                to="/profile"
                className="px-5 py-2 rounded-lg border border-white/10 text-text-secondary hover:bg-white/10 transition-colors text-sm font-medium"
              >
                {t.header.profile}
              </Link>
              <Link
                to="/chat"
                className="px-5 py-2 rounded-lg border border-white/10 text-text-secondary hover:bg-white/10 transition-colors text-sm font-medium"
              >
                {t.header.chat}
              </Link>
              <Link
                to="/api-keys"
                className="px-5 py-2 rounded-lg border border-white/10 text-text-secondary hover:bg-white/10 transition-colors text-sm font-medium"
              >
                {t.header.apiKeys}
              </Link>
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="w-full max-w-2xl mt-10">
                <h2 className="text-lg font-semibold mb-3">{t.home.leaderboard}</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-text-muted text-xs">
                        <th className="py-3 px-4 text-left">#</th>
                        <th className="py-3 px-4 text-left">{t.home.name}</th>
                        <th className="py-3 px-4 text-center">{t.home.level}</th>
                        <th className="py-3 px-4 text-center">{t.home.wins}</th>
                        <th className="py-3 px-4 text-right">{t.home.winRate}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, i) => (
                        <tr key={entry.userId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-text-muted font-medium">{i + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={entry.avatarUrl}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="font-medium">{entry.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple text-xs">
                              {entry.level}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-green-400">{entry.wins}</td>
                          <td className="py-3 px-4 text-right text-text-muted">{Math.round(entry.winRate * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan bg-clip-text text-transparent tracking-tight">
              TRANSCENDENCE
            </h1>

            <div className="flex gap-4 mt-4">
              <Link
                to="/login"
                className="px-8 py-3 rounded-lg border border-accent-purple text-accent-purple hover:bg-accent-purple/10 transition-colors font-medium"
              >
                {t.logIn.signIn}
              </Link>
              <Link
                to="/signUp"
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:opacity-90 transition-opacity"
              >
                {t.header.signUp}
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
