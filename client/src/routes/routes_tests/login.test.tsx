import Button from "../../components/Button.test";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      //make call to API
      // set user state
      navigate("/");
      
      // TODO: Implement actual API call and navigation
      // For now, just log the successful login
      console.log("Login successful - would navigate to home page");

    } catch (err) {
      console.error("Invalid credentials")
    }
    
    console.log('Login attempt with:', { username, password });
  };

  return (
    <div className="h-screen flex items-center justify-center">

      <form onSubmit={(e) => handleSubmit(e)} className="bg-white p-6 rounded shadow-md" > {/*add on submit logic*/}
        <h2 className="text-xl font-bold mb-4 flex justify-center">Login</h2>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="border p-2 mb-2 w-full" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 mb-2 w-full" />
        <div className="flex justify-end">
        <Button text="Login" type="submit" />
        </div>
      </form>

    </div>
  )
}

export default login