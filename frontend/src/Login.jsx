import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Login.css';
import { UserContext } from './userContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); // Use UserContext

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      // Determine database to check based on email domain
      if (email.endsWith('@admin.edu.pk')) {
        response = await axios.post(
          'http://localhost:3001/api/adminlogin',
          { email, password },
          { withCredentials: true }
        );

        if (response.data.success) {
          setUser({ name: response.data.name, role: 'admin' });
          sessionStorage.setItem('token', response.data.token);  // Using sessionStorage instead of localStorage
          sessionStorage.setItem('user', JSON.stringify(response.data.user));  // Using sessionStorage
          console.log(sessionStorage.getItem('token')); // Log token
          console.log(sessionStorage.getItem('user')); // Log user data
          navigate('/admindashboard');
        } else {
          setMessage('Invalid Email or Password');
        }
      } else if (email.endsWith('@gmail.com')) {
        response = await axios.post(
          'http://localhost:3001/api/superadmin-check-or-create',
          { email, password },
          { withCredentials: true }
        );

        if (response.data.created) {
          toast.success('Super Admin account created successfully!');
        } else if (response.data.success) {
          setUser({ name: response.data.name, role: 'superadmin' });
          sessionStorage.setItem('token', response.data.token);  // Using sessionStorage instead of localStorage
          sessionStorage.setItem('user', JSON.stringify(response.data.user));  // Using sessionStorage
          console.log(sessionStorage.getItem('token')); // Log token
          console.log(sessionStorage.getItem('user')); // Log user data
        } else {
          setMessage('Invalid Email or Password');
        }

        if (response.data.success || response.data.created) {
          navigate('/superdashboard');
        }
      } else {
        // Student login
        try {
          const response = await axios.post('http://localhost:3001/api/studentlogin', { email, password }, { withCredentials: true });

          // Log the response for debugging
          console.log('Response:', response.data);

          if (response.data.success) {
            setUser({ name: response.data.name, role: 'student' });
            sessionStorage.setItem('token', response.data.token);  // Using sessionStorage instead of localStorage
            sessionStorage.setItem('user', JSON.stringify(response.data.user));  // Using sessionStorage
            console.log(sessionStorage.getItem('token')); // Log token
            console.log(sessionStorage.getItem('user')); // Log user data
            navigate('/');  // Navigate to home
          } else {
            setMessage('Invalid Email or Password');
          }
        } catch (error) {
          console.error(error);
          setMessage('Invalid Email or Password');
        }
      }
    } catch (error) {
      console.error(error);
      setMessage('Invalid Email or Password');
    }
  };

  return (
    <div className="login-container">
        <img src="Logo.jpg" alt="Logo" className="login-logo" />
        <h2>Welcome</h2>
        <p>In learning you will teach and in teaching you will learn!</p>
        
      <div className="login-section">
        <div className="login-header">
          
          <h2>Login to your account</h2>
        </div>
        {message && <p style={{ color: 'red', marginTop:"20px"}}>{message}</p>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Toggle password visibility */}
          <div className="show-password">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword">Show Password</label>
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password">
            <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
          </div>

          <button type="submit" className="login-button" >Login</button>
          <p className="signup-text">
        Don't have an account? <Link to="/register" className="signup-link">Sign Up</Link>
      </p>
        </form>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

export default Login;