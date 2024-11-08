import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Home from "./Student Home"
import { createContext } from "react"
export const userContext = createContext();
import Navbar from './Student Navbar'
import ScheduleSession from './ScheduleSession';
import Register from './Register'
import Login from './Login';
import Dashboard from './Superadmin Dashboard';
import ComplaintForm from './Complain Form';
import AdminDashboard from './UniAdmin Dashboard';
import AdminRegister from './Admin Registeration';
import ForgotPassword from './Forgot Password';
import ResetPassword from './Reset Password';
import UpdateProfile from './Student Update Profile';
import axios from 'axios';
axios.defaults.withCredentials=true;
function App() {
  return (
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path='/ScheduleSession' element = {<ScheduleSession/>}></Route>
      <Route path='/register' element = {<Register />}></Route>
      <Route path='/login' element = {<Login />}></Route>
      <Route path='/superdashboard' element = {<Dashboard />}></Route>
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/complain-form" element={<ComplaintForm />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/adminregisteration" element={<AdminRegister />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/studentupdateprofile" element={<UpdateProfile />} />


    </Routes>
    </BrowserRouter>
  )
}

export default App