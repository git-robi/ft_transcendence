import { useState } from "react";
import Button from "../Button";
import ToggleButton from "../ToggleButton";

const GameSettingsButtons = () => {
	const [isPressed, setIsPressed] = useState(false);
	return (
		<div>
			<ToggleButton 
				isPressed={isPressed}
				onClick={() => setIsPressed(!isPressed)}
			>
				Single Player
			</ToggleButton>

		</div>
	)
}

export default GameSettingsButtons;