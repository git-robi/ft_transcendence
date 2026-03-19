import { resizeCanvas } from "./render";
import { pong } from "./OBPong";
import { checkPaddleCollision, checkWallCollision } from "./phisics";

window.addEventListener("resize", () => {
	resizeCanvas(pong);
	pong.reDraw();
});

window.addEventListener("keydown", (e: KeyboardEvent) => {
	if (e.key == pong.playerL.mov_u)
		pong.padL.dirY = -1;

	if (e.key == pong.playerL.mov_d)
		pong.padL.dirY = 1;

	if (e.key == pong.playerR.mov_u)
		pong.padR.dirY = -1;

	if (e.key == pong.playerR.mov_d)
		pong.padR.dirY = 1;
});

window.addEventListener("keyup", (e: KeyboardEvent) => {
	if (e.key == pong.playerL.mov_u)
		pong.padL.dirY = 0;

	if (e.key == pong.playerL.mov_d)
		pong.padL.dirY = 0;

	if (e.key == pong.playerR.mov_u)
		pong.padR.dirY = 0;

	if (e.key == pong.playerR.mov_d)
		pong.padR.dirY = 0;
});

let animationID: number | null = null;

function gameLoop(): void
{
	if (pong.gameOver)
		return ;

	pong.countDownServe();

	if (pong.serveNow)
	{
		checkPaddleCollision(pong.ball, pong.padL);
		checkPaddleCollision(pong.ball, pong.padR);
		checkWallCollision(pong.ball, pong.borT);
		checkWallCollision(pong.ball, pong.borB);

		pong.updateBallPosition(pong.ball);

		if (pong.padL.ai_enable)
			pong.ai.ai(pong.ball, pong.padL);
		else if (pong.set!.device == "PC")
			pong.updatePaddlePosition(pong.padL);
		else
			pong.drawPaddle(pong.padL);

		if (pong.padR.ai_enable)
			pong.ai.ai(pong.ball, pong.padR);
		else if (pong.set!.device == "PC")
			pong.updatePaddlePosition(pong.padR);
		else
			pong.drawPaddle(pong.padR);

		pong.checkIfBallStuck(pong.ball);
	}

	pong.reDraw();

	animationID = requestAnimationFrame(gameLoop);
}

export function startGame(): void {
	stopGame();
	if (animationID !== null) return ;
	function loop(): void {
		animationID = requestAnimationFrame(gameLoop);
	}
	loop();
}

export function stopGame(): void {
	if (animationID !== null) {
		cancelAnimationFrame(animationID);
		animationID = null;
	}
}
