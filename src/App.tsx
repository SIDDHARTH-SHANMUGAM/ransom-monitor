import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Monitor from './Components/Monitor';
import AllAttacks from './Components/AllAttacks';
import AddAttacker from './Components/AddAttacker';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import ViewAttacks from './Components/ViewAttack';

function App() {
  return (
    <Router>
      <Navbar/>
        <Routes>
          <Route path="/app" element={<Home />} />
          <Route path="/app/monitor" element={<Monitor />} />
          <Route path="/app/attacks" element={<AllAttacks />} />
          <Route path="/app/add-Attacker" element={<AddAttacker />} />
          <Route path="/attacks/:attackerId" element={<ViewAttacks />} />
        </Routes>
    </Router>
  );
}

export default App;