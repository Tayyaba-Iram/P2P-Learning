import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Register.css';

function AdminRegister() {
  const [name, setName] = useState('');
  const [sapid, setSapid] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [campus, setCampus] = useState([]);  // Changed to array for multiple selections
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
    if (!name) {
      toast.error("Name is required!");
    } else if (!sapid) {
      toast.error("Sap ID is required!");
    } else if (!email) {
      toast.error("Email is required!");
    } else if (!email.includes("@")) {
      toast.warning("Email must include '@'!");
    } else if (!cnic) {
      toast.error("CNIC is required!");
    } else if (!university) {
      toast.error("University is required!");
    } else if (campus.length === 0) {
      toast.error("At least one campus selection is required!");
    }  else if (!password) {
      toast.error("Password is required!");
    } else if (password.length < 4) {
      toast.error("Password must be at least 4 characters!");
    } else if (!cpassword) {
      toast.error("Confirm Password is required!");
    } else if (cpassword.length < 4) {
      toast.error("Confirm password must be at least 4 characters!");
    } else if (password !== cpassword) {
      toast.error("Password and confirm password must match!");
    } else {
      axios
        .post('http://localhost:3001/api/registerUniAdmin', {
          name, sapid, email, cnic, phone, university, campus, password, cpassword
        })
        .then(() => {
          toast.success("Registration Successful!");
          setTimeout(() => {
            navigate('/superdashboard');
          }, 2000);
        })
        .catch((err) => {
          if (err.response && err.response.data.error === "Email is already registered.") {
            toast.error("Email already exists!");
          } else {
            toast.error("Registration failed.");
          }
        });
    }
  };

  return (
    <div className="registration-container">
      <Toaster position="top-center" />
      <div className="left-section">
        <img src="Logo.jpg" alt="Logo" className="signup-logo" />
        <h2>Welcome</h2>
        <p>In learning you will teach and</p>
        <p>in teaching you will learn!</p>
        <Link to="/login"><button className="login-button">Login</button></Link>
      </div>

      <div className="right-section">
        <div className="signup-header">
          <h1>Create an account</h1>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="text" placeholder="Sap ID" value={sapid} onChange={(e) => setSapid(e.target.value)} />
          </div>
          <div className="form-group">
            <input className="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="text" placeholder="CNIC" value={cnic} onChange={(e) => setCnic(e.target.value)} />
          </div>
          <div className="form-group">
            <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <select id="university" value={university} onChange={(e) => setUniversity(e.target.value)}>
              <option value="" hidden>Select University</option>
              {universities.map((uni) => (
                <option key={uni._id} value={uni.name}>{uni.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Select Campus:</label>
            <div className="checkbox-group">
              {campusOptions.map((camp) => (
                <label key={camp._id}>
                  <input
                    type="checkbox"
                    value={camp.name}
                    checked={campus.includes(camp.name)}
                    onChange={() => handleCampusChange(camp.name)}
                  />
                  {camp.name}
                </label>
              ))}
            </div>
          </div>
         
          <div className="form-group">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="password" placeholder="Confirm Password" value={cpassword} onChange={(e) => setCpassword(e.target.value)} />
          </div>
          <button type="submit" className="register-button">Register</button>
        </form>
      </div>
    </div>
  );
}

export default AdminRegister;
