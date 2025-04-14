import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Monitor from './Components/Monitor';
import AllAttacks from './Components/AllAttacks';
import AddAttacker from './Components/AddAttacker';
import Navbar from './Components/Navbar';

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
      <Route path="/app" element={<Monitor />} />
          <Route path="/app/attacks" element={<AllAttacks />} />
          <Route path="/app/add-Attacker" element={<AddAttacker />} />
      </Routes>
    </Router>
  );
}

export default App;