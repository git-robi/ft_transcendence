export interface Ball {
	color: string;
	rad: number;
	vel: number;
	maxVel: number;
	x: number;
	y: number;
	dirX: number;
	dirY: number;
	is_stuck: boolean;
	frameStuck: number;
}

export interface Border {
	color: string;
	width: number;
	height: number;
	x: number;
	y: number;
}

export interface Corner {
	color: string;
	width: number;
	height: number;
	x: number;
	y: number;
}

export interface Goal {
	color: string;
	height: number;
	width: number;
	x: number;
	y: number;
}

export interface Score {
	max_score: number;
	score: number;
	size: number;
	font: string;
	color: string;
	x: number;
	y: number;
}

export interface Paddle {
	ai_enable: boolean;
	controller: string;
	color: string;
	width: number;
	height: number;
	vel: number;
	smoothVel: number;
	maxAcc: number;
	damping: number;
	reactionDelay: number;
	x: number;
	y: number;
	maxY: number;
	dirY: number;
}

export interface Player {
	name: string;
	serve: boolean;
	score: Score | null;
	my_pad: Paddle | null;
	goal: Goal | null;
	mov_u: string;
	mov_d: string;
}
