import type { Ball, Border, Corner, Paddle } from "./types";

export function checkPaddleCollision(ball: Ball, paddle: Paddle): void
{
	const ballLeft = ball.x - ball.rad;
	const ballRight = ball.x + ball.rad;
	const ballTop = ball.y - ball.rad;
	const ballBottom = ball.y + ball.rad;

	const paddleLeft = paddle.x;
	const paddleRight = paddle.x + paddle.width;
	const paddleTop = paddle.y;
	const paddleBottom = paddle.y + paddle.height;

	if ( ballRight > paddleLeft && ballLeft < paddleRight
		&& ballBottom > paddleTop && ballTop < paddleBottom ){

		ball.dirX *= -1;

		const hitPoint = (ball.y - paddle.y) / paddle.height;
		ball.dirY = (hitPoint - 0.5) * 2;

		if (ball.dirX > 0) {
			ball.x = paddleRight + ball.rad;
		}
		else {
			ball.x = paddleLeft - ball.rad;
		}
	}
}

export function checkWallCollision(ball: Ball, border: Border): void
{
	const ballLeft = ball.x - ball.rad;
	const ballRight = ball.x + ball.rad;
	const ballTop = ball.y - ball.rad;
	const ballBottom = ball.y + ball.rad;

	const borderLeft = border.x;
	const borderRight = border.x + border.width;
	const borderTop = border.y;
	const borderBottom = border.y + border.height;

	if ( ballRight > borderLeft && ballLeft < borderRight
		&& ballBottom > borderTop && ballTop < borderBottom ){

		ball.dirY *= -1;
	}
}

export function checkCornerCollision(ball: Ball, corner: Corner): boolean
{
	const ballLeft = ball.x - ball.rad;
	const ballRight = ball.x + ball.rad;
	const ballTop = ball.y - ball.rad;
	const ballBottom = ball.y + ball.rad;

	const cornerL = corner.x;
	const cornerR = corner.x + corner.width;
	const cornerT = corner.y;
	const cornerB = corner.y + corner.height;

	if ( ballRight > cornerL && ballLeft < cornerR
		&& ballBottom > cornerT && ballTop < cornerB ){
		return true;
	}
	else
		return false;
}
