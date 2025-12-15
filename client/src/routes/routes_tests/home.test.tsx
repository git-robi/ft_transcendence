import Button from "../../components/Button.test";
import { useNavigate } from "react-router-dom";
import { useState } from "react";



function home({ user, setUser }: { user: any, setUser: (user: any) => void }) {

  const navigate = useNavigate();

  function handleLogin() {
    navigate('/login');
}

  function handleLogout() {
    // TODO: implement logout
    
    // Call backend logout endpoint
    fetch('http://localhost:3001/api/v1/test/logout', {
      method: 'POST',
      credentials: 'include',
    })
    .then(response => {
      if (response.ok) {
        setUser(null);
        navigate("/");
      }
    })
    .catch(error => {
      console.error('Logout failed:', error);
      setUser(null);
      navigate("/");
    });
  }


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