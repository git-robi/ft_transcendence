export class PongSettings
{
	device: string;
	maxPoints: number;
	mode: string;
	ai_level: string;
	your_pad: string;
	plL_mvu: string;
	plL_mvd: string;
	plR_mvu: string;
	plR_mvd: string;
	plL_name: string;
	plR_name: string;
	onGameEnd: ((scoreL: number, scoreR: number) => void) | null;

	constructor()
	{
		this.device		= "PC";
		this.maxPoints	= 5;
		this.mode		= "1vsAI";
		this.ai_level	= "hard";
		this.your_pad	= "left";
		this.plL_mvu	= "w";
		this.plL_mvd	= "s";
		this.plR_mvu	= "ArrowUp";
		this.plR_mvd	= "ArrowDown";
		this.plL_name	= "Player 1";
		this.plR_name	= "Player 2";
		this.onGameEnd	= null;
	}
}
