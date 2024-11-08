import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Student Update Profile.css';

function UpdateProfile() {
  const [profile, setProfile] = useState({
    phone: '',
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

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/get-profile', {
          withCredentials: true,
        });

        if (response.data.success) {
          const userData = response.data.user;
          setProfile({
            phone: userData.phone || '',
            campus: userData.campus || '',
            program: userData.program || '',
            semester: userData.semester || '',
            specification: userData.specification || '',
            password: '',
            cpassword: '',
          });

          // Fetch university data and set campus/program options
          await fetchUniversities(userData.university);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch universities and their campuses/programs
  const fetchUniversities = async (selectedUniversity) => {
    try {
      const response = await axios.get('http://localhost:3001/api/universities');
      setUniversities(response.data);

      // Set campus and program options based on the user's university
      const selectedUniData = response.data.find((uni) => uni.name === selectedUniversity);
      if (selectedUniData) {
        setCampusOptions(selectedUniData.campuses);
        const selectedCampusData = selectedUniData.campuses.find(
          (camp) => camp.name === profile.campus
        );
        setProgramOptions(selectedCampusData ? selectedCampusData.programs : []);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });

    // Reset program options if campus is changed
    if (name === 'campus') {
      const selectedCampus = campusOptions.find((camp) => camp.name === value);
      setProgramOptions(selectedCampus ? selectedCampus.programs : []);
      setProfile({ ...profile, campus: value, program: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:3001/api/update-profile', profile, {
        withCredentials: true,
      });

      if (response.data.success) {
        alert(response.data.message);
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating your profile.');
    }
  };

  if (loading) return <p>Loading profile data...</p>;

  return (
    <form onSubmit={handleSubmit} className="update-profile-form">
      <div>
        <label>Phone:</label>
        <input type="text" name="phone" value={profile.phone} onChange={handleChange} />
      </div>

      {/* University (read-only) */}
      <div>
        <label>University:</label>
        <input type="text" value={universities.find((uni) => uni.name)?.name || ''} readOnly />
      </div>

      {/* Campus */}
      <div>
        <label>Campus:</label>
        <select name="campus" value={profile.campus} onChange={handleChange}>
          <option value="" hidden>Select Campus</option>
          {campusOptions.map((campus) => (
            <option key={campus._id} value={campus.name}>
              {campus.name}
            </option>
          ))}
        </select>
      </div>

      {/* Program */}
      <div>
        <label>Program:</label>
        <select name="program" value={profile.program} onChange={handleChange} disabled={!profile.campus}>
          <option value="" hidden>Select Program</option>
          {programOptions.map((program) => (
            <option key={program._id} value={program.name}>
              {program.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Semester:</label>
        <input type="text" name="semester" value={profile.semester} onChange={handleChange} />
      </div>

      <div>
        <label>Specification:</label>
        <input type="text" name="specification" value={profile.specification} onChange={handleChange} />
      </div>

      {/* Password Fields */}
      <div>
        <label>Password:</label>
        <input type={showPassword ? 'text' : 'password'} name="password" value={profile.password} onChange={handleChange} />
        <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button>
      </div>

      <div>
        <label>Confirm Password:</label>
        <input type={showCPassword ? 'text' : 'password'} name="cpassword" value={profile.cpassword} onChange={handleChange} />
        <button type="button" onClick={() => setShowCPassword(!showCPassword)}>{showCPassword ? 'Hide' : 'Show'}</button>
      </div>

      <button type="submit" className="update-button">Update Profile</button>
    </form>
  );
}

export default UpdateProfile;
