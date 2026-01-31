import Header from "../components/Header";
import Footer from "../components/Footer";
import SignUpForm from "../components/SignUp/SignUpForm";

const SignUp = () => {
  return (
     <div className="min-h-screen bg-neutral-700 text-white flex flex-col">
      <Header titleKey='signUp'/>
        <div className="flex-1 flex items-center justify-center">
          <SignUpForm />
        </div>
      <Footer />
     </div>
  )
}

export default SignUp;