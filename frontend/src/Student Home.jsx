import React from 'react';
import { Link } from 'react-router-dom';
import './Student Home.css';

function Home() {
  return (
      <div className="content">
        <div className="banner">
          <div className="text-container">
            <h1>Welcome to Peer to Peer Learning!</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
          <button type="button">Search</button>
        </div>

      </div>
  );
}

export default Home;
