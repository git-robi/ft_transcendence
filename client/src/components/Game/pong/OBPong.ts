import { checkCornerCollision } from "./phisics";
import { ai } from "./AI"
import type { Ball, Border, Corner, Goal, Score, Paddle, Player } from "./types";
import type { PongSettings } from "./settings";
import type { AI } from "./AI";

export const GAME_WIDTH: number		= 640 * 2;
export const GAME_HEIGHT: number	= 480 * 2;
export const gm_margin: number		= 10;

const WAIT_SERVE: number = 180;

const START_BALL_VEL: number = 0;
const BALL_ACCELERATION: number = 0.1;
const BALL_VEL: number	=	8;
const BALL_RAD: number	=	20;
const BALL: Ball = {
	color:	"white",
	rad:	BALL_RAD,
	vel:	BALL_VEL,
	maxVel:	BALL_VEL,
	x:		0,
	y:		0,
	dirX:	0,
	dirY:	0,
	is_stuck:	false,
	frameStuck:	0
};

const BODMH: number = 20;
const BORDER: Border = {
	color:	"white",
	width:	GAME_WIDTH,
	height:	1,
	x:		0,
	y:		0
};

const CWIDTH: number = 70, CHEIGHT: number = 70;
const CORNER: Corner = {
	color:	"red",
	width:	CWIDTH + BALL_RAD,
	height:	CHEIGHT + BALL_RAD,
	x:		0,
	y:		0
};

const GOAL: Goal = {
	color:	"yellow",
	height:	GAME_HEIGHT,
	width:	6,
	x:		0,
	y:		0,
};

const MAX_SCORE: number = 5;
const SCORE_SIZE: number = 120;
const FONT_SIZE: string = SCORE_SIZE + "px";
const FONT_SCORE: string = FONT_SIZE + " Arial";
const SCORE_MARGIN: number = 85;
const SCORE: Score = {
	max_score:	MAX_SCORE,
	score: 0,
	size: SCORE_SIZE,
	font: "Arial",
	color:	'lightyellow',
	x: 0,
	y: SCORE_SIZE + SCORE_MARGIN
};

const PADW: number = 16, PADH: number = 100, PADVEL: number = 14;
const PAD: Paddle = {
	ai_enable:	false,
	controller:	"keyboard",
	color:	"white",
	width:	PADW,
	height:	PADH,
	vel:	PADVEL,
	smoothVel:	0,
	maxAcc:		1,
	damping:	0.9,
	reactionDelay:	0,
	x:		0,
	y:		0,
	maxY:	GAME_HEIGHT,
	dirY:	0
};

const PLAYER: Player = {
	name: "Player",
	serve:  false,
	score: null,
	my_pad: null,
	goal: null,
	mov_u:	"w",
	mov_d:	"s"
};

export class Pong
{
	canvas: HTMLCanvasElement | null;
	ctx: CanvasRenderingContext2D | null;

	width: number;
	height: number;
	margin: number;

	set: PongSettings | null;

	borT: Border;
	borB: Border;

	corTL: Corner;
	corTR: Corner;
	corBL: Corner;
	corBR: Corner;

	gL: Goal;
	gR: Goal;

	ball: Ball;

	padL: Paddle;
	padR: Paddle;

	sliderL: HTMLInputElement | null;
	sliderR: HTMLInputElement | null;
	_sliderLHandler: ((e: Event) => void) | null;
	_sliderRHandler: ((e: Event) => void) | null;

	ai: AI;
	playerL: Player;
	playerR: Player;
	onScoreChange: ((scoreL: number, scoreR: number) => void) | null;

	onGameEnd: ((scoreL: number, scoreR: number) => void) | null;
	gameOver: boolean;
	maxPoints: number;
	serveNow: boolean;
	waitServe: number;
	screenText: Score;

