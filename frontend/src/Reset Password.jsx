import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post(`http://localhost:3001/api/reset-password/${token}`, { newPassword })
      .then(res => {
        if (res.data.success) {
          toast.success(res.data.message);
          setNewPassword('');
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(err => {
        console.log(err);
        toast.error('Error resetting password');
      });
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      <Toaster position="top-center" />
    </div>
  );
}

export default ResetPassword;
