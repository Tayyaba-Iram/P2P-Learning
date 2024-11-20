import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext, UserProvider } from './userContext';
import StudentNavbar from './StudentNavbar';
import AdminNavbar from './AdminNavbar';
import SuperAdminNavbar from './SuperAdminNavbar';
import Home from './Student Home';
import ConductSession from './ConductSession';
import Register from './Register';
import Login from './Login';
import Dashboard from './Superadmin Dashboard';
import ComplaintForm from './Complain Form';
import AdminDashboard from './UniAdmin Dashboard';
import AdminRegister from './Admin Registeration';
import ForgotPassword from './Forgot Password';
import ResetPassword from './Reset Password';
import UpdateProfile from './Student Update Profile';
import AddUniversity from './Add University';
import EditUniversity from './Edit University';
import Chat from './Chat';
import axios from 'axios';
import Footer from './Footer';
import Complaints from './Complains';
import StudentProfile from './Student Profile';
import UpdatePassword from './UpdatePassword';

axios.defaults.withCredentials = true;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  if (!user) {
    // If user is not logged in, redirect to the login page
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const { user } = useContext(UserContext);

  // Conditionally render the navbar based on the user's role
  const renderNavbar = () => {
    if (!user) return null;
    switch (user.role) {
      case 'student':
        return <StudentNavbar />;
      case 'admin':
        return <AdminNavbar />;
      case 'superadmin':
        return <SuperAdminNavbar />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderNavbar()} {/* Render Navbar based on user role */}
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/ConductSession" element={<ProtectedRoute><ConductSession /></ProtectedRoute>} />
        <Route path="/superdashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/complain-form" element={<ProtectedRoute><ComplaintForm /></ProtectedRoute>} />
        <Route path="/admindashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/adminregisteration" element={<ProtectedRoute><AdminRegister /></ProtectedRoute>} />
        <Route path="/studentupdateprofile" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
        <Route path="/adduniversity" element={<ProtectedRoute><AddUniversity /></ProtectedRoute>} />
        <Route path="/edituniversity" element={<ProtectedRoute><EditUniversity /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/complains" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
        <Route path="/studentprofile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
        <Route path="/resetpassword" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
        
      </Routes>
      
        <Footer />
    </>
  );
}

export default function Root() {
  return (
    <UserProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserProvider>
  );
}