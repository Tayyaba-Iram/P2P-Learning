import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Register.css';

function Register() {
  const [name, setName] = useState('');
  const [sapid, setSapid] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [campus, setCampus] = useState('');
  const [program, setProgram] = useState('');
  const [semester, setSemester] = useState('');
  const [specification, setSpecification] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [universities, setUniversities] = useState([]);
  const [campusOptions, setCampusOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [message, setMessage] = useState('');
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
    setCampus(''); // Reset campus when university changes
    setProgram(''); // Reset program when university changes
  }, [university, universities]);

  useEffect(() => {
    const selectedCampus = campusOptions.find(camp => camp.name === campus);
    setProgramOptions(selectedCampus ? selectedCampus.programs : []);
    setProgram(''); // Reset program when campus changes
  }, [campus, campusOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      setMessage('Password must be 8 characters with uppercase, lowercase letter, number, and special character.');
      return;
    } 
    else if(password!==cpassword) {
      setMessage('Password and confirm password must be same.');
      return;
    }else {
      axios
        .post('http://localhost:3001/api/registerStudent', {
     name, sapid, email, cnic, phone, university, campus, program, semester, specification, password, cpassword
        })
        .then(() => {
          toast.success("Registration Successful!");
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        })
        .catch((err) => {
          if (err.response && err.response.data.error === "Email is already registered.") {
            setMessage('Email already exists');
            
          } else {
            setMessage('Registration failed due to incorrect data');
           
          }
        });
    }
  };
  const handleSapChange = (event) => {
    const value = event.target.value;
    // Allow only numbers
    const cleanedValue = value.replace(/\D/g, '');
    setSapid(cleanedValue); // Update the state with numeric value
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
  const handleSemesterChange = (event) => {
    const value = event.target.value;
    // Allow only numbers
    const cleanedValue = value.replace(/\D/g, '');
    setSemester(cleanedValue); // Update the state with numeric value
  };
  const capitalizeFullName = (fullName) => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(capitalizeFullName(value));
  };

  return (
    <div className="registration-container">
        
      <Toaster position="top-center" />

        <div className="signup-header">
        <img src="Logo.jpg" alt="Logo" className="Register-logo" />
          <h1>Sign Up</h1>
          {message && <p style={{ color: 'red',whiteSpace: 'pre-wrap'  }}>{message}</p>}
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
          <input className="name" type="text" placeholder="Name" value={name} onChange={handleNameChange} required/>            
            <input className="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            <input  type="text" placeholder="CNIC"value={cnic}onChange={(e) => handleCnicChange(e.target.value)} maxLength={15} required/>
          

          <input type="text" placeholder="Phone Number"value={phone}onChange={(e) => handlePhoneChange(e.target.value)} maxLength={12} required/> 
            <select id="university" value={university} onChange={(e) => setUniversity(e.target.value)} required>
              <option value="" hidden>Select University</option>
              {universities.map((uni) => (
                <option key={uni._id} value={uni.name} required>{uni.name}</option>
              ))}
            </select>
          
            <select id="campus" value={campus} onChange={(e) => setCampus(e.target.value)} disabled={!university}>
              <option value="" hidden required>Select Campus</option>
              {campusOptions.map((camp) => (
                <option key={camp._id} value={camp.name}>{camp.name}</option>
              ))}
            </select>
            <select id="program" value={program} onChange={(e) => setProgram(e.target.value)} disabled={!campus}>
              <option value="" hidden required>Select Program</option>
              {programOptions.map((prog) => (
                <option key={prog._id} value={prog.name}>{prog.name}</option>
              ))}
            </select>
            <input type="text" placeholder="Student ID" value={sapid} onChange={handleSapChange} required/>

          <input type="text" value={semester} onChange={handleSemesterChange} placeholder="Semester" maxLength={2} required/>            
          <input type="text" placeholder="Specification" value={specification} onChange={(e) => setSpecification(e.target.value)} required/>
         
            <input type="text" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            <input type="text" placeholder="Confirm Password" value={cpassword} onChange={(e) => setCpassword(e.target.value)} required/>
          </div>
          <button type="submit" className="register-button">Submit</button>
          <p className="signup-text">
        Already have an account? <Link to="/login" className="signup-link">Login</Link>
      </p>
        </form>
        </div>
    </div>
  );
}

export default Register;