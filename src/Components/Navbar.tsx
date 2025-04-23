import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Monitor, Shield, UserPlus, UserPlus as UserPlusIcon, Power } from 'lucide-react';

interface LogoutConfirmationModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({ onCancel, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">Confirm Logout</h3>
        <p className="modal-message">Are you sure you want to logout?</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-primary">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

function Navbar() {
  const [load, setLoader] = useState(true);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    sessionStorage.removeItem('token');
    navigate('/app');
    setShowLogoutModal(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/app/monitor" className="nav-brand">
          <span className="logo-text">RansomMonitor</span>
        </NavLink>
        <div className="nav-links">
          <NavLink
            to="/app/monitor"
            end
            className={({ isActive }) => `nav-link ${isActive || load ? 'active' : ''}`}
          >
            <Monitor className="nav-icon" />
            <span className="nav-text">Monitor</span>
          </NavLink>
          <NavLink
            to="/app/attacks"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setLoader(false)}
          >
            <Shield className="nav-icon" />
            <span className="nav-text">Attacks</span>
          </NavLink>
          <NavLink
            to="/app/add-attacker"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setLoader(false)}
          >
            <UserPlus className="nav-icon" />
            <span className="nav-text">Add Attacker</span>
          </NavLink>
          <NavLink
            to="/app/add-admin"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setLoader(false)}
          >
            <UserPlusIcon className="nav-icon" />
            <span className="nav-text">Add Admin</span>
          </NavLink>
          <button onClick={handleLogoutClick} className="nav-link logout-button">
            <Power className="nav-icon" />
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <LogoutConfirmationModal onCancel={handleLogoutCancel} onConfirm={handleLogoutConfirm} />
      )}
    </nav>
  );
}

export default Navbar;