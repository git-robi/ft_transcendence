const PlayerOpponentBar = () => {
  return (
    <div className="w-full bg-neutral-800 py-4 px-6 flex justify-between items-center">
      {/* Left side - You (Player) */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-400">You</span>
        <div className="flex items-center gap-2">
          {/* User icon/avatar */}
          <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-white" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          <span className="text-white font-medium">John Doe (jdoe7)</span>
        </div>
      </div>

      {/* Right side - Your Opponent */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">Adam Smith (asmith2)</span>
          {/* Opponent avatar - using emoji for now */}
          <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center text-xl">
            🎮
          </div>
        </div>
        <span className="text-sm text-neutral-400">Your Opponent</span>
      </div>
    </div>
  );
};

export default PlayerOpponentBar;
