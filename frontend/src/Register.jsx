import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Register.css';

function Register() {
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [sapid, setSapid] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [campusId, setCampusId] = useState('');
  const [programId, setProgramId] = useState('');
  const [semester, setSemester] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [universities, setUniversities] = useState([]);
  const [campusOptions, setCampusOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);

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
    const selectedUniversity = universities.find(uni => uni._id === universityId);
    setCampusOptions(selectedUniversity ? selectedUniversity.campuses : []);
    setCampusId(''); // Reset campus when university changes
    setProgramId(''); // Reset program when university changes
  }, [universityId, universities]);

  useEffect(() => {
    const selectedCampus = campusOptions.find(camp => camp._id === campusId);
    setProgramOptions(selectedCampus ? selectedCampus.programs : []);
    setProgramId(''); // Reset program when campus changes
  }, [campusId, campusOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if role is selected
    if (!role) {
      toast.error('Please select a role before filling in the details!');
      return;
    }

    // Validation and submission logic
    if (role === 'universityadmin') {
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
      } else if (!universityId) {
        toast.error("University is required!");
      } else if (!campusId) {
        toast.error("Campus is required!");
      } else if (!password) {
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
            name, sapid, email, cnic, university: universityId, campus: campusId, password, cpassword
          })
          .then(() => {
            toast.success("Registration Successful!");
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          })
          .catch((err) => {
            if (err.response && err.response.data.error === "Email is already registered.") {
              toast.error("Email already exists!");
            } else {
              toast.error("Registration failed due to incorrect data.");
            }
          });
      }
    } else if (role === 'student') {
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
      } else if (!universityId) {
        toast.error("University is required!");
      } else if (!campusId) {
        toast.error("Campus is required!");
      } else if (!programId) {
        toast.error("Program is required!");
      } else if (!semester) {
        toast.error("Semester is required!");
      } else if (!password) {
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
          .post('http://localhost:3001/api/registerStudent', {
            name, sapid, email, cnic, university: universityId, campus: campusId, program: programId, semester, password, cpassword
          })
          .then(() => {
            toast.success("Registration Successful!");
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          })
          .catch((err) => {
            if (err.response && err.response.data.error === "Email is already registered.") {
              toast.error("Email already exists!");
            } else {
              toast.error("Registration failed due to incorrect data.");
            }
          });
      }
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

        <div className="role-toggle">
          <input type="radio" id="universityadmin" name="role" value="universityadmin" checked={role === 'universityadmin'} onChange={() => setRole('universityadmin')} />
          <label htmlFor="universityadmin" className={role === 'universityadmin' ? 'active' : ''}>University Admin</label>
          <input type="radio" id="student" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} />
          <label htmlFor="student" className={role === 'student' ? 'active' : ''}>Student</label>
        </div>

        <h2>Apply as a {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} disabled={!role} />
            <input type="text" placeholder="Sap ID" value={sapid} onChange={(e) => setSapid(e.target.value)} disabled={!role} />
          </div>
          <div className="form-group">
            <input className="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!role} />
            <input type="text" placeholder="CNIC" value={cnic} onChange={(e) => setCnic(e.target.value)} disabled={!role} />
          </div>
          <div className="form-group">
            <select id="university" value={universityId} onChange={(e) => setUniversityId(e.target.value)} disabled={!role}>
              <option value="" hidden>Select University</option>
              {universities.length > 0 ? (
                universities.map((uni) => (
                  <option key={uni._id} value={uni._id}>{uni.name}</option>
                ))
              ) : (
                <option value="" disabled>No universities available</option>
              )}
            </select>

            <select id="campus" value={campusId} onChange={(e) => setCampusId(e.target.value)} disabled={!universityId}>
              <option value="" hidden>Select Campus</option>
              {campusOptions.length > 0 ? (
                campusOptions.map((camp) => (
                  <option key={camp._id} value={camp._id}>{camp.name}</option>
                ))
              ) : (
                <option value="" disabled>Select a university first</option>
              )}
            </select>

            {role === 'student' && (
              <select id="program" value={programId} onChange={(e) => setProgramId(e.target.value)} disabled={!campusId}>
                <option value="" hidden>Select Program</option>
                {programOptions.length > 0 ? (
                  programOptions.map((prog) => (
                    <option key={prog._id} value={prog._id}>{prog.name}</option>
                  ))
                ) : (
                  <option value="" disabled>Select a campus first</option>
                )}
              </select>
            )}
          </div>
          {role === 'student' && (
            <div className="form-group">
              <input type="text" placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
            </div>
          )}
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

export default Register;
