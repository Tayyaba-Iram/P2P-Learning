import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { userContext } from './App';
import { FaUser, FaCog, FaComment, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
import './StudentNavbar.css';

function Navbar() {
    const user = useContext(userContext);
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeItem, setActiveItem] = useState('');

    const menuItems = [
        { name: 'Edit Profile', icon: <FaUser />, path: '/edit-profile' },
        { name: 'Settings', icon: <FaCog />, path: '/settings' },
        { name: 'Feedback', icon: <FaComment />, path: '/feedback' },
        { name: 'Help', icon: <FaQuestionCircle />, path: '/help' },
        { name: 'Logout', icon: <FaSignOutAlt />, path: '/logout' },
    ];

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="navbar">
            {/* Sidebar Container */}
            <div className={`sidebar-bar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="hamburger-icon" onClick={toggleSidebar}>
                    &#9776; {/* Hamburger icon */}
                </button>
                <div className="sidebar-icons">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`sidebar-item ${activeItem === item.name ? 'active' : ''}`}
                            onClick={() => setActiveItem(item.name)}
                        >
                            <div className="sidebar-icon">{item.icon}</div>
                            {isSidebarOpen && <span className="sidebar-text">{item.name}</span>}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Navbar Content */}
            <div className="logo-container">
                <img src="Logo.jpg" alt="P2P Learning" className="logo-image" />
                <h3 className="logo-text">P2P Learning</h3>
            </div>

            <div className="nav-mid-links">
                <Link to="/" className='link'>Home</Link>
            <Link to="/ConductSession" className="CS">ConductSession</Link>

            </div>
            <div className="auth-buttons">
                <Link to="/register"><button className="btn">Sign Up</button></Link>
                <Link to="/login"><button className="btn">Sign In</button></Link>
            </div>
        </div>
    );
}

export default Navbar;
