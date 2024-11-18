import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Student Update Profile.css';

function UpdateProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    phone: '',
    university: '',
    campus: '',
    program: '',
    semester: '',
    specification: '',
    password: '',
    cpassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [campusOptions, setCampusOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);

  // Fetch profile and universities on mount
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

        if (response.data.success) {
          const userData = response.data.user;
          setProfile({
            phone: userData.phone || '',
            university: userData.university || '',
            campus: userData.campus || '',
            program: userData.program || '',
            semester: userData.semester || '',
            specification: userData.specification || '',
            password: '',
            cpassword: '',
          });

          await fetchUniversities(userData.university, userData.campus);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch universities and campuses
  const fetchUniversities = async (selectedUniversity, selectedCampus) => {
    try {
      const response = await axios.get('http://localhost:3001/api/universities');
      setUniversities(response.data);

      const selectedUniData = response.data.find((uni) => uni.name === selectedUniversity);
      if (selectedUniData) {
        setCampusOptions(selectedUniData.campuses);

        const selectedCampusData = selectedUniData.campuses.find(
          (campus) => campus.name === selectedCampus
        );

        if (selectedCampusData) {
          setProgramOptions(selectedCampusData.programs);
        }
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });

    if (name === 'campus') {
      const selectedCampus = campusOptions.find((camp) => camp.name === value);
      if (selectedCampus) {
        setProgramOptions(selectedCampus.programs);
        setProfile((prevProfile) => ({
          ...prevProfile,
          program: selectedCampus.programs[0].name,
        }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (profile.password !== profile.cpassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('No token found, please login');
        return;
      }

      const response = await axios.put('http://localhost:3001/api/update-profile', profile, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.data.success) {
        alert(response.data.message);
        navigate('/studentprofile'); // Navigate to student profile page
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating your profile.');
    }
  };

  return (
    <>
      <h2>Update Profile</h2>
      <form onSubmit={handleSubmit} className="update-profile-form">
        {/* Phone */}
        <div>
          <label>Phone:</label>
          <input type="text" name="phone" value={profile.phone} onChange={handleChange} />
        </div>

        {/* University (read-only) */}
        <div>
          <label>University:</label>
          <input type="text" value={profile.university} readOnly />
        </div>

        {/* Campus */}
        <div>
          <label>Campus:</label>
          <select name="campus" value={profile.campus} onChange={handleChange}>
            <option value="" hidden>Select Campus</option>
            {campusOptions.map((campus) => (
              <option key={campus._id} value={campus.name}>{campus.name}</option>
            ))}
          </select>
        </div>

        {/* Program */}
        <div>
          <label>Program:</label>
          <select name="program" value={profile.program} onChange={handleChange}>
            <option value="" hidden>Select Program</option>
            {programOptions.map((program) => (
              <option key={program._id} value={program.name}>{program.name}</option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label>Semester:</label>
          <input type="text" name="semester" value={profile.semester} onChange={handleChange} />
        </div>

        {/* Specification */}
        <div>
          <label>Specification:</label>
          <input type="text" name="specification" value={profile.specification} onChange={handleChange} />
        </div>

        <button type="submit" className="update-button">Update Profile</button>
      </form>
    </>
  );
}

export default UpdateProfile;
