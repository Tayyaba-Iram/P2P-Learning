import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Student Register.css';

function Register() {
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
    <div className='signup'>
      <div className='signup_form'>
        <img src="Logo.jpg" alt="Logo" className="signup-logo" />
        <h1>Create an account</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name:</label><br />
            <input type="text" placeholder='Enter Name' onChange={e => setName(e.target.value)} />
          </div>
          <br />
          <div>
            <label htmlFor="sapId">Sap ID:</label><br />
            <input type="text" placeholder='Enter Sap ID' onChange={e => setSapid(e.target.value)} />
          </div>
          <br />
          <div>
            <label htmlFor="email">Email:</label><br />
            <input type="email" placeholder='Enter Email' onChange={e => setEmail(e.target.value)} />
          </div>
          <br />
          <div>
            <label htmlFor="cinc">CNIC:</label><br />
            <input type="text" placeholder='Enter CNIC' onChange={e => setCnic(e.target.value)} />
          </div>
          <br />
          <div>
            <label htmlFor="university">University:</label><br />
            <select id="university" value={university} onChange={handleUniversityChange}>
              <option value="" hidden>Select University</option>
              {renderOptions(Object.keys(universities))}
            </select>
          </div>
          <br />
          <div>
            <label htmlFor="levelOfStudy">Level of Study:</label><br />
            <select id="levelOfStudy" value={levelOfStudy} onChange={handleLevelChange} disabled={!university}>
              <option value="" hidden>Select Level of Study</option>
              {renderOptions(levelOptions)}
            </select>
          </div>
          <br />
          <div>
            <label htmlFor="campus">Campus:</label><br />
            <select id="campus" value={campus} onChange={handleCampusChange} disabled={!levelOfStudy}>
              <option value="" hidden>Select Campus</option>
              {renderOptions(campusOptions)}
            </select>
          </div>
          <br />
          <div>
            <label htmlFor="program">Program:</label><br />
            <select id="program" value={program} onChange={e => setProgram(e.target.value)} disabled={!campus}>
              <option value="" hidden>Select Program</option>
              {renderOptions(programOptions)}
            </select>
          </div>
          <br />
          <div>
            <label htmlFor="semester">Semester:</label><br />
            <input type="number" placeholder='Enter Semester' onChange={e => setSemester(e.target.value)} />
          </div>
          <br />
          <div>
            <label htmlFor="password">Password:</label><br />
            <input type="string" placeholder='Enter Password' onChange={e => setPassword(e.target.value)} />
          </div>
          <br />
          <div>
            <label htmlFor="cpassword">Confirm Password:</label><br />
            <input type="string" placeholder='Enter Confirm Password' onChange={e => setCpassword(e.target.value)} />
          </div>
          <br />
          <button className='signup_btn'>Sign up</button>
        </form>
        <br />
        <p>Already have an account? <strong><Link to="/login" style={{ color: '#548635', textDecoration: 'underline' }}>Sign in</Link></strong></p>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

export default Register;
