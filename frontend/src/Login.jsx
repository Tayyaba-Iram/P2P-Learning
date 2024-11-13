import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation checks
    if (email === "") {
      toast.error("Email is required!");
    } else if (!email.includes("@")) {
      toast.warning("Email must include '@'!");
    } else if (password === "") {
      toast.error("Password is required!");
    } else if (password.length < 4) {
      toast.error("Password must be at least 4 characters!");
    } else {
      // Determine database to check based on email domain
      if (email.endsWith('@admin.edu.pk')) {
        axios.post('http://localhost:3001/api/adminlogin', { email, password }, { withCredentials: true })
          .then(res => {
            if (res.data.success) {
              localStorage.setItem("authToken", res.data.token); // Store token in localStorage
              toast.success('University Admin login successful!');
              setTimeout(() => navigate('/'), 1000);
            } else {
              toast.error('Login failed. ' + res.data.message);
            }
          })
          .catch(err => {
            console.error(err);
            toast.error('Invalid email or password!');
          });
      } else if (email.endsWith('@gmail.com')) {
        axios.post('http://localhost:3001/api/superadmin-check-or-create', { email, password }, { withCredentials: true })
          .then(res => {
            if (res.data.created) {
              toast.success('Super Admin account created successfully!');
            } else if (res.data.success) {
              localStorage.setItem("authToken", res.data.token); // Store token in localStorage
              toast.success('Super Admin login successful!');
            } else {
              toast.error('Login failed.');
            }
  
            if (res.data.success || res.data.created) {
              setTimeout(() => navigate('/'), 1000);
            }
          })
          .catch(err => {
            console.error(err);
            toast.error('Error verifying or creating Super Admin!');
          });
      } else {
        axios.post('http://localhost:3001/api/studentlogin', { email, password })
          .then(res => {
            if (res.data.success) {
              localStorage.setItem("authToken", res.data.token); // Store token in localStorage
              toast.success('Login successfully!');
              setTimeout(() => navigate('/'), 1000);
            } else {
              toast.error('Login failed. ' + res.data.message);
            }
          })
          .catch(err => {
            console.error(err);
            toast.error('Invalid email or password!');
          });
      }
    }
  };

  return (
    <div className="login-container">
      <div className="left-section">
        <img src="Logo.jpg" alt="Logo" className="login-logo" />
        <h2>Welcome</h2>
        <p>In learning you will teach and</p>
        <p> in teaching you will learn!</p>
        <Link to="/register"> <button className="register-button">Register</button> </Link>
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
            <Link to="/forgotpassword" className="forgot-password-link">Forgot Password?</Link>
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

export default Login;
