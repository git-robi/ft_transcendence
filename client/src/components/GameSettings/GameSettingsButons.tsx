import { useState } from "react";
import Button from "../Button";
import ToggleButton from "../ToggleButton";
import { useLanguage } from "../../i18n/useLanguage";

const GameSettingsButtons = () => {
  const { t } = useLanguage();
  const [isPressedSingle, setIsPressedSingle] = useState(true);
  const [isPressedKeyboard, setIsPressedKeyboard] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<'easy' | 'medium' | 'hard'>('easy')

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      <div className='grid grid-cols-3 gap-4 w-full max-w-3xl'>
      {/*single or two players*/}
      
        <ToggleButton 
          isPressed={isPressedSingle}
          onClick={() => setIsPressedSingle(!isPressedSingle)}
        >
          {t.gameSettings.singlePlayer}
        </ToggleButton>
        <ToggleButton
          isPressed={!isPressedSingle}
          onClick={() => setIsPressedSingle(!isPressedSingle)}
        >
          {t.gameSettings.twoPlayers}
        </ToggleButton>
        <div></div>{/*empty*/}

        {/* Keyboard or mouse */}
        { isPressedSingle ? (
            <>
              <ToggleButton
                isPressed={isPressedKeyboard}
                onClick={() => setIsPressedKeyboard(!isPressedKeyboard)}
              >
                {t.gameSettings.keyboard}
              </ToggleButton>
              <ToggleButton
                isPressed={!isPressedKeyboard}
                onClick={() => setIsPressedKeyboard(!isPressedKeyboard)}
              >
                {t.gameSettings.mouse}
              </ToggleButton>
              <div></div>{/*empty*/}
            </>
          ) : (
            <> <div className="h=14"></div> <div></div> <div></div> </>
          )
        }

        {/*level of single player*/}
        { isPressedSingle ? (
          <>
            <ToggleButton
              isPressed={selectedLevel === 'easy'}
              onClick={() => setSelectedLevel('easy')}
            >
              {t.gameSettings.easy}
            </ToggleButton>
            <ToggleButton
              isPressed={selectedLevel === 'medium'}
              onClick={() => setSelectedLevel('medium')}
            >
              {t.gameSettings.medium}
            </ToggleButton>
            <ToggleButton
              isPressed={selectedLevel === 'hard'}
              onClick={() => setSelectedLevel('hard')}
            >
              {t.gameSettings.hard}
            </ToggleButton>
          </>
        ) : (
          <> <div className="h-24"></div> <div></div> <div></div> </>
      )}
      </div>
      <div className='flex w-full max-w-3xl my-12'>
        <Button variant='green'>{t.gameSettings.play}</Button>
      </div>
      <div className="grid grid-cols-3 w-full max-w-3xl">
        <div>
          <div className="h-6"></div>
          <div>{t.gameSettings.pauseKey}</div>
          <div>{t.gameSettings.quitKey}</div>
        </div>
        <div className="text-center">
          <div>{t.gameSettings.onePlayerTitle}</div>
          <div>{t.gameSettings.onePlayerKeys1}</div>
          <div>{t.gameSettings.onePlayerKeys2}</div>
        </div>
        <div className="text-right">
          <div>{t.gameSettings.twoPlayersTitle}</div>
          <div>{t.gameSettings.twoPlayersKeys1}</div>
          <div>{t.gameSettings.twoPlayersKeys2}</div>
        </div>
      </div>
    </div>
  )
}

export default GameSettingsButtons;