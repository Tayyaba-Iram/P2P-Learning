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

  const navigate = useNavigate();

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
    if (!name) toast.error("Name is required!");
    else if (!sapid) toast.error("Sap ID is required!");
    else if (!email || !email.includes("@") || !email.endsWith("@admin.edu.pk")) toast.error("Invalid email!");
    else if (!cnic) toast.error("CNIC is required!");
    else if (!university) toast.error("University is required!");
    else if (campus.length === 0) toast.error("Select at least one campus!");
    else if (password.length < 4 || password !== cpassword) toast.error("Passwords do not match or are too short!");
    else {
      axios.post('http://localhost:3001/api/registerUniAdmin', { name, sapid, email, cnic, phone, university, campus, password })
        .then(() => {
          toast.success("Registration Successful!");
          setTimeout(() => navigate('/superdashboard'), 2000);
        })
        .catch(err => toast.error(err.response?.data?.error || "Registration failed"));
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

  return (
    <div className="admin-registration-container">
      <Toaster position="top-center" />
      <div className="admin-register-form">
        <h2>Admin Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Name:</label>
            <input id="name" type="text" placeholder='Enter your Full Name' value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          
          <div className="form-field">
            <label htmlFor="sapid">ID:</label>
            <input id="sapid" type="text" placeholder='Enter your ID'value={sapid} onChange={(e) => setSapid(e.target.value)} />
          </div>
          
          <div className="form-field">
            <label htmlFor="email">Email:</label>
            <input id="email" type="email" placeholder='Enter your Email'value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          
          <div className="form-field">
          <label htmlFor="phone">Phone:</label>
          <input id="phone" type="text" placeholder="Enter your phone number"value={phone}onChange={(e) => handlePhoneChange(e.target.value)} maxLength={12} // Limits input to the correct length
          /></div>
          
          <div className="form-fields">
          <label htmlFor="cnic">CNIC:</label>
          <input id="cnic" type="text" placeholder="Enter your CNIC"value={cnic}onChange={(e) => handleCnicChange(e.target.value)} maxLength={15} // Limits input to the correct length
          /></div>

          <div className="form-field">
            <label htmlFor="university">University:</label>
            <select id="university" value={university} onChange={(e) => setUniversity(e.target.value)}>
              <option value="" hidden>Select University</option>
              {universities.map(uni => (
                <option key={uni._id} value={uni.name}>{uni.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
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

          <div className="form-field">
            <label htmlFor="password">Password:</label>
            <input id="password" type="password" placeholder='Enter your Password'value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <div className="form-field">
            <label htmlFor="cpassword">Confirm Password:</label>
            <input id="cpassword" type="password" placeholder='Enter your Confirm Password'value={cpassword} onChange={(e) => setCpassword(e.target.value)} />
          </div>
          
          <button type="submit" className="register-btn">Register</button>
        </form>
      </div>
    </div>
  );
}

export default AdminRegister;
