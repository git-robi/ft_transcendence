import {useState} from 'react'
import Auth from "../../APIs/auth";
import { useNavigate } from 'react-router-dom';

const Register = ({ setUser }: { setUser: (user: any) => void }) => {
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  //const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();

    try {
      
      const res = await Auth.post("/register", form);
      setUser(res.data.user);
      navigate("/");

    } catch (err) {
      //setError("Registration failed")
      console.log("registration failed")
    }
  }

  return (
    <div>
      <form>
        <h2> Register </h2>
        <input type="text" placeholder="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}/>
        <input type="email" placeholder="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}/> 
        <input type="password" placeholder="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}/> 
        <button onClick={handleSubmit}>Register</button>
      </form>
    </div>
  )
}

export default Register