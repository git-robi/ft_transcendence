import Header from '../components/Header';
import FooterLogin from '../components/FooterLogin';
import PongGame from '../components/PongGame';
import LoginForm from '../components/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-neutral-700 text-white">
      <Header titleKey="loginSignup"/>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8">
        <div className="flex gap-32 items-center justify-center w-full max-w-7xl">
          {/* Pong Game - Hidden on small screens */}
          <div className="hidden lg:flex flex-1 justify-center items-center max-w-200">
            <PongGame />
          </div>

          {/* Login Form */}
          <div className="shrink-0">
            <LoginForm />
          </div>
        </div>
      </main>

      <FooterLogin />
    </div>
  );
};

export default Login;
