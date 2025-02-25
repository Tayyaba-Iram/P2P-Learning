import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Link} from 'react-router-dom';
import './ForgotPassword.css'

function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://localhost:3001/api/request-reset-password', { email })
      .then(res => {
        if (res.data.success) {
          toast.success(res.data.message);
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
        <Link className='back-login' to="/login" >Back to Login</Link>

        <Toaster position="top-center" />
      </form>
     
  );
}

export default ForgotPassword;
