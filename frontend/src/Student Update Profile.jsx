import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Student Update Profile.css';
import toast from 'react-hot-toast';

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
  const [universities, setUniversities] = useState([]);
  const [campusOptions, setCampusOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        toast.success('Profile updated Successfully')
        navigate('/studentprofile'); 
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error(err);

    }
  };

  const handlePhoneChange = (value) => {
    // Remove any non-digit characters
    const cleanedValue = value.replace(/\D/g, '');

    // Format as '0000-0000000'
    const formattedValue =
      cleanedValue.length > 4
        ? `${cleanedValue.slice(0, 4)}-${cleanedValue.slice(4, 11)}`
        : cleanedValue;

    setProfile((prevProfile) => ({
      ...prevProfile,
      phone: formattedValue,
    }));
  };


  return (
    <form onSubmit={handleSubmit} className="update-profile-form">
      <h3>Update Profile</h3>
      {/* Phone */}
      <div>
        <label>Phone</label>
        <input
          className="profile-data"
          type="text"
          name="phone"
          value={profile.phone}
          onChange={(e) => {
            const { name, value } = e.target;
            if (name === 'phone') {
              handlePhoneChange(value); 
            } else {
              handleChange(e); 
            }
          }}
        />
      </div>

      {/* University (read-only) */}
      <div>
        <label>University</label>
        <input className='profile-data' type="text" value={profile.university} readOnly />
      </div>

      {/* Campus */}
      <div>
        <label>Campus</label>
        <select name="campus" value={profile.campus} onChange={handleChange}>
          <option value="" hidden>Select Campus</option>
          {campusOptions.map((campus) => (
            <option key={campus._id} value={campus.name}>{campus.name}</option>
          ))}
        </select>
      </div>

      {/* Program */}
      <div>
        <label>Program</label>
        <select name="program" value={profile.program} onChange={handleChange}>
          <option value="" hidden>Select Program</option>
          {programOptions.map((program) => (
            <option key={program._id} value={program.name}>{program.name}</option>
          ))}
        </select>
      </div>

      {/* Semester */}
      <div>
        <label>Semester</label>
        <input
          className="profile-data"
          type="number"
          name="semester"
          min="1"
          max="10"
          value={profile.semester}
          onChange={handleChange}
        />
      </div>


      {/* Specification */}
      <div>
        <label>Specification</label>
        <input className='profile-data' type="text" name="specification" value={profile.specification} onChange={handleChange} />
      </div>

      <button type="submit" className="update-button">Update Profile</button>
    </form>
  );
}

export default UpdateProfile;
