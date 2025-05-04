import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import './UpdatePassword.css';

function ResetPassword() {
  const navigate = useNavigate();

  // State for passwords and visibility toggles
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  
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
     if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(passwords.currentPassword)) {
      setErrorMessage('Password must be 8 characters with uppercase, lowercase letter, number, and special character.');
      return;
    } 
  
    // Validate that new password and confirm password match
    else if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMessage('New passwords do not match!');
      return;
    }
    else if (passwords.currentPassword === passwords.newPassword) {
      setErrorMessage('Current password and new password must be different!');
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
     
      <form onSubmit={handleSubmit} className="reset-password-form">
              <Toaster position="top-center" />
        
      <h2>Reset Password</h2>
        {/* Current Password */}
        <div>
          <label>Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handleChange}
            required
          />
         
        </div>

        {/* New Password */}
        <div>
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        {/* Confirm New Password */}
        <div>
          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleChange}
            required
          />
          
        </div>

        {/* Error Message */}
        {errorMessage &&  <p className="error-message" style={{ color: 'red' }}>{errorMessage}</p>}
       

        <button type="submit" className="reset-button">Reset Password</button>
      </form>

  );
}

export default ResetPassword;
