import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; 
import './App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  axios.defaults.withCredentials = true;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for empty fields
    if (email === "") {
      toast.error("Email is required!", {});
    } else if (!email.includes("@")) {
      toast.warning("Email must include '@'!", { position: "top-center" });
    } else if (password === "") {
      toast.error("Password is required!", { position: "top-center" });
    } else if (password.length < 4) {
      toast.error("Password must be at least 4 characters!", {});
    } else {
      axios.post('http://localhost:3001/login', { email, password })
        .then(res => {
          if (res.data === "Success") {
            toast.success('Login successfully!');
            setEmail(''); 
            setPassword('');
            window.location.href = "/"; 
          } else {
            toast.error('Login failed. Please check your credentials.');
          }
        })
        .catch(err => {
          console.log(err);
          toast.error('An error occurred. Please try again.');
        });
    }
  }

  return (
    <>
      <div className='login'>
        <div className='login_form'>
          <img src="Logo.jpg" alt="Logo" className="login-logo" />
          <h1>Log in to your account</h1>
          <br />
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Email:</label><br />
              <input 
                type="email" 
                placeholder='Enter Email' 
                value={email}
                onChange={e => setEmail(e.target.value)}  
              />
            </div>
            <br />
            <div>
              <label htmlFor="password">Password:</label><br />
              <input 
                type="password" 
                placeholder='********' 
                value={password}
                onChange={e => setPassword(e.target.value)}  
              />
            </div>
            <button className='login_btn'>Login</button>
          </form>
          <br />
          <p>Don't have an account? <strong><Link to="/register" style={{ color: '#548635', textDecoration: 'underline' }}>Sign up</Link></strong></p>
          </div>
      </div>
      <Toaster position="top-center" />
    </>
  );
}

export default Login;