	constructor()
	{
		this.canvas = null;
		this.ctx = null;

		this.width = GAME_WIDTH;
		this.height = GAME_HEIGHT;
		this.margin = gm_margin;

		this.set = null;

		this.borT = Object.create(BORDER);
		this.borB = Object.create(BORDER);

		this.corTL = Object.create(CORNER);
		this.corTR = Object.create(CORNER);
		this.corBL = Object.create(CORNER);
		this.corBR = Object.create(CORNER);

		this.gL = Object.create(GOAL);
		this.gR = Object.create(GOAL);

		this.ball = Object.create(BALL);

		this.padL = Object.create(PAD);
		this.padR = Object.create(PAD);

		this.sliderL = null;
		this.sliderR = null;
		this._sliderLHandler = null;
		this._sliderRHandler = null;

		this.ai			=	ai;
		this.playerL	=	Object.create(PLAYER);
		this.playerR	=	Object.create(PLAYER);
		this.playerR.mov_u	=	"ArrowUp";
		this.playerR.mov_d	=	"ArrowDown";
		this.onScoreChange	=	null;

		this.onGameEnd = null;
		this.gameOver = false;
		this.maxPoints = MAX_SCORE;
		this.serveNow = false;
		this.waitServe = WAIT_SERVE;
		this.screenText = Object.create(SCORE);
	}

	setGameEndCallback(cb: ((scoreL: number, scoreR: number) => void) | null): void { this.onGameEnd = cb; }
	setScoreCallback(cb: ((scoreL: number, scoreR: number) => void) | null): void { this.onScoreChange = cb; }

	setCanvas(canvas: HTMLCanvasElement | null): void
	{
		if (canvas != null)
			this.canvas = canvas;
		else
			this.canvas = document.getElementById("gm-canvas") as HTMLCanvasElement;
		this.ctx = this.canvas.getContext("2d");
		this.ctx!.imageSmoothingEnabled = true;
		this.ctx!.imageSmoothingQuality = "high";
	}

	setSliders(settings: PongSettings | null, sliderL: HTMLInputElement | null, sliderR: HTMLInputElement | null): void
	{
		if (sliderL != null) {
        		if (this.sliderL && this._sliderLHandler)
					this.sliderL.removeEventListener("input", this._sliderLHandler);
        	this.sliderL = sliderL;
    	} else if (this.sliderL == null) {
        	this.sliderL = document.getElementById("sliderL") as HTMLInputElement;
    	}

    	if (sliderR != null) {
        	if (this.sliderR && this._sliderRHandler)
            	this.sliderR.removeEventListener("input", this._sliderRHandler);
        	this.sliderR = sliderR;
    	} else if (this.sliderR == null) {
        	this.sliderR = document.getElementById("sliderR") as HTMLInputElement;
    	}

    	if (this._sliderLHandler)
     	   this.sliderL!.removeEventListener("input", this._sliderLHandler);
    	if (this._sliderRHandler)
        	this.sliderR!.removeEventListener("input", this._sliderRHandler);

    	this._sliderLHandler = (e: Event) => {
        	const s = e.target as HTMLInputElement;
        	const normalized = Number(s.value) / Number(s.max);
        	this.padL.y = normalized * (this.height - this.padL.height);
    	};
    	this._sliderRHandler = (e: Event) => {
        	const s = e.target as HTMLInputElement;
        	const normalized = Number(s.value) / Number(s.max);
        	this.padR.y = normalized * (this.height - this.padR.height);
    	};

		this.sliderL!.addEventListener("input", this._sliderLHandler);
    	this.sliderR!.addEventListener("input", this._sliderRHandler);

		this.sliderL!.max = String(this.height - PADH);
		this.sliderL!.value = String(this.height / 2);
		this.sliderR!.max = String(this.height - PADH);
		this.sliderR!.value = String(this.height / 2);

		this.sliderL!.style.display = "none";
		this.sliderR!.style.display = "none";

		if (settings)
		{
			if (settings.device == "Mobile")
			{
				if (settings.mode == "1vs1Off")
				{
					this.sliderL!.style.display = "block";
					this.sliderR!.style.display = "block";
				}
				else if (settings.your_pad == "left")
					this.sliderL!.style.display = "block";
				else if (settings.your_pad == "right")
					this.sliderR!.style.display = "block";
			}
		}
	}

	setDefPad(pad: Paddle): void
	{
		pad.ai_enable	=	PAD.ai_enable;
		pad.controller	=	PAD.controller;
		pad.color		=	PAD.color;
		pad.width		=	PADW;
		pad.height		=	PADH;
		pad.vel			=	PADVEL;
		pad.smoothVel	=	0;
		pad.maxAcc		=	1;
		pad.damping		=	0.9;
		pad.reactionDelay	=	0;
	}

