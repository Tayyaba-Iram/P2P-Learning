import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import axios from 'axios';
function StudentNavbar() {
  <axios className="default withcre"></axios>  
   
    return (
        <div className="navbar">
            <div className="logo-container">
                <img src="Logo.jpg" alt="P2P Learning" className="logo-image" />
                <h3 className="logo-text">P2P Learning</h3>
            </div>

            <div className="nav-mid-links">
                <Link to="/" className="link">Home</Link>
            </div>
            <Link to="/">Home</Link>
        <Link to="/ScheduleSession">Schedule Session</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/complain-form">Complain Form</Link>
        <Link to="/studentupdateprofile">Update Profile</Link>
        </div>
    );
}

export default StudentNavbar;
