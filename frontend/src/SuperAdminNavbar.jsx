import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from './userContext';
import './SuperAdminNavbar.css';

const SuperAdminNavbar = () => {
  const { setUser } = useContext(UserContext);
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/api/logout', {}, { withCredentials: true });
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      window.location.href = '/login'; 
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleConfirmLogout = () => {
    handleLogout();
    setShowLogoutModal(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="navbar">
        <div className="logo-container">
          <img src="Logo.jpg" alt="P2P Learning" className="logo-image" />
          <h3 className="logo-text">P2P Learning</h3>
        </div>

        <div className="nav-mid-links">
          <Link to="/superdashboard" className={isActive('/superdashboard') ? 'active' : ''}>Home</Link>
          <Link to="/adminregisteration" className={isActive('/adminregisteration') ? 'active' : ''}>Register Admin</Link>
          <Link to="/adduniversity" className={isActive('/adduniversity') ? 'active' : ''}>Add University</Link>
          <Link to="/super-payments" className={isActive('/super-payments') ? 'active' : ''}>Payments</Link>
          <button
            style={{ backgroundColor: 'crimson' }}

            className="logout-button" onClick={() => setShowLogoutModal(true)}>Logout</button>
        </div>
      </div>

      {/* Modal for logout confirmation */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="modal-buttons">
              <button style={{
                backgroundColor: 'crimson',
              }}
                className="confirm-button" onClick={handleConfirmLogout}>Yes</button>
              <button className="cancel-button" onClick={() => setShowLogoutModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuperAdminNavbar;
