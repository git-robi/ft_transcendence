import Header from "../components/Header";
import Footer from "../components/Footer";
import SignUpForm from "../components/SignUp/SignUpForm";
import type { PublicUser } from "../types";

interface SignUpProps {
  setUser: (user: PublicUser | null) => void;
}

const SignUp = ({ setUser }: SignUpProps) => {
  return (
     <div className="min-h-screen bg-neutral-700 text-white flex flex-col">
      <Header titleKey='signUp'/>
        <div className="flex-1 flex items-center justify-center">
          <SignUpForm setUser={setUser} />
        </div>
      <Footer showHome={false} showLogout={false} showChat={false} />
     </div>
  )
}

export default SignUp;