import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Reset Password.css'
const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useParams(); // Get the token from URL parameters
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
      setMessage('Password must be 8 characters with uppercase, lowercase letter, number, and special character.');
      return;
    } 
    else if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      // Make an API call to reset password
      const response = await axios.post(`http://localhost:3001/api/reset-password/${token}`, {
        newPassword,  confirmPassword,
      });

      if (response.data.success) {
        toast.success('Password reset successfully');
        setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
      } else {
        setMessage(response.data.message || 'Password reset failed');
      }
    } catch (error) {
      setMessage('An error occurred during password reset');
      console.error('Password reset error:', error);
    }
  };

  return (
   
      <form className='Reset-form' onSubmit={handlePasswordReset}>
      <h3>Reset Password</h3>
        <div>
          <label>New Password:</label>
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type="text"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        {message &&  <p className="error-message" style={{ color: 'red' }}>{message}</p>}
        </div>
        <button className='reset-button' type="submit">Reset Password</button>
      </form>
  );
};

export default ResetPassword;
