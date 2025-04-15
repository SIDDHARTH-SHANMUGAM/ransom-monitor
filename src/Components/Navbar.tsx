import { NavLink } from 'react-router-dom';
import { Monitor, Shield, UserPlus } from 'lucide-react';
import { useState } from 'react';
function Navbar() {
  const [load, setLoader] = useState(true);
  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="nav-brand">
          <span className="logo-text">RansomMonitor</span>
        </NavLink>
        <div className="nav-links">
          <NavLink 
            to="/app/monitor" 
            end
            className={({ isActive }) => `nav-link ${isActive||load ? 'active' : ''}`}
          >
            <Monitor className="nav-icon" />
            <span className="nav-text">Monitor</span>
          </NavLink>
          <NavLink 
            to="/app/attacks" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={()=>{setLoader(false)}}
          >
            <Shield className="nav-icon" />
            <span className="nav-text">Attacks</span>
          </NavLink>
          <NavLink 
            to="/app/add-attacker" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={()=>{setLoader(false)}}
          >
            <UserPlus className="nav-icon" />
            <span className="nav-text">Add Attacker</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;