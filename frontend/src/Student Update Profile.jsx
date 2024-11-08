import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

function UpdateProfile({ studentId }) {
  const [studentData, setStudentData] = useState({
    phone: '',
    campus: '',
    program: '',
    semester: '',
    specification: '',
    password: '',
    cpassword: '',
  });

  useEffect(() => {
    // Fetch the current profile data
    axios.get(`http://localhost:3001/api/verifiedStudents/${studentId}`)
      .then(response => {
        setStudentData(response.data.student);
      })
      .catch(error => {
        console.error('Error fetching student data:', error);
        toast.error('Failed to fetch profile data');
      });
  }, [studentId]);

  const handleChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`http://localhost:3001/api/verified-students/update-profile/${studentId}`, studentData);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="update-profile-container">
      <Toaster position="top-center" />
      <h2>Update Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={studentData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Campus</label>
          <input
            type="text"
            name="campus"
            value={studentData.campus}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Program</label>
          <input
            type="text"
            name="program"
            value={studentData.program}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Semester</label>
          <input
            type="number"
            name="semester"
            value={studentData.semester}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Specification</label>
          <input
            type="text"
            name="specification"
            value={studentData.specification}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={studentData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="cpassword"
            value={studentData.cpassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="update-button">Update Profile</button>
      </form>
    </div>
  );
}

export default UpdateProfile;
