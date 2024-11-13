import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Student Home.css';

function Home() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/api/student-dashboard', { withCredentials: true })
      .then(response => {
        setUserData(response.data.user);
      })
      .catch(err => {
        setError(err.response ? err.response.data.error : 'An error occurred');
      });
  }, []);

  return (
    <div className="content">
      <div className="banner">
        <div className="text-container">
          <h1>Welcome to Peer to Peer Learning!</h1>
        </div>
      </div>

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
<Link to="/studentupdateprofile">
        <button className="register-button">Profile Update</button>
      </Link>
      <Link to="/chat">
        <button className="register-button">Go to Chat</button>
      </Link>
    </div>
  );
}

export default Home;
