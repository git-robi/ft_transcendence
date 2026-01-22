import Button from "../../components/Button.test";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Auth from "../../APIs/auth";

function login({ setUser }: { setUser: (user: any) => void }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //check input correctness
    // this is a very basic check, we can add more validation later
    if (!email.trim() || !password.trim()) {
      console.error("Name and password are required");
      return;
    }

    try {
      
      const res = await Auth.post("/login", {email, password});
      setUser(res.data.user);
      navigate("/");

    } catch (err) {
      console.error("Invalid credentials");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">

      <form onSubmit={(e) => handleSubmit(e)} className="bg-white p-6 rounded shadow-md" > 
        <h2 className="text-xl font-bold mb-4 flex justify-center">Login</h2>
        <input type="text" placeholder="Name" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 mb-2 w-full" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 mb-2 w-full" />
        <div className="flex justify-end">
        <Button text="Login" type="submit" />
        <Button text="Login with Google" type="button" onClick={() => window.location.href = 'http://localhost:3001/api/v1/auth/google'}/>
        <Button text="Login with GitHub" type="button" onClick={() => window.location.href = 'http://localhost:3001/api/v1/auth/github'}/>
        </div>
      </form>

    </div>
  )
}

export default login