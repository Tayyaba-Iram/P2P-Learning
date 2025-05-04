import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Login.css';
import { UserContext } from './userContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  // Check if user is already logged in when the page loads or refreshes
  useEffect(() => {
    const token = sessionStorage.getItem('token'); // Get token from sessionStorage
    const user = sessionStorage.getItem('user'); // Get user from sessionStorage

    if (token && user) {
      // If token and user data exists, redirect to the appropriate dashboard
      const parsedUser = JSON.parse(user);
      setUser({ name: parsedUser.name, role: parsedUser.role });

      // Redirect based on role
      if (parsedUser.role === 'admin') {
        navigate('/admindashboard');
      } else if (parsedUser.role === 'superadmin') {
        navigate('/superdashboard');
      } else if (parsedUser.role === 'student') {
        navigate('/');
      }
    }
  }, [navigate, setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      let response;
      sessionStorage.setItem('lastVisitedPage', window.location.pathname);

      // Admin login
      if (email.endsWith('@admin.edu.pk')) {
        response = await axios.post(
          'http://localhost:3001/api/adminlogin',
          { email, password },
          { withCredentials: true }
        );
  
        if (response.data.success) {
          const loggedInUser = { ...response.data.user, role: 'admin' };
          sessionStorage.setItem('user', JSON.stringify(loggedInUser));
          sessionStorage.setItem('token', response.data.token);
          setUser(loggedInUser);
          toast.success('Login successfully!');
          navigate('/admindashboard');
        } else {
          setMessage('Invalid Email or Password');
        }
  
      // Superadmin login
      } else if (email.endsWith('@gmail.com')) {
        response = await axios.post(
          'http://localhost:3001/api/superadmin-check-or-create',
          { email, password },
          { withCredentials: true }
        );
  
        if (response.data.created) {
          toast.success('Super Admin account created successfully!');
        }
  
        if (response.data.success || response.data.created) {
          const loggedInUser = { ...response.data.user, role: 'superadmin' };
          sessionStorage.setItem('user', JSON.stringify(loggedInUser));
          sessionStorage.setItem('token', response.data.token);
          setUser(loggedInUser);
          toast.success('Login successfully!');
          navigate('/superdashboard');
        } else {
          setMessage('Invalid Email or Password');
        }
  
      // Student login
      } else {
        response = await axios.post(
          'http://localhost:3001/api/studentlogin',
          { email, password },
          { withCredentials: true }
        );
  
        if (response.data.success) {
          const loggedInUser = { ...response.data.user, role: 'student' };
          sessionStorage.setItem('user', JSON.stringify(loggedInUser));
          sessionStorage.setItem('token', response.data.token);
          setUser(loggedInUser);
          toast.success('Login successfully!');

          navigate('/');
        } else {
          if (
            response.data.message ===
            'Your account is suspended and blocked. Please contact support.'
          ) {
            setMessage('Your account is suspended. Please contact support.');
          } else {
            setMessage('Invalid Email or Password');
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
  
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Invalid Email or Password');
      }
    }
  };
  
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
  
    if (token && user) {
      const parsedUser = JSON.parse(user);
  
      if (parsedUser && parsedUser.role) {
        setUser({ name: parsedUser.name, role: parsedUser.role });
  
        // Redirect based on role
        if (parsedUser.role === 'admin') {
          navigate('/admindashboard');
        } else if (parsedUser.role === 'superadmin') {
          navigate('/superdashboard');
        } else if (parsedUser.role === 'student') {
          navigate('/');
        }
      } 
    }
  }, [navigate, setUser]);
  
  setTimeout(() => {
    setMessage('');
  }, 15000);


  return (
    <div className="login-container">
      <img src="Logo.jpg" alt="Logo" className="login-logo" />
      <h2>Welcome</h2>
      <p>In learning you will teach and in teaching you will learn!</p>

      <div className="login-section">
        <div className="login-header">
          <h2>Login to your account</h2>
        </div>

        {message && <p style={{ color: 'red', marginTop: "20px", fontSize: "16px" }}>{message}</p>}

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

          <div className="show-password">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword">Show Password</label>
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
          </div>

          <button type="submit" className="login-button">Login</button>
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
