import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Superadmin register.css';

function SuperRegister() {
    const [role, setRole] = useState('student'); 
  const [name, setName] = useState('');
  const [sapid, setSapid] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [university, setUniversity] = useState('');
  const [levelOfStudy, setLevelOfStudy] = useState('');
  const [campus, setCampus] = useState('');
  const [program, setProgram] = useState('');
  const [semester, setSemester] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');

  const navigate = useNavigate();

  const universities = {
    Riphah: {
      Undergraduate: {
        "Gulberg Greens": ["Software Engineering", "Computer Science", "Computer Arts", "Cyber Security"],
        "I-14": ["BS Maths", "BS Physics", "Electrical Engineering"],
      },
      Masters: {
        "Al-Mizan": ["MBBS", "BBA"],
        "I-14": ["MSc Math", "MSc Islamic Studies"],
      },
      PhD: {
        "Gulberg Greens": ["PhD Computer Science", "PhD Engineering"],
        "I-14": ["PhD Physics", "PhD Math"],
      },
    },
    FAST: {
      Undergraduate: {
        Islamabad: ["Software Engineering", "Computer Science", "Cyber Security", "Computer Arts"],
        Karachi: ["BS IT", "Computer Engineering", "BBA"],
      },
      Masters: {
        Islamabad: ["MBA", "MS CS"],
        Peshawar: ["MBA", "MS IT"],
      },
      PhD: {
        Islamabad: ["PhD CS", "PhD Engineering"],
        Lahore: ["PhD Business", "PhD IT"],
      },
    },
  };

  // Helper functions to generate dropdown options
  const renderOptions = (options) => options.map((opt) => <option key={opt} value={opt}>{opt}</option>);

  const handleUniversityChange = (e) => {
    setUniversity(e.target.value);
    setLevelOfStudy('');
    setCampus('');
    setProgram('');
  };

  const handleLevelChange = (e) => {
    setLevelOfStudy(e.target.value);
    setCampus('');
    setProgram('');
  };

  const handleCampusChange = (e) => {
    setCampus(e.target.value);
    setProgram('');
  };
  // Dropdown options based on selections
  const levelOptions = university ? Object.keys(universities[university]) : [];
  const campusOptions = university && levelOfStudy ? Object.keys(universities[university][levelOfStudy]) : [];
  const programOptions = university && levelOfStudy && campus ? universities[university][levelOfStudy][campus] : [];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name === "") {
      toast.error("Name is required!");
    } else if (sapid === "") {
      toast.error("Sap ID is required!");
    } else if (email === "") {
      toast.error("Email is required!");
    } else if (!email.includes("@")) {
      toast.warning("Email must include '@'!");
    } else if (cnic === "") {
      toast.error("CNIC is required!");
    } else if (university === "") {
      toast.error("University is required!");
    } else if (levelOfStudy === "") {
      toast.error("Level of study is required!");
    } else if (campus === "") {
      toast.error("Campus is required!");
    } else if (program === "") {
      toast.error("Program is required!");
    } else if (semester === "") {
      toast.error("Semester is required!");
    }else if (password === "") {
      toast.error("Password is required!");
    }else if (password.length<4) {
      toast.error("Password must be 4 characters!");
    }else if (cpassword === "") {
      toast.error("Confirm Password is required!");
    }else if (cpassword.length<4) {
      toast.error("Confirm password must be 4 characters!");
    }else if (password !== cpassword) {
      toast.error("Password and confirm password must be same!");
    } else {
      axios
        .post('http://localhost:3001/api/registerStudent', {
          name, sapid, email, cnic, university, levelOfStudy, campus, program, semester,password,cpassword
        })
        .then((res) => {
          toast.success("Registration Successfully!");
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        })
        .catch((err) => {
          console.log(err);
          if (err.response && err.response.data.error === "Email is already registered.") {
            toast.error("Email already exist!");
          } else {
            toast.error("Registration failed due to wrong data.");
          }
        });
    }
  };

  return (
    <div className="registration-container">
      <div className="left-section">
        <h2>Welcome</h2>
        <p>In learning you will teach and</p>
        <p> in teaching you will learn!</p>
        <button className="login-button">Login</button>
      </div>

      <div className="right-section">
      <div className="signup-header">
  <img src="Logo.jpg" alt="Logo" className="signup-logo" />
  <h1>Create an account</h1>
</div>

      <div className="role-toggle">

  <input type="radio" id="universityadmin" name="role" value="universityadmin" checked={role === 'universityadmin'} onChange={() => setRole('university Admin')} 
  />
  <label htmlFor="universityadmin" className={role === 'universityadmin' ? 'active' : ''}>University Admin</label>
  <input type="radio" id="student" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} 
  />
  <label htmlFor="student" className={role === 'student' ? 'active' : ''}>Student</label>
</div>

        <h2>Apply as a {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="text" placeholder="Sap ID" value={sapid} onChange={(e) => setSapid(e.target.value)} required />
          </div>
          <div className="form-group">
            <input className= "email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="text" placeholder="CNIC" value={cnic} onChange={(e) => setCnic(e.target.value)} required />
          </div>
          <div className="form-group">
            <select id="university" value={university} onChange={(e) => setUniversity(e.target.value)} required>
              <option value="" hidden>Select University</option>
              {Object.keys(universities).map((uni) => <option key={uni} value={uni}>{uni}</option>)}
            </select>
            <select id="levelOfStudy" value={levelOfStudy} onChange={(e) => setLevelOfStudy(e.target.value)} disabled={!university} required>
              <option value="" hidden>Select Level of Study</option>
              {levelOptions.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
          <div className="form-group">
            <select id="campus" value={campus} onChange={(e) => setCampus(e.target.value)} disabled={!levelOfStudy} required>
              <option value="" hidden>Select Campus</option>
              {campusOptions.map((camp) => <option key={camp} value={camp}>{camp}</option>)}
            </select>
            <select id="program" value={program} onChange={(e) => setProgram(e.target.value)} disabled={!campus} required>
              <option value="" hidden>Select Program</option>
              {programOptions.map((prog) => <option key={prog} value={prog}>{prog}</option>)}
            </select>
          </div>
          <div className="form-group">
         


<input
  type="number"
  placeholder="Semester"
  value={semester}
  onChange={(e) => setSemester(Math.max(1, e.target.value))} // Ensure it can't be less than 1
  min="1" // Set minimum value to 1
  required
/>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="password" placeholder="Confirm Password" value={cpassword} onChange={(e) => setCpassword(e.target.value)} required />
          </div>
          <button type="submit" className="register-button">Register</button>
        </form>
      </div>
      <Toaster position="top-center" />
    </div> 
  );
}

export default SuperRegister;
