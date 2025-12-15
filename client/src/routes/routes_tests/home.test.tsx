import Button from "../../components/Button.test";
import { useNavigate } from "react-router-dom";



function home({ user }: { user: any }) {

  const navigate = useNavigate();

  function handleLogin() {
    navigate('/login');
}

  function handleLogout() {
    // TODO: implement logout
  }


  return (
    <>

    <div className="h-screen flex items-center justify-center flex-col">
      <div>
      <h1 className="text-6xl font-bold text-black">
        Welcome {user ? user.username : " "}!
      </h1>
      </div>
      <div className="mt-4">
      {!user ? <Button text="login" onClick={handleLogin}/> : <Button text="logout" onClick={handleLogout}/>}
      </div>
    </div>

    </>
  )
}

export default home