import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Superadmin Dashboard.css';
import toast from 'react-hot-toast';

function Dashboard() {
  const [universities, setUniversities] = useState([]);
  const [students, setStudents] = useState([]);
  const [uniadmins, setUniadmins] = useState([]);
  const [displayeAdmins, setDisplayedAdmins] = useState([]);
  // Search states for each table
  const [universitySearch, setUniversitySearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [adminSearch, setAdminSearch] = useState('');

  const navigate = useNavigate();

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
        console.error('Error fetching students:', error);
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

  // Handle university deletion
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



  // Toggle functionality
  const [showAllUniversities, setShowAllUniversities] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [showAllAdmins, setShowAllAdmins] = useState(false);

  const toggleUniversities = () => setShowAllUniversities(!showAllUniversities);
  const toggleStudents = () => setShowAllStudents(!showAllStudents);
  const toggleAdmins = () => setShowAllAdmins(!showAllAdmins);

  // Filtering data based on search inputs
  const filteredUniversities = universities.filter((uni) =>
    uni.name.toLowerCase().includes(universitySearch.toLowerCase())
  );


  const filteredStudents = students.filter((student) => {
    // Convert all fields to lowercase for case-insensitive search
    const searchQuery = studentSearch.toLowerCase();
    return (
      student.sapid.toLowerCase().includes(searchQuery) ||
      typeof student.university === 'string' && student.university.toLowerCase().includes(searchQuery),
      typeof student.campus === 'string' && student.campus.toLowerCase().includes(searchQuery),
      typeof student.program === 'string' && student.program.toLowerCase().includes(searchQuery)


    );
  });
  const filteredUniAdmins = uniadmins.filter((admin) => {
    // Convert all fields to lowercase for case-insensitive search
    const searchQuery = adminSearch.toLowerCase();
    return (
      admin.sapid.toLowerCase().includes(searchQuery) ||
      typeof admin.university === 'string' && admin.university.toLowerCase().includes(searchQuery)
    );
  });
  const handleDeleteAdmin = async (adminId) => {
    try {
      await axios.delete(`http://localhost:3001/api/Uniadmins/${adminId}`);
      // Update the state by removing the deleted admin from the list
      setUniadmins((prevAdmins) => prevAdmins.filter((admin) => admin._id !== adminId));
      setDisplayedAdmins((prevAdmins) => prevAdmins.filter((admin) => admin._id !== adminId));
      toast.success('Admin deleted successfully');
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  // Limiting displayed items
  const displayedUniversities = showAllUniversities
    ? filteredUniversities
    : filteredUniversities.slice(0, 5);
  const displayedStudents = showAllStudents ? filteredStudents : filteredStudents.slice(0, 5);
  const displayedAdmins = showAllAdmins ? filteredUniAdmins : filteredUniAdmins.slice(0, 5);

  return (
    <div className="container">
      <main className="main-content">
        <h1>Superadmin Dashboard</h1>
        {/* Universities Table */}
        <h2>Universities</h2>
        <input
          type="text"
          placeholder="Search universities..."
          value={universitySearch}
          onChange={(e) => setUniversitySearch(e.target.value)}
          className="search-bar"
        />{filteredUniversities.length > 5 && (
          <button onClick={toggleUniversities}>
            {showAllUniversities ? 'View Less' : 'View All'}
          </button>
        )}
        <table>
          <thead>
            <tr>
              <th>University</th>
              <th>Campus</th>
              <th>Program</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedUniversities.map((university) => {
              const totalCampusRows = university.campuses.reduce(
                (sum, campus) => sum + (campus.programs.length || 1),
                0
              );

              return (
                <React.Fragment key={university._id}>
                  {university.campuses.map((campus, campusIndex) => {
                    const totalProgramRows = campus.programs.length || 1;

                    return (
                      <React.Fragment key={campusIndex}>
                        {campus.programs.length > 0 ? (
                          campus.programs.map((program, programIndex) => (
                            <tr key={programIndex}>
                              {/* Merge university name into one row for all campuses and programs */}
                              {campusIndex === 0 && programIndex === 0 && (
                                <td rowSpan={totalCampusRows}>{university.name}</td>
                              )}
                              {/* Merge campus name into one row for all programs */}
                              {programIndex === 0 && (
                                <td rowSpan={totalProgramRows}>{campus.name}</td>
                              )}
                              {/* Program name */}
                              <td>{program.name}</td>
                              {/* Actions - only once per university */}
                              {campusIndex === 0 && programIndex === 0 && (
                                <td rowSpan={totalCampusRows}>
                                  <button onClick={() => handleEditClick(university)}>Edit</button>
                                  <button onClick={() => handleDeleteUniversity(university._id)}>
                                    Delete
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            {/* Handle cases where there are no programs */}
                            {campusIndex === 0 && (
                              <td rowSpan={totalCampusRows}>{university.name}</td>
                            )}
                            <td>{campus.name}</td>
                            <td>No programs</td>
                            {campusIndex === 0 && (
                              <td rowSpan={totalCampusRows}>
                                <button onClick={() => handleEditClick(university)}>Edit</button>
                                <button onClick={() => handleDeleteUniversity(university._id)}>
                                  Delete
                                </button>
                              </td>
                            )}
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>



        {/* University Admins Table */}
        <h2>University Admins</h2>
        <input
          type="text"
          placeholder="Search by SAP ID, University..."
          value={adminSearch}
          onChange={(e) => setAdminSearch(e.target.value)}
          className="search-bar"
        />
        {filteredUniAdmins.length > 5 && (
          <button onClick={() => setShowAllAdmins(!showAllAdmins)}>
            {showAllAdmins ? 'View Less' : 'View All'}
          </button>
        )}
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SAP ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>University</th>
              <th>Campus</th>
              <th>Actions</th> {/* Add actions column for the delete button */}
            </tr>
          </thead>
          <tbody>
            {displayedAdmins.map((admin) => (
              <tr key={admin._id}>
                <td>{admin.name}</td>
                <td>{admin.sapid}</td>
                <td>{admin.email}</td>
                <td>{admin.phone}</td>
                <td>{admin.university}</td>
                <td>{admin.campus}</td>
                <td>
                  {/* Delete button */}
                  <button onClick={() => handleDeleteAdmin(admin._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>



        {/* Verified Students Table */}
        <h2>Verified Students</h2>
        <input
          type="text"
          placeholder="Search by SAP ID, University, Campus, Program..."
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          className="search-bar"
        />
        {filteredStudents.length > 5 && (
          <button onClick={toggleStudents}>
            {showAllStudents ? 'View Less' : 'View All'}
          </button>
        )}
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
            {displayedStudents.map((student) => (
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


      </main>
    </div>
  );
}

export default Dashboard;