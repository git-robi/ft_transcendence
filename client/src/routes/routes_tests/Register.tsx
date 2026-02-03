import Button from "../../components/Button.test";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Auth from "../../APIs/auth";

function Register({ setUser }: { setUser: (user: any) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email and password are required");
      return;
    }
    if (password.length < 12) {
      setError("Password must be at least 12 characters");
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain at least one letter and one number");
      return;
    }

    try {
      const res = await Auth.post("/register", { name: name.trim(), email: email.trim(), password });
      setUser(res.data.user);
      navigate("/");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 flex justify-center">Register</h2>
        {error && (
          <p className="text-red-600 text-sm mb-2" role="alert">
            {error}
          </p>
        )}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 mb-2 w-full"
          autoComplete="name"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-2 w-full"
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password (min 12 chars, letter + number)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-2 w-full"
          autoComplete="new-password"
        />
        <div className="flex flex-col gap-2">
          <Button text="Register" type="submit" />
          <Link to="/login" className="text-center text-sm text-blue-600 hover:underline">
            Already have an account? Log in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
