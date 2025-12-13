import Button from "../../components/Button.test";
import { useNavigate } from "react-router-dom";



function home() {

  const navigate = useNavigate();

  function handleLogin() {
    navigate('/login');
}

  return (
    <>

    <div className="h-screen flex items-center justify-center flex-col">
      <div>
      <h1 className="text-6xl font-bold text-black">
        Welcome!
      </h1>
      </div>
      <div className="mt-4">
      <Button text="login" onClick={handleLogin}/>
      </div>
    </div>

    </>
  )
}

export default home