import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './routes/routes_tests/home.test';
import Login from './routes/routes_tests/login.test';
import Auth from "./APIs/auth";
import PrivacyPolicy from './routes/routes_tests/PrivacyPolicy';
import TermsOfService from './routes/routes_tests/TermsOfService';
import Upload from "./routes/routes_tests/Upload";
import Register from "./routes/routes_tests/register" 
import { Navigate  } from 'react-router-dom';

Auth.defaults.withCredentials = true;

const App = () => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await Auth.get("/me");
                setUser(res.data);
            } catch (err) {
                setUser(null);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }


  

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home user={user} setUser={setUser}/>} />
          <Route path="/login" element={<Login setUser={setUser}/>} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register setUser={setUser}/>} />
          <Route path="/upload" element={<Upload />}/>

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </Router>
    </>
  )
}

export default App;