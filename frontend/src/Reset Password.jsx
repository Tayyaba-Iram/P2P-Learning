import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useParams(); // Get the token from URL parameters
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      // Make an API call to reset password
      const response = await axios.post(`http://localhost:3001/api/reset-password/${token}`, {
        newPassword,  confirmPassword,
      });

      if (response.data.success) {
        setMessage('Password reset successfully');
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
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handlePasswordReset}>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