	initializeGame(pongSet: PongSettings): void
	{
		this.gameOver = false;

		this.set = pongSet;
		this.maxPoints = (pongSet && Number(pongSet.maxPoints)) ? Number(pongSet.maxPoints) : MAX_SCORE;

		this.serveNow = false;
		this.waitServe = WAIT_SERVE;
		this.screenText.score = WAIT_SERVE / 60;
		this.screenText.x = this.width / 2 - SCORE_SIZE / 2 + 25;
		this.screenText.y = this.height / 2 + SCORE_SIZE / 2 - 25;
		this.gL.x = 0;
		this.gL.y = 0;
		this.gR.x = this.width;
		this.gR.y = 0;

		this.borT.x = 0;
		this.borT.y = 0;
		this.borB.x = 0;
		this.borB.y = GAME_HEIGHT - BORDER.height;

		this.corTL.x = 0;
		this.corTL.y = 0;
		this.corTR.x = this.width - CWIDTH;
		this.corTR.y = 0;
		this.corBL.x = 0;
		this.corBL.y = this.height - CHEIGHT;
		this.corBR.x = this.width - CWIDTH;
		this.corBR.y = this.height - CHEIGHT;

		this.setDefPad(this.padL);

		this.playerL.my_pad = this.padL;
		this.playerL.goal = this.gL;
		this.padL.controller = "keyboard";
		this.playerL.mov_u = pongSet.plL_mvu;
		this.playerL.mov_d = pongSet.plL_mvd;
		this.playerL.score = Object.create(SCORE);
		this.playerL.score!.score = 0;
		this.playerL.score!.x = this.width / 2 - SCORE_MARGIN * 2;
		if (pongSet.mode == "1vsAI" && pongSet.your_pad == "right")
			this.ai.setLevel(pong.ball, pong.padL, pongSet.ai_level);

		this.setDefPad(this.padR);

		this.playerR.my_pad = this.padR;
		this.playerR.goal = this.gR;
		this.padR.controller = "keyboard";
		this.playerR.mov_u = pongSet.plR_mvu;
		this.playerR.mov_d = pongSet.plR_mvd;
		this.playerR.score = Object.create(SCORE);
		this.playerR.score!.score = 0;
		this.playerR.score!.x = this.width / 2 + SCORE_MARGIN;
		if (pongSet.mode == "1vsAI" && pongSet.your_pad == "left")
			this.ai.setLevel(pong.ball, pong.padR, pongSet.ai_level);

		this.drawMidLine();
		this.drawBorders();

		this.startGamePosition();
		this.decideServe();
	}

	startBall(): void
	{
		this.ball.is_stuck = false;
		this.ball.frameStuck = 0;
		this.ball.vel = START_BALL_VEL;
		this.ball.x = this.width / 2;
		this.ball.y = this.height / 2;

		this.drawBall(this.ball);
	}

	startPaddles(): void
	{
		const centerY = this.height / 2;
		this.padL.x = 0;
		this.padL.y = centerY - this.padL.height / 2;
		this.padL.smoothVel = 0;
		this.drawPaddle(this.padL);

		this.padR.x = this.width - this.padR.width;
		this.padR.y = centerY - this.padR.height / 2;
		this.padR.smoothVel = 0;
		this.drawPaddle(this.padR);
	}

	startGamePosition(): void
	{
		this.serveNow = false;
		this.waitServe = WAIT_SERVE;
		this.screenText.score = WAIT_SERVE / 60;
		this.startBall();
		this.startPaddles();
	}

	drawScore(score: Score): void
	{
		this.ctx!.font = FONT_SCORE;
		this.ctx!.strokeStyle = score.color;
		this.ctx!.fillText(score.score + "", score.x, score.y);
	}

	drawPaddle(paddle: Paddle): void
	{
		this.ctx!.fillStyle = paddle.color;
		this.ctx!.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
	}

	drawBall(ball: Ball): void
	{
		this.ctx!.strokeStyle = 'lightgray';
		this.ctx!.beginPath();
		this.ctx!.arc(ball.x, ball.y, ball.rad, 0, 2 * Math.PI, false);
		this.ctx!.fillStyle = ball.color;
		this.ctx!.fill();
		this.ctx!.stroke();
	}

