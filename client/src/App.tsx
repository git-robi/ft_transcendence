import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './routes/routes_tests/home.test';
import Login from './routes/routes_tests/login.test';


function App() {
  

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </>
  )
}

export default App;