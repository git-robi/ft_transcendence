import Header from '../components/Header';
import Footer from '../components/Footer';
import PongGame from '../components/PongGame';
import LogInForm from '../components/LogIn/LogInForm';

interface LogInProps {
  setUser: (user: any) => void;
}

const LogIn = ({ setUser }: LogInProps) => {
  return (
    <div className="min-h-screen bg-neutral-700 text-white flex flex-col">
      <Header titleKey="logInSignUp"/>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="flex gap-32 items-center justify-center w-full max-w-7xl">
          {/* Pong Game - Hidden on small screens */}
          <div className="hidden lg:flex flex-1 justify-center items-center max-w-200">
            <PongGame />
          </div>

          {/* LogIn Form */}
          <div className="shrink-0">
            <LogInForm setUser={setUser} />
          </div>
        </div>
      </main>

      <Footer showHome={false} showLogout={false} showChat={false} />
    </div>
  );
};

export default LogIn;
