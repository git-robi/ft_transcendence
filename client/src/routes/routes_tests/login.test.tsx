import Button from "../../components/Button.test";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //check input correctness
    // this is a very basic check, we can add more validation later
    if (!username.trim() || !password.trim()) {
      console.error("Username and password are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/v1/test/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
       
      // handle response from api
      console.log("Response:", res);
      console.log("Response status:", res.status);
      

      if (!res.ok) {
        console.error("Login failed");
        return;
      }

      console.log("Login successful");

      // set user state

      navigate("/");
      

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