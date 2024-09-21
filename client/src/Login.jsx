import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './App.css'

function Login() {
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()

    axios.defaults.withCredentials = true;
    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post('http://localhost:3001/login', {email, password})
        .then(res => {
            if(res.data === "Success") {
                window.location.href = "/"
                alert("Login successfully!")

            }
        })
        .catch(err => console.log(err))
    }
  return (
    <div className='signup_container'>
        <img src="blog 4.jpeg" alt="Logo" className="colorful"/>
        <div className='signup_form'>
            <h1>Sign In </h1>
            <br />
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label><br />
                    <input type="email" placeholder='Enter Email'
                    onChange={e => setEmail(e.target.value)}/>
                </div>
                <br />
                <div>
                    <label htmlFor="password">Password:</label><br />
                    <input type="password" placeholder='********'
                    onChange={e => setPassword(e.target.value)}/>
                </div>
                <button className='signup_btn'>Login</button>
            </form>
            <br></br>
            <p>Don't have an account.</p>
            <Link to="/register"><button>Signup</button></Link>
        </div>
    </div>
  )
}

export default Login