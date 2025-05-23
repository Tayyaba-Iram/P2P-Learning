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
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/universities');
        setUniversities(response.data);
      } catch (error) {
            const errorMessage = error.response?.data?.error || "Something went wrong";

        console.error('Error fetching universities:', error);

        toast.error('Failed to fetch universities');
      }
    };
    fetchUniversities();
  }, []);

  useEffect(() => {
    const selectedUniversity = universities.find(uni => uni.name === university);
    setCampusOptions(selectedUniversity ? selectedUniversity.campuses : []);
    setCampus([]);
  }, [university, universities]);

  const handleCampusChange = (campusName) => {
    setCampus(prev =>
      prev.includes(campusName) ? prev.filter(c => c !== campusName) : [...prev, campusName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      setMessage('Password must be 8 characters with uppercase, lowercase letter, number, and special character.');
      return;
    } else if (password !== cpassword) {
      setMessage('Password and confirm password must be same.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3001/api/registerUniAdmin',
        { name, sapid, email, cnic, phone, university, campus, password, cpassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setName('');
      setSapid('');
      setEmail('');
      setCnic('');
      setPhone('');
      setUniversity('');
      setCampus([]);
      setPassword('');
      setCpassword('');
      setMessage('');
      navigate('/superdashboard')

      toast.success(response.data.message || 'Admin registered successfully');

    } catch (error) {

const errorMsg = error.response?.data?.error || "Something went wrong";
    setMessage(errorMsg);      
    }
  };

  const handlePhoneChange = (value) => {
    const cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length > 4) {
      setPhone(`${cleanedValue.slice(0, 4)}-${cleanedValue.slice(4, 11)}`);
    } else {
      setPhone(cleanedValue);
    }
  };

  const handleCnicChange = (value) => {
    const cleanedValue = value.replace(/\D/g, '');
    let formattedValue = cleanedValue;

    if (cleanedValue.length > 5 && cleanedValue.length <= 12) {
      formattedValue = `${cleanedValue.slice(0, 5)}-${cleanedValue.slice(5)}`;
    } else if (cleanedValue.length > 12) {
      formattedValue = `${cleanedValue.slice(0, 5)}-${cleanedValue.slice(5, 12)}-${cleanedValue.slice(12)}`;
    }

    setCnic(formattedValue);
  };

  const handleSapChange = (event) => {
    let value = event.target.value;
    // Allow only numbers
    let cleanedValue = value.replace(/\D/g, '');
    // Limit to max 7 digits
    if (cleanedValue.length > 7) {
      cleanedValue = cleanedValue.slice(0, 7);
    }
    setSapid(cleanedValue);
  };


  return (
    <form className="admin-register-form" onSubmit={handleSubmit}>
      <h2>Admin Registration</h2>
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
        <select id="university" value={university} onChange={(e) => setUniversity(e.target.value)} required
          style={{
            paddingRight: '24px',
            backgroundPosition: 'right 8px center',
            backgroundRepeat: 'no-repeat',
            backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'%23000\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>")', // custom arrow
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          }}>
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
        <input id="password" type="password" placeholder='Enter Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      <div className="form-fields">
        <label htmlFor="cpassword">Confirm Password:</label>
        <input id="cpassword" type="password" placeholder='Enter Confirm Password' value={cpassword} onChange={(e) => setCpassword(e.target.value)} required />
      </div>

      {message && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '16px' }}>{message}</p>}

      <button type="submit" className="register">Register</button>
    </form>

  );
}

export default AdminRegister;