	drawMidLine(): void
	{
		this.ctx!.strokeStyle = 'gray';
		this.ctx!.lineWidth = 8;
		this.ctx!.setLineDash([30, 38]);
		this.ctx!.moveTo(GAME_WIDTH / 2, BODMH);
		this.ctx!.lineTo(GAME_WIDTH / 2, GAME_HEIGHT - BODMH);
		this.ctx!.stroke();
		this.ctx!.setLineDash([0, 0]);
	}

	drawBorders(): void
	{
		this.ctx!.fillStyle = this.borT.color;
		this.ctx!.fillRect(this.borT.x, this.borT.y, GAME_WIDTH, this.borT.height);
		this.ctx!.fillRect(this.borB.x, this.borB.y, GAME_WIDTH, this.borB.height);
	}

	drawGoals(): void
	{
		this.ctx!.fillStyle = this.gL.color;
		this.ctx!.fillRect(this.gL.x, this.gL.y, this.gL.width, this.gL.height);
		this.ctx!.fillStyle = this.gR.color;
		this.ctx!.fillRect(this.gR.x - this.gR.width, this.gR.y, this.gR.width, this.gR.height);
	}

	reDraw(): void
	{
		if (this.canvas == null)
			return ;

		this.ctx!.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

		this.drawBorders();
		this.drawMidLine();

		this.drawScore(this.playerL.score!);
		this.drawScore(this.playerR.score!);

		this.drawBall(this.ball);
		this.drawPaddle(this.padL);
		this.drawPaddle(this.padR);

		if (!this.serveNow)
			this.drawScore(this.screenText);
	}

	decideServe(): void
	{
		this.startBall();

		let nextS = Math.random() < 0.5 ? true : false;
		this.playerL.serve = nextS;
		this.playerR.serve = !nextS;

		this.ball.dirY = (Math.random() * 2 - 1);
		if (this.playerL.serve)
			this.ball.dirX = 1;
		else
			this.ball.dirX = -1;
	}

	countDownServe(): void
	{
		if (this.waitServe > 0)
		{
			this.serveNow = false;
			this.drawScore(this.screenText);
			if (this.waitServe % 60 == 0)
				this.screenText.score = this.waitServe / 60;
			this.waitServe--;
		}
		else
			this.serveNow = true;
	}

	checkIfBallStuck(ball: Ball): void
	{
		ball.is_stuck = false;

		if (checkCornerCollision(ball, this.corTL) ||
			checkCornerCollision(ball, this.corTR) ||
			checkCornerCollision(ball, this.corBL) ||
			checkCornerCollision(ball, this.corBR)) {
				ball.is_stuck = true;
		}

		if (ball.is_stuck)
		{
			ball.frameStuck++;
			if (ball.frameStuck > 180)
			{
				ball.frameStuck = 0;
				this.startBall();
			}
		}
		else
			ball.frameStuck = 0;
	}

	updatePaddlePosition(paddle: Paddle): void
	{
		paddle.y += paddle.dirY * paddle.vel;
		if (paddle.y < 0) {
			paddle.y = 0;
		} else if (paddle.y + paddle.height > this.height) {
			paddle.y = this.height - paddle.height;
		}
	}

	updateBallPosition(ball: Ball): void
	{
		ball.x += ball.dirX * ball.vel;
		ball.y += ball.dirY * ball.vel;

		if (ball.vel <= ball.maxVel)
			ball.vel += BALL_ACCELERATION;

		if (ball.x <= this.playerL.goal!.x)
		{
			this.playerR.score!.score++;
			if (this.onScoreChange){
				this.onScoreChange(
					this.playerL.score!.score,
					this.playerR.score!.score
				);
			}
			if (this.playerR.score!.score >= this.maxPoints)
			{
				this.gameOver = true;
				if (this.onGameEnd)
					this.onGameEnd(this.playerL.score!.score, this.playerR.score!.score);
				return;
			}
			else
				this.decideServe();
		}
		if (ball.x >= this.playerR.goal!.x)
		{
			this.playerL.score!.score++;
			if (this.onScoreChange){
				this.onScoreChange(
					this.playerL.score!.score,
					this.playerR.score!.score
				);
			}
			if (this.playerL.score!.score >= this.maxPoints)
			{
				this.gameOver = true;
				if (this.onGameEnd)
					this.onGameEnd(this.playerL.score!.score, this.playerR.score!.score);
				return;
			}
			else
				this.decideServe();
		}
	}
}

export let pong = new Pong();
