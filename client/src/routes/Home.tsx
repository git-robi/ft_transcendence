import Header from '../components/Header';
import Footer from '../components/Footer';
import PongGame from '../components/PongGame';
import HomeButtons from '../components/HomeButtons';


const Home = () => {
  return (
    <div className="min-h-screen bg-neutral-700 text-white">
      <Header titleKey='home'/>

      {/* Main content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8">
        <div className="flex items-center justify-center w-full max-w-7xl gap-16">
          {/*Pong Game - Hidden on small screens */}
          <div className="hidden lg:flex flex-1 justify-center items-center max-w-150">
            <PongGame />
          </div>

          {/* Home Buttons */}
          <div className="shrink-0">
            <HomeButtons />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;