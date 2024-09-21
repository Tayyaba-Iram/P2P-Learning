import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'; 
import './App.css'

function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [age, setAge] = useState('')
    const [university, setUniversity] = useState('')
    const [degree, setDegree] = useState('')
    const [program, setProgram] = useState('')
    const [password, setPassword] = useState('')
    const [confirmpassword, setconfirmPassword] = useState('')
    
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault();

        if (username === "") {
            toast.error("Username is required!", {});
          } else if (email === "") {
            toast.error("Email is required!", {});
          } else if (!email.includes("@")) {
            toast.warning("Email must include '@'!", {});
          } else if (age === "") {
            toast.error("Age is required!", {});
          } else if (university === "") {
            toast.error("University is required!", {});
          } else if (degree === "") {
            toast.error("Degree is required!", {});
          } else if (program === "") {
            toast.error("Program is required!", {});
          } else if (password === "") {
            toast.error("Password is required!", {});
          } else if (password.length < 4) {
            toast.error("Password must be at least 4 characters!", {});
          } else if (confirmpassword === "") {
            toast.error("Confirm password is required!", {});
          } else if (confirmpassword.length < 4) {
            toast.error("Confirm password must be at least 4 characters!", {});
          } else if (password!=confirmpassword) {
            toast.error("Password and confirm password must be same!", {});
          }else {
            axios.post('http://localhost:3001/register', { username, email, age, university, degree, program, password, confirmpassword })
                .then(res => {
                    toast.success("Registration Successfully!");
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000); // 2 seconds delay before navigating
                })
                .catch(err => {
                    console.log(err);
                    toast.error("Registration failed. Please try again.");
                });
        }
    } 
    return (

        <div className='signup'>
            <div className='signup_form'>
            <img src="Logo.jpg" alt="Logo" className="signup-logo" />
                <h1>Create an account</h1>
                <br />
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name">Username:</label> <br />
                        <input type="text" placeholder='Enter Username'
                            onChange={e => setUsername(e.target.value)} />
                    </div>
                    <br />
                    <div>
                        <label htmlFor="email">Email:</label><br />
                        <input type="email" placeholder='Enter Email'
                            onChange={e => setEmail(e.target.value)} />
                    </div>
                    <br />
                    <div>
                        <label htmlFor="age">Age:</label> <br />
                        <input type="text" placeholder='Enter Age'
                            onChange={e => setAge(e.target.value)} />
                    </div>
                    <br />
                    <div>
                        <label htmlFor="university">University:</label><br />
                        <input type="text" placeholder='Enter University'
                            onChange={e => setUniversity(e.target.value)} />
                    </div>
                    <br />
                    <div>
                        <label htmlFor="degree">Degree:</label><br />
                        <input type="text" placeholder='Enter Degree'
                            onChange={e => setDegree(e.target.value)} />
                    </div>
                    <br />
                    <div>
                        <label htmlFor="program">Program:</label><br />
                        <input type="text" placeholder='Enter Program'
                            onChange={e => setProgram(e.target.value)} />
                    </div>
                    <br />
                    <div>
                        <label htmlFor="password">Password:</label><br />
                        <input type="password" placeholder='********'
                            onChange={e => setPassword(e.target.value)} />
                    </div>
                    
                    <br />
                    <div>
                        <label htmlFor="Confirm Password">Confirm Password:</label><br />
                        <input type="password" placeholder='********'
                            onChange={e => setconfirmPassword(e.target.value)} />
                    </div>

                    <button className='signup_btn'>Sign up</button>
                </form>
                <br></br>
                <p>Already have an account? <strong><Link to="/login" style={{ color: '#548635', textDecoration: 'underline' }}>Sign in</Link></strong></p>

            </div>
            <Toaster position="top-center" />
        </div>

    )
}

export default Register