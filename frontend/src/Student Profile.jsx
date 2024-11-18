import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Student Profile.css';

function StudentProfile() {
  const [profile, setProfile] = useState({
    name: '',
    sapid: '',
    email: '',
    cnic: '',
    phone: '',
    university: '',
    campus: '',
    program: '',
    semester: '',
    specification: '',
  });
 

  useEffect(() => {
    const fetchProfile = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
          return;
        }
      
        try {
          const response = await axios.get('http://localhost:3001/api/get-profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
      
          console.log('Backend Response:', response.data);
      
          if (response.data.success) {
            const userData = response.data.user;
            console.log('User Data:', userData); // Check if sapid and cnic are present
            setProfile({
              name: userData.name || '',
              sapid: userData.sapid || '',
              email: userData.email || '',
              cnic: userData.cnic || '',
              phone: userData.phone || '',
              university: userData.university || '',
              campus: userData.campus || '',
              program: userData.program || '',
              semester: userData.semester || '',
              specification: userData.specification || '',
            });
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      };
    fetchProfile();
  }, []);

  return (
    <div className="profile-container">
      <h2>Profile Information</h2>

      {/* Display profile data in a table */}
      <table className="profile-table">
        <tbody>
          <tr>
            <th>Name</th>
            <td>{profile.name}</td>
          </tr>
          <tr>
            <th>SAP ID</th>
            <td>{profile.sapid}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{profile.email}</td>
          </tr>
          <tr>
            <th>CNIC</th>
            <td>{profile.cnic}</td>
          </tr>
          <tr>
            <th>Phone</th>
            <td>{profile.phone}</td>
          </tr>
          <tr>
            <th>University</th>
            <td>{profile.university}</td>
          </tr>
          <tr>
            <th>Campus</th>
            <td>{profile.campus}</td>
          </tr>
          <tr>
            <th>Program</th>
            <td>{profile.program}</td>
          </tr>
          <tr>
            <th>Semester</th>
            <td>{profile.semester}</td>
          </tr>
          <tr>
            <th>Specification</th>
            <td>{profile.specification}</td>
          </tr>
        </tbody>
      </table>

      <Link to="/studentupdateprofile">
            <button className="btn">Edit</button>
          </Link>
    </div>
  );
}

export default StudentProfile;
