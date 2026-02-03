import Header from '../components/Header'
import Footer from '../components/Footer'
import PongGameLarge from '../components/Game/PongGameLarge'
import PlayerOpponentBar from '../components/Game/PlayerOpponentBar'

const Game = () => {
	return (
		<div className='min-h-screen bg-neutral-700 text-white flex flex-col'>
			<Header titleKey='game' />
			
			{/* Main content*/}
			<main className="flex-1 flex items-center justify-center px-1 py-2">
				<div>
					{/*Game Module - temporarily Pong Game animation */}
					<div className="flex flex-col origin-top">
						<PlayerOpponentBar />
						<PongGameLarge />
					</div>
					
				</div>
			</main>

			<Footer />
		</div>
	)
}

export default Game;