import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Student Home.css';

function Home() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the dashboard data from the backend API
    axios.get('http://localhost:3001/api/student-dashboard', { withCredentials: true }) // Send the token stored in cookies
      .then(response => {
        setUserData(response.data.user); // Store the user info
      })
      .catch(err => {
        setError(err.response ? err.response.data.error : 'An error occurred');
      });
  }, []); // Fetch data when component mounts

  return (
    <div className="content">
      <div className="banner">
        <div className="text-container">
          <h1>Welcome to Peer to Peer Learning!</h1>
        </div>
      </div>

      {/* Display user data if available */}
      {userData ? (
        <div className="user-info">
          <h2>Welcome: {userData.name}!</h2>
          <p>Email: {userData.email}</p>
        </div>
      ) : (
        <div className="error-message">
          {error ? <p>{error}</p> : <p>Loading user data...</p>}
        </div>
      )}

      {/* Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="Search..." />
        <button type="button">Search</button>
      </div>

      {/* Link to update profile */}
      <Link to="/studentupdateprofile">
        <button className="register-button">Update Profile</button>
      </Link>
    </div>
  );
}

export default Home;
