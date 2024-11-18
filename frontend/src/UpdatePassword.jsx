import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import './Student Update Profile.css';

function ResetPassword() {
  const navigate = useNavigate();

  // State for passwords and visibility toggles
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State for error message
  const [errorMessage, setErrorMessage] = useState('');

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Reset error message
    setErrorMessage('');
  
    // Validate that current password is entered
    if (!passwords.currentPassword) {
      setErrorMessage('Please enter your current password.');
      toast.error('Please enter your current password.'); // Toast message
      return;
    }
  
    // Validate that new password and confirm password match
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMessage('New passwords do not match!');
      toast.error('New passwords do not match!'); // Toast message
      return;
    }
  
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setErrorMessage('No token found, please login.');
        toast.error('No token found, please login.'); // Toast message
        return;
      }

      const response = await axios.put(
        'http://localhost:3001/api/update-password',
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword, // Send confirmPassword along with newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    
      if (response.data.success) {
        toast.success(response.data.message); // Success toast message
        navigate('/'); // Redirect after successful password reset
      } else {
        setErrorMessage(response.data.message); 
        toast.error(response.data.message); // Error toast message
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setErrorMessage('Current Password is incorrect.'); // Generic error message
    }
  };

  return (
    <>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit} className="reset-password-form">
        {/* Current Password */}
        <div>
          <label>Current Password:</label>
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* New Password */}
        <div>
          <label>New Password:</label>
          <input
            type={showNewPassword ? 'text' : 'password'}
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Confirm New Password */}
        <div>
          <label>Confirm New Password:</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="reset-button">Reset Password</button>
      </form>

      {/* Toast Container to render toast notifications */}
      <ToastContainer />
    </>
  );
}

export default ResetPassword;
