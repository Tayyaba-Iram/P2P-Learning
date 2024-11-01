import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { userContext } from './App';
import './Student Navbar.css';


function Navbar() {
    const user = useContext(userContext);

    const location = useLocation();
    return (
        <div className="navbar">
            <div className="logo-container">
                <img src="Logo.jpg" alt="P2P Learning" className="logo-image" />
                <h3 className="logo-text">P2P Learning</h3>
            </div>
            <div className="nav-mid-links">
                <Link to="/" className='link'>Home</Link>
                <Link to="/ScheduleSession" className="link">ScheduleSession</Link>
                <Link to="/ConductSession" className="link">ConductSession</Link>
                
            </div>
            <div className="auth-buttons">

                <Link to="/register"> <button className="btn">Sign Up</button> </Link>
                <Link to="/login"> <button className="btn">Sign In</button> </Link>
            </div>
        </div>
    );
}

export default Navbar;
