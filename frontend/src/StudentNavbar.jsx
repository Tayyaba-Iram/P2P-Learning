import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from './userContext';
import toast, { Toaster } from 'react-hot-toast';
import { FaTachometerAlt, FaUser, FaLock, FaExclamationCircle, FaSignOutAlt , FaFolder, FaFolderOpen,FaBullhorn} from 'react-icons/fa'; // Import icons from react-icons
import './StudentNavbar.css';

function StudentNavbar() {
  const { setUser } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false); // State for dropdown menu
  const [showLogoutModal, setShowLogoutModal] = useState(false); // State for modal visibility

  useEffect(() => {
    const token = sessionStorage.getItem('token');

    if (token) {
      axios.get('http://localhost:3001/api/student-dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => setUserData(response.data.user))
        .catch(err => setError(err.response ? err.response.data.error : 'An error occurred'));
    } else {
      setError('Token is missing, please log in.');
    }
  }, []);

  const handleLogout = async () => {
    setShowLogoutModal(true); // Show confirmation modal when logout is clicked
  };

  const handleConfirmLogout = async () => {
    try {
      await axios.post('http://localhost:3001/api/logout', {}, { withCredentials: true });
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    } catch (err) {
      console.error('Error logging out:', err);
    }
    setShowLogoutModal(false); // Close the modal after confirming logout
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown); // Toggle dropdown visibility
  const closeDropdown = () => setShowDropdown(false); // Close dropdown when clicking outside

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-container')) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownSelect = () => {
    closeDropdown(); // Close dropdown after selecting an option
  };

  return (
    <>
      <div className="navbar">

        <div className="logo-container">
          <img src="Logo.jpg" alt="P2P Learning" className="logo-image" />
          <h3 className="logo-text">P2P Learning</h3>
        </div>

        <div className="profile-container">
          {userData ? (
            <div className="user-profile" onClick={toggleDropdown}>
              <h3>{userData.name}</h3>
              <i className="triangle-icon"></i>
            </div>
          ) : (
            <div className="error-message">
              {error ? <p>{error}</p> : <p>Loading user data...</p>}
            </div>
          )}
          {showDropdown && (
            <div className="dropdown-menu">
              <Link to="/" onClick={handleDropdownSelect}>
                <FaTachometerAlt /> Dashboard
              </Link>
              <Link to="/studentprofile" onClick={handleDropdownSelect}>
                <FaUser /> Profile
              </Link>
              <Link to="/resetpassword" onClick={handleDropdownSelect}>
                <FaLock /> Reset Password
              </Link>
              <Link to="/repository" onClick={handleDropdownSelect}>
                <FaFolder /> Repository
              </Link>
              <Link to="/directory" onClick={handleDropdownSelect}>
              <FaFolderOpen /> Directory
              </Link>
              <Link to="/complains" onClick={handleDropdownSelect}>
                <FaExclamationCircle /> Complaints
              </Link>
              <Link to="/broadcastRequest" onClick={handleDropdownSelect}>
                <FaBullhorn style={{ marginRight: '4px' }} />
                Broadcast Request
              </Link>


              <button className="logout-button-student" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
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
