import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Login.css';

function Login() {
  const [role, setRole] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "") {
      toast.error("Email is required!");
    } else if (!email.includes("@")) {
      toast.warning("Email must include '@'!");
    } else if (password === "") {
      toast.error("Password is required!");
    } else if (password.length < 4) {
      toast.error("Password must be at least 4 characters!");
    } else {
      // Handle login based on role
      if (role === 'student') {
        // Student login API call
        axios.post('http://localhost:3001/api/studentlogin', { email, password })
          .then(res => {
            if (res.data.success) {
              toast.success('Login successfully!');
              setTimeout(() => {
                navigate('/');
              }, 1000);
              setEmail('');
              setPassword('');
            } else {
              toast.error('Login failed. ' + res.data.message);
            }
          })
          .catch(err => {
            console.log(err);
            toast.error('Invalid email or password!');
          });
      } else if (role === 'universityadmin') {
        // University admin login API call
        axios.post('http://localhost:3001/api/university-admin-login', { email, password })
          .then(res => {
            if (res.data.success) {
              toast.success('Login successfully!');
              setTimeout(() => {
                navigate('/');
              }, 1000);
              setEmail('');
              setPassword('');
            } else {
              toast.error('Login failed. ' + res.data.message);
            }
          })
          .catch(err => {
            console.log(err);
            toast.error('Invalid email or password!');
          });
      } else if (role === 'superadmin') {
        // Hardcoded superadmin credentials
        if (email === "superadmin@gmail.com" && password === "superadmin") {
          toast.success('Super Admin login successful!');
          setTimeout(() => {
            navigate('/');
          }, 1000);
          setEmail('');
          setPassword('');
        } else {
          toast.error('Invalid super admin email or password!');
        }
      } else {
        toast.error('Please select a role to log in.');
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

        <div className="role-toggle">
          <input
            type="radio"
            id="superadmin"
            name="role"
            value="superadmin"
            checked={role === 'superadmin'}
            onChange={() => setRole('superadmin')}
          />
          <label htmlFor="superadmin" className={role === 'superadmin' ? 'active' : ''}>Super Admin</label>

          <input
            type="radio"
            id="universityadmin"
            name="role"
            value="universityadmin"
            checked={role === 'universityadmin'}
            onChange={() => setRole('universityadmin')}
          />
          <label htmlFor="universityadmin" className={role === 'universityadmin' ? 'active' : ''}>University Admin</label>

          <input
            type="radio"
            id="student"
            name="role"
            value="student"
            checked={role === 'student'}
            onChange={() => setRole('student')}
          />
          <label htmlFor="student" className={role === 'student' ? 'active' : ''}>Student</label>
        </div>

        <h2>Apply as a {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
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
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
