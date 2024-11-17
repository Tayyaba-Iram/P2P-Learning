import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from './userContext';
import toast, { Toaster } from 'react-hot-toast';
import './StudentNavbar.css';
import Cookies from 'js-cookie';

function StudentNavbar() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      // Call the logout API endpoint to handle any server-side logic (optional)
      await axios.post('http://localhost:3001/api/logout', {}, { withCredentials: true });
  
      // Remove token from sessionStorage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
  
      // Optionally, clear other user-related data from sessionStorage or state
      window.location.href = '/login'; // Redirect user to the login page
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Function to check if a link is active
  const isActive = (path) => location.pathname === path;

  // Function to confirm logout
  const handleConfirmLogout = () => {
    handleLogout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className="navbar">
        <div className="logo-container">
          <img src="Logo.jpg" alt="P2P Learning" className="logo-image" />
          <h3 className="logo-text">P2P Learning</h3>
        </div>

        <div className="nav-mid-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/ScheduleSession" className={isActive('/ScheduleSession') ? 'active' : ''}>Schedule Session</Link>
          <Link to="/ConductSession" className={isActive('/ConductSession') ? 'active' : ''}>Conduct Session </Link>
          <Link to="/chat" className={isActive('/chat') ? 'active' : ''}>Chat</Link>
          <Link to="/complain-form" className={isActive('/complain-form') ? 'active' : ''}>Complain Form</Link>
          <Link to="/studentupdateprofile" className={isActive('/studentupdateprofile') ? 'active' : ''}>Update Profile</Link>
          <button className="logout-button" onClick={() => setShowLogoutModal(true)}>Logout</button>
        </div>
        <Toaster position="top-center" />
      </div>

      {/* Modal for logout confirmation */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to log out?</p>
            <div className="modal-buttons">
              <button className="confirm-button" onClick={handleConfirmLogout}>Yes</button>
              <button className="cancel-button" onClick={() => setShowLogoutModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentNavbar;
