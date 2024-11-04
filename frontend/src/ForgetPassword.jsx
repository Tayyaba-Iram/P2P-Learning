import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './ForgotPassword.css';
function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    }
 

  return (
    <div className="login-container">
      <div className="left-section">
        <img src="Logo.jpg" alt="Logo" className="login-logo" />
        <h2>Welcome</h2>
        <p>In learning you will teach and</p>
        <p> in teaching you will learn!</p>
        <Link to="/register"> <button className="register-button">Register</button> </Link>
      </div>
      <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="forgot-password-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="forgot-password-button">Send Reset Link</button>
        </form>
        {message && <p className="forgot-password-message">{message}</p>}
        <Link to="/login" className="login-back">Back to Login</Link>
 
      </div>
    </div>

      <Toaster position="top-center" />
    </div> 
  );
};



export default ForgotPassword;
