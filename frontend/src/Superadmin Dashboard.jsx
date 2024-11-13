import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Superadmin Dashboard.css';

function Dashboard() {
  const [universities, setUniversities] = useState([]);
  const [students, setStudents] = useState([]);
  const [uniadmins, setUniadmins] = useState([]);

  // Search states for each table
  const [universitySearch, setUniversitySearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [adminSearch, setAdminSearch] = useState('');

  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/api/superadmin-dashboard', { withCredentials: true })
      .then(response => {
        setUserData(response.data.user);
      })
      .catch(err => {
        setError(err.response ? err.response.data.error : 'An error occurred');
      });
  }, []);
  // Fetch data on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/universities');
        setUniversities(response.data);
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/verifiedStudents');
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching verified students:', error);
      }
    };

    const fetchUniAdmins = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/Uniadmins');
        setUniadmins(response.data);
      } catch (error) {
        console.error('Error fetching university admins:', error);
      }
    };

    fetchUniversities();
    fetchStudents();
    fetchUniAdmins();
  }, []);

  // Handle delete university
  const handleDeleteUniversity = async (universityId) => {
    try {
      await axios.delete(`http://localhost:3001/api/universities/${universityId}`);
      setUniversities((prev) => prev.filter((uni) => uni._id !== universityId));
      alert('University deleted successfully');
    } catch (error) {
      console.error('Error deleting university:', error);
    }
  };

  const handleEditClick = (university) => {
    navigate('/edituniversity', { state: { university } });
  };

  // Filter functions for each table (specific to SAP ID)
  const filteredUniversities = universities.filter((uni) =>
    uni.name.toLowerCase().includes(universitySearch.toLowerCase())
  );

  const filteredStudents = students.filter((student) =>
    student.sapid.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredUniAdmins = uniadmins.filter((admin) =>
    admin.sapid.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="container">
      <main className="main-content">
        <h1>Superadmin Dashboard</h1>
        {userData ? (
        <div className="user-info">
          <p>Email: {userData.email}</p>
        </div>
      ) : (
        <div className="error-message">
          {error ? <p>{error}</p> : <p>Loading user data...</p>}
        </div>
      )}
        <div className="buttons-container">
          <Link to="/adduniversity">
            <button className="btn">Add University</button>
          </Link>
          <Link to="/adminregisteration">
            <button className="btn">Add Admin</button>
          </Link>
        </div>

        {/* Universities Table with Search */}
        <h2>Universities</h2>
        <input
          type="text"
          placeholder="Search universities..."
          value={universitySearch}
          onChange={(e) => setUniversitySearch(e.target.value)}
          className="search-bar"
        />
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Campuses</th>
              <th>Programs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUniversities.map((university) => (
              <tr key={university._id}>
                <td>{university.name}</td>
                <td>{university.campuses?.map((campus) => campus.name).join(', ') || 'N/A'}</td>
                <td>
                  {university.campuses?.flatMap((campus) =>
                    campus.programs.map((program) => program.name)
                  ).join(', ') || 'N/A'}
                </td>
                <td>
                  <button onClick={() => handleEditClick(university)}>Edit</button>
                  <button onClick={() => handleDeleteUniversity(university._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Verified Students Table with Search */}
        <h2>Verified Students</h2>
        <input
          type="text"
          placeholder="Search by SAP ID..."
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          className="search-bar"
        />
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SAP ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>University</th>
              <th>Campus</th>
              <th>Program</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.sapid}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.university}</td>
                <td>{student.campus}</td>
                <td>{student.program}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* University Admins Table with Search */}
        <h2>University Admins</h2>
        <input
          type="text"
          placeholder="Search by SAP ID..."
          value={adminSearch}
          onChange={(e) => setAdminSearch(e.target.value)}
          className="search-bar"
        />
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SAP ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>University</th>
              <th>Campus</th>
            </tr>
          </thead>
          <tbody>
            {filteredUniAdmins.map((admin) => (
              <tr key={admin._id}>
                <td>{admin.name}</td>
                <td>{admin.sapid}</td>
                <td>{admin.email}</td>
                <td>{admin.phone}</td>
                <td>{admin.university}</td>
                <td>{admin.campus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default Dashboard;
