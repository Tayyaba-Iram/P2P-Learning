import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Admin Registeration.css';

function AdminRegister() {
  const [name, setName] = useState('');
  const [sapid, setSapid] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [campus, setCampus] = useState([]);
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [universities, setUniversities] = useState([]);
  const [campusOptions, setCampusOptions] = useState([]);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const token = sessionStorage.getItem('token'); // Or localStorage.getItem('token')

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/universities');
        setUniversities(response.data);
      } catch (error) {
        console.error('Error fetching universities:', error);
        toast.error('Failed to fetch universities');
      }
    };
    fetchUniversities();
  }, []);

  useEffect(() => {
    const selectedUniversity = universities.find(uni => uni.name === university);
    setCampusOptions(selectedUniversity ? selectedUniversity.campuses : []);
    setCampus([]); // Reset campus when university changes
  }, [university, universities]);

  const handleCampusChange = (campusName) => {
    setCampus(prev =>
      prev.includes(campusName) ? prev.filter(c => c !== campusName) : [...prev, campusName]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      setMessage('Password must be 8 characters with uppercase, lowercase letter, number, and special character.');
      return;
    }
    else if (password !== cpassword) {
      setMessage('Password and confirm password must be same.');
      return;
    }
    else {
      axios.post(
        'http://localhost:3001/api/registerUniAdmin',
        { name, sapid, email, cnic, phone, university, campus, password, cpassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )
    }
  };
  const handlePhoneChange = (value) => {
    // Remove any non-digit characters
    const cleanedValue = value.replace(/\D/g, '');

    // Format as '0000-0000000'
    if (cleanedValue.length > 4) {
      setPhone(`${cleanedValue.slice(0, 4)}-${cleanedValue.slice(4, 11)}`);
    } else {
      setPhone(cleanedValue);
    }
  };
  const handleCnicChange = (value) => {
    // Remove any non-digit characters
    const cleanedValue = value.replace(/\D/g, '');

    // Format as '00000-0000000-0'
    let formattedValue = cleanedValue;

    if (cleanedValue.length > 5 && cleanedValue.length <= 12) {
      formattedValue = `${cleanedValue.slice(0, 5)}-${cleanedValue.slice(5)}`;
    } else if (cleanedValue.length > 12) {
      formattedValue = `${cleanedValue.slice(0, 5)}-${cleanedValue.slice(5, 12)}-${cleanedValue.slice(12)}`;
    }

    setCnic(formattedValue);
  };

  const handleSapChange = (event) => {
    const value = event.target.value;
    // Allow only numbers
    const cleanedValue = value.replace(/\D/g, '');
    setSapid(cleanedValue); // Update the state with numeric value
  };


  return (
    <form className="admin-register-form" onSubmit={handleSubmit}>
      <Toaster position="top-center" />
      <h3>Admin Registration</h3>
      <div className="form-fields">
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          placeholder="Enter Full Name"
          value={name}
          onChange={(e) => {
            const value = e.target.value;
            const filteredValue = value.replace(/[^A-Za-z\s]/g, '');
            setName(filteredValue);
          }}
          required
        />
      </div>

      <div className="form-fields">
        <label htmlFor="sapid">ID:</label>
        <input type="text" placeholder="Enter ID" value={sapid} onChange={handleSapChange} required />
      </div>

      <div className="form-fields">
        <label htmlFor="email">Email:</label>
        <input id="email" type="email" placeholder='Enter Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="form-fields">
        <label htmlFor="phone">Phone:</label>
        <input id="phone" type="text" placeholder="Enter phone number" value={phone} onChange={(e) => handlePhoneChange(e.target.value)} maxLength={12} required
        /></div>

      <div className="form-fields">
        <label htmlFor="cnic">CNIC:</label>
        <input id="cnic" type="text" placeholder="Enter CNIC" value={cnic} onChange={(e) => handleCnicChange(e.target.value)} maxLength={15} required
        /></div>

      <div className="form-fields">
        <label htmlFor="university">University:</label>
        <select id="university" value={university} onChange={(e) => setUniversity(e.target.value)} required>
          <option value="" hidden>Select University</option>
          {universities.map(uni => (
            <option key={uni._id} value={uni.name}>{uni.name}</option>
          ))}
        </select>
      </div>

      <div className="form-fields">
        <label>Select Campus:</label>
        <div className="checkbox-group">
          {campusOptions.map(camp => (
            <label key={camp._id}>
              <input type="checkbox" value={camp.name} checked={campus.includes(camp.name)} onChange={() => handleCampusChange(camp.name)} />
              {camp.name}
            </label>
          ))}
        </div>
      </div>

      <div className="form-fields">
        <label htmlFor="password">Password:</label>
        <input id="password" type="text" placeholder='Enter Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      <div className="form-fields">
        <label htmlFor="cpassword">Confirm Password:</label>
        <input id="cpassword" type="text" placeholder='Enter Confirm Password' value={cpassword} onChange={(e) => setCpassword(e.target.value)} required />
      </div>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      <button type="submit" className="register">Register</button>
    </form>

  );
}

export default AdminRegister;
