import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from './userContext';
import toast, { Toaster } from 'react-hot-toast';
import { FaHistory, FaClipboardList, FaShieldAlt, FaQuestionCircle, FaTachometerAlt, FaUser, FaLock, FaExclamationCircle, FaSignOutAlt, FaFolder, FaFolderOpen, FaBullhorn } from 'react-icons/fa'; // Import icons from react-icons
import './StudentNavbar.css';

function StudentNavbar() {
  const { setUser } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    setShowLogoutModal(true);
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
    setShowLogoutModal(false);
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const closeDropdown = () => setShowDropdown(false);

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
    closeDropdown();
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
              {error ? <p>{error}</p> : <p style={{backgroundColor:'white'}}>Loading user data...</p>}
            </div>
          )}
          {showDropdown && (
            <div className="dropdown-menu"   >
              <Link to="/" onClick={handleDropdownSelect}
                style={{
                  display: "inline-flex",
                  gap: "8px",
                  marginTop: "10px"
                }}>
                <FaTachometerAlt /> Dashboard
              </Link>
              <Link to="/studentprofile" onClick={handleDropdownSelect}
                style={{
                  display: "inline-flex",
                  gap: "8px", 
                }}>
                <FaUser /> Profile
              </Link>
              <Link to="/resetpassword" onClick={handleDropdownSelect}
                style={{
                  display: "inline-flex",
                  gap: "8px", 
                }}>
                <FaLock /> Reset Password
              </Link>
              <Link to="/repository" onClick={handleDropdownSelect}
                style={{
                  display: "inline-flex",
                  gap: "8px", 
                }}>
                <FaFolder /> Repository
              </Link>
              <Link to="/directory" onClick={handleDropdownSelect}
                style={{
                  display: "inline-flex",
                  gap: "8px", 
                }}>
                <FaFolderOpen /> Directory
              </Link>
              <Link to="/resourceRequest" onClick={handleDropdownSelect}
                style={{
                  display: "inline-flex",
                  gap: "8px", 
                }}>
                <FaClipboardList />
                Resource Requests
              </Link>
              <Link to="/complains" onClick={handleDropdownSelect}
                style={{
                  display: "inline-flex",
                  gap: "8px", 
                }}>
                <FaExclamationCircle /> Complaints
              </Link>
              <Link to="/broadcastRequest" onClick={handleDropdownSelect}
                style={{
                  display: "inline-flex",
                  gap: "8px", 
                }}>
                <FaBullhorn />
                Broadcast Request
              </Link >
              <Link
                to="/paymentHistory"
                onClick={handleDropdownSelect}
                style={{
                  display: "inline-flex",
                  gap: "8px",
                }}
              >
                <FaHistory />
                Session Histroy
              </Link>
              <Link to="/help" onClick={handleDropdownSelect}
                style={{
                  display: "inline-flex",
                  gap: "8px", 
                }}>
                <FaQuestionCircle />
                Help
              </Link>

              <Link
                to="/privacy"
                onClick={handleDropdownSelect}
                style={{
                  display: "inline-flex",
                  gap: "8px", 
                }}
              >
                <FaShieldAlt />
                Privacy Policy
              </Link>


              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "14px",
                  marginLeft: "1px",
                  marginRight: '4px',
                  marginBottom: "7px",
                  marginTop: "0px"
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#48742F")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#000")}
              >
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
}

export default StudentNavbar;
