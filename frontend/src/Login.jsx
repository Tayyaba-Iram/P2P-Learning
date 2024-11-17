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
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); // Use UserContext

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (email === "") {
      toast.error("Email is required!");
      return;
    } else if (!email.includes("@")) {
      toast.warning("Email must include '@'!");
      return;
    } else if (password === "") {
      toast.error("Password is required!");
      return;
    } else if (password.length < 3) {
      toast.error("Password must be at least 4 characters!");
      return;
    }

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
          toast.success('University Admin login successful!');
          navigate('/admindashboard');
        } else {
          toast.error(response.data.message || 'Admin login failed');
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
          toast.success('Super Admin login successful!');
        } else {
          toast.error(response.data.message || 'Super Admin login failed');
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

            toast.success('Student login successful!');
            navigate('/');  // Navigate to home
          } else {
            toast.error(response.data.message || 'Student login failed');
          }
        } catch (error) {
          console.error(error);
          toast.error('An error occurred during login');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during login');
    }
  };

  return (
    <div className="login-container">
      <div className="left-section">
        <img src="Logo.jpg" alt="Logo" className="login-logo" />
        <h2>Welcome</h2>
        <p>In learning you will teach and in teaching you will learn!</p>
        <Link to="/register">
          <button className="register-button">Register</button>
        </Link>
      </div>

      <div className="right-section">
        <div className="login-header">
          <h1>Login to your account</h1>
        </div>

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

          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

export default Login;
