import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; 
import './Student Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "") {
      toast.error("Email is required!", {});
    } else if (!email.includes("@")) {
      toast.warning("Email must include '@'!", { position: "top-center" });
    } else if (password === "") {
      toast.error("Password is required!", { position: "top-center" });
    } else if (password.length < 4) {
      toast.error("Password must be at least 4 characters!", {});
    } else {
      axios.post('http://localhost:3001/api/login', { email, password })
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
              <Link to="/forgot-password" className="forgot-password-link" style={{ display: 'block', marginTop: '5px', color: '#548635', textDecoration: 'underline' }}>
                Forgot Password?
              </Link>
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
