import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://localhost:3001/api/request-reset-password', { email })
      .then(res => {
        setMessage(res.data.message);
        if (res.data.success) {
          toast.success(res.data.message);
          if (res.data.link) {
            setResetLink(res.data.link);
            console.log(res.data.link);
          }
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(err => {
        console.log(err);
        toast.error('Error requesting password reset');
      });
  };

  return (
    <div>
      <form className='forgot-form' onSubmit={handleSubmit}>
        <h3>Request Password Reset</h3>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className='submit-reset-buttonnnnn' type="submit">Send Reset Link</button>
        <Link className='back-login' to="/login">Back to Login</Link>
        {resetLink && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href={resetLink} target="_blank" rel="noopener noreferrer">
              Click here to reset your password
            </a>
          </div>
        )}
        <Toaster position="top-center" />
      </form>

    </div>
  );
}

export default ForgotPassword;
