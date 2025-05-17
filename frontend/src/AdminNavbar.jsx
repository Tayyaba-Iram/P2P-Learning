import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from './userContext';
import toast, { Toaster } from 'react-hot-toast';
import './AdminNavbar.css';


const AdminNavbar = () => {
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
  const { setUser } = useContext(UserContext);
  const location = useLocation(); 
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
 useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:3001/api/admin-dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(response => {
          setUserData(response.data.user);
        })
        .catch(err => {
          setError(err.response ? err.response.data.error : 'An error occurred');
        });
    } else {
      setError('Token is missing, please log in.');
    }
  }, []);
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

  // Function to handle the logout confirmation
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
         {userData ? (
    <span style={{fontWeight:'bold', fontSize:'18px'}} className="admin-name">Welcome {userData.name}!</span>
  ) : (
    <span className="admin-name">Loading...</span>
  )}

        <div className="nav-mid-links">
          <Link to="/admindashboard" className={isActive('/admindashboard') ? 'active' : ''}>Home</Link>
          <button 
                  style={{ backgroundColor: 'crimson'}}

          className="logout-button" onClick={() => setShowLogoutModal(true)}>Logout</button>
        </div>
        <Toaster position="top-center" />
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

export default AdminNavbar;
