import Header from '../components/Header'
import Footer from '../components/Footer'
import PongGameLarge from '../components/Game/PongGameLarge'
import Chat from '../components/Game/Chat'
import PlayerOpponentBar from '../components/Game/PlayerOpponentBar'

const Game = () => {
	return (
		<div className='min-h-screen bg-neutral-700 text-white flex flex-col'>
			<Header titleKey='game' />
			
			{/* Main content*/}
			<main className="flex-1 flex items-center justify-center px-4 py-8">
				<div className='flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 items-start justify-center w-full max-w-7xl xl:max-w-[1600px]'>
					{/*Game Module - temporarily Pong Game animation */}
					<div className="flex flex-col origin-top">
						<PlayerOpponentBar />
						<PongGameLarge />
					</div>
					<div className="h-[300px] w-full lg:h-[664px] lg:w-[350px] xl:h-[814px] xl:w-[437px]">
						<Chat />
					</div>
				</div>
			</main>

			<Footer />
		</div>
	)
}

export default Game;