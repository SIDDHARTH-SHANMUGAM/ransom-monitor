import React from 'react';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import Monitor from './Components/Monitor';
import AllAttacks from './Components/AllAttacks';
import AddAttacker from './Components/AddAttacker';
import Navbar from './Components/Navbar';
import ViewAttacks from './Components/ViewAttack';
import ViewAttacker from './Components/ViewAttacker';
import LoginPage from './Components/LoginPage';
import AddAdminPage from './Components/AddAdminPage';
import AuthCheck from './Components/AuthCheck';
import NotFound from './Components/NotFound';
import AgentStatus from './Components/AgentStatus';
import OnlineAttackers from './Components/OnlineAttackers';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/app" element={<LoginPage />} />
        <Route
          path="/app/*"
          element={
            <AuthCheck>
              <>
                <Navbar />
                <Routes>
                  <Route path="monitor" element={<Monitor />} />
                  <Route path="attacks" element={<AllAttacks />} />
                  <Route path="add-Attacker" element={<AddAttacker />} />
                  <Route path="add-Admin" element={<AddAdminPage />} />
                  <Route path="view-Attacker" element={<ViewAttacker />} />
                  <Route path="view-Online-Attacker" element={<OnlineAttackers />} />
                  <Route path="agent-Status" element={<AgentStatus />} />
                  <Route path="*" element={<NotFound/>} />
                </Routes>
              </>
            </AuthCheck>
          }
        />
        {/* Add this route outside the /app/* hierarchy */}
        <Route path="/attacks/:attackerId" element={
          <AuthCheck>
            <>
              <Navbar />
              <ViewAttacks />
            </>
          </AuthCheck>
        } />
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </Router>
  );
}

export default App;