import Button from "../../components/Button.test";
import { useNavigate } from "react-router-dom";
import Auth from "../../APIs/auth";



function home({ user, setUser }: { user: any, setUser: (user: any) => void }) {

  const navigate = useNavigate();

   const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    await Auth.post("/logout");
    setUser(null);
    navigate("/");

  };
  

  return (
    <>

    <div className="h-screen flex items-center justify-center flex-col">
      <div>
      <h1 className="text-6xl font-bold text-black">
        Welcome {user ? user.name : " "}!
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