import { useEffect, useRef } from "react";
import { pong } from "./pong/OBPong";
import { resizeCanvas } from "./pong/render";
import { startGame, stopGame } from "./pong/pong";
import type { PongSettings } from "./pong/settings";
import "./pong/pong";
import "./pong/pongstyle.css";

interface PongGameProps {
  pongSet: PongSettings;
  onScoreChange?: (leftScore: number, rightScore: number) => void;
  onGameEnd?: (leftScore: number, rightScore: number) => void;
}

function PongGame({ pongSet, onScoreChange, onGameEnd }: PongGameProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderLRef = useRef<HTMLInputElement>(null);
  const sliderRRef = useRef<HTMLInputElement>(null);  

  const gameRef = useRef<typeof pong | null>(null);

  useEffect(() => {
    if (gameRef.current) return ;
    if (!pongSet) return ;
    if (!canvasRef.current || !sliderLRef.current || !sliderRRef.current) return;

    pong.setScoreCallback((leftScore, rightScore) => {
      if (onScoreChange) 
        onScoreChange(leftScore, rightScore);
    });

	  pong.setCanvas(canvasRef.current); 
	  resizeCanvas(pong);
	  pong.setSliders(pongSet, sliderLRef.current, sliderRRef.current);
	  pong.initializeGame(pongSet);

    gameRef.current = pong;

    pong.setGameEndCallback((leftScore, rightScore) => {
      stopGame();            // cancel loop immediately
      gameRef.current = null;
      if (onGameEnd)
        onGameEnd(leftScore, rightScore);
    });

	  startGame();

	  return () => {
      stopGame();
      gameRef.current = null;

      pong.setGameEndCallback(null);
      pong.setScoreCallback(null);
      if (pong._sliderLHandler && pong.sliderL)
	      pong.sliderL.removeEventListener("input", pong._sliderLHandler);
      if (pong._sliderRHandler && pong.sliderR)
	      pong.sliderR.removeEventListener("input", pong._sliderRHandler);
    };
  }, []);

  return (
    <div className="flex items-stretch justify-center w-full">
      <input
        type="range"
        ref={sliderLRef}
        className="gmSlider absolute left-0 top-1/2 -translate-y-1/2 sliderL"
      />
      <canvas
        ref={canvasRef}
        width={1280}
        height={960}
        className="block max-w-full max-h-[70vh] bg-black"
      />
      <input
        type="range"
        ref={sliderRRef}
        className="gmSlider absolute right-0 top-1/2 -translate-y-1/2 sliderR"
      />
    </div>
  );
}

export default PongGame;
