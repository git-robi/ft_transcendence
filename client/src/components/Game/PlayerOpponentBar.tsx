const PlayerOpponentBar = () => {
  return (
    <div className="w-full bg-neutral-800 py-4 px-6 flex justify-between items-center">
      {/* Left side - You (Player) */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-400">You</span>
      </div>

      {/* Right side - Your Opponent */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-400">Your Opponent</span>
      </div>
    </div>
  );
};

export default PlayerOpponentBar;
