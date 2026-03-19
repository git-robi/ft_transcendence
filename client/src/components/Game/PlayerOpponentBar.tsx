import { useLanguage } from "../../i18n/useLanguage";

interface PlayerOpponentBarProps {
  playerName: string;
  opponentName: string;
  playerScore: number;
  opponentScore: number;
  winPoints: number;
  paddle: 'LEFT' | 'RIGHT';
  playerAvatar?: string | null;
  playMode?: 'AI' | 'LOCAL';
}

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-white"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
      clipRule="evenodd"
    />
  </svg>
);

const PlayerOpponentBar = ({
  playerName,
  opponentName,
  playerScore,
  opponentScore,
  winPoints,
  paddle,
  playerAvatar,
  playMode,
}: PlayerOpponentBarProps) => {
  const leftName = paddle === 'LEFT' ? playerName : opponentName;
  const rightName = paddle === 'RIGHT' ? playerName : opponentName;
  const leftScore = paddle === 'LEFT' ? playerScore : opponentScore;
  const rightScore = paddle === 'RIGHT' ? playerScore : opponentScore;
  const leftIsPlayer = paddle === 'LEFT';
  const rightIsPlayer = paddle === 'RIGHT';

  const { t } = useLanguage();

  const renderAvatar = (isPlayer: boolean) => {
    if (isPlayer && playerAvatar) {
      return (
        <img
          src={playerAvatar}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    if (!isPlayer && playMode === 'AI') {
      return (
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">
          🤖
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
        <UserIcon />
      </div>
    );
  };

  return (
    <div className="w-full bg-white/5 py-3 px-6 flex justify-between items-center rounded-t-lg">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {renderAvatar(leftIsPlayer)}
        <span className="text-white font-medium text-sm">{leftName}</span>
        <span className="text-2xl font-bold text-white">{leftScore}</span>
      </div>

      {/* Center - score target */}
      <span className="text-xs text-text-muted">{t.game.firstTo} {winPoints} {t.game.firstToSecondPart}</span>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{rightScore}</span>
        <span className="text-white font-medium text-sm">{rightName}</span>
        {renderAvatar(rightIsPlayer)}
      </div>
    </div>
  );
};

export default PlayerOpponentBar;
