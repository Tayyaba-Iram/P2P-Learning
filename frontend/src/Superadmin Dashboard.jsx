import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Superadmin Dashboard.css';
import toast, { Toaster } from 'react-hot-toast';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, } from 'chart.js';

// Register all necessary chart components at once
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const [universities, setUniversities] = useState([]);
  const [students, setStudents] = useState([]);
  const [uniadmins, setUniadmins] = useState([]);
  const [displayeAdmins, setDisplayedAdmins] = useState([]);
  // Search states for each table
  const [universitySearch, setUniversitySearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'admin' | 'university', id: string }
  const confirmDelete = (type, id) => {
    setDeleteTarget({ type, id });
  };


  const [ratingsData, setRatingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const navigate = useNavigate();
  const token = sessionStorage.getItem('token'); // Assuming you stored the token in sessionStorage


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
    const intervalId = setInterval(() => {
      fetchStudents();
      fetchUniAdmins();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [token]);


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
    const term = studentSearch.toLowerCase();
    return (
      student.name?.toLowerCase().includes(term) ||
      student.sapid?.toLowerCase().includes(term) ||
      student.email?.toLowerCase().includes(term) ||
      student.phone?.toLowerCase().includes(term) ||
      student.university?.toLowerCase().includes(term) ||
      student.campus?.toLowerCase().includes(term) ||
      student.program?.toLowerCase().includes(term)
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



  // Limiting displayed items
  const displayedUniversities = showAllUniversities
    ? filteredUniversities
    : filteredUniversities.slice(0, 5);
  const displayedStudents = showAllStudents ? filteredStudents : filteredStudents.slice(0, 5);
  const displayedAdmins = showAllAdmins ? filteredUniAdmins : filteredUniAdmins.slice(0, 5);

  useEffect(() => {
    // Function to fetch the ratings data from the backend with the Bearer token
    const fetchRatings = async () => {
      const token = sessionStorage.getItem('token'); // Assuming you stored the token in sessionStorage

      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/ratings-by-strenth', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Include the Bearer token in the Authorization header
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch ratings data');
        }

        const data = await response.json(); // Parse the JSON response
        setRatingsData(data.datasets[0].data); // Set the ratings data in state
        setLoading(false); // Set loading to false once the data is fetched
      } catch (err) {
        setError('Error fetching data: ' + err.message); // Handle any errors
        setLoading(false);
      }
    };

    fetchRatings(); // Call the fetchRatings function on component mount
    const intervalId = setInterval(() => {
      fetchRatings();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [token]);

  // Prepare chart data for rendering
  const chartData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'], // Labels for each section (now with 5 stars)
    datasets: [{
      data: ratingsData, // Data fetched from the backend
      backgroundColor: ['#FF5733', '#FF8D1A', '#FFD700', '#32CD32', '#4CAF50'], // Custom colors for each section
    }],
  };


  const [data, setData] = useState(null); // Renaming chartData to data to avoid conflicts

  useEffect(() => {
    const fetchChartData = async () => {
      const token = sessionStorage.getItem('token'); // Assuming you stored the token in sessionStorage

      try {
        const response = await fetch('http://localhost:3001/api/ratings-per-university-program', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
        const chartsData = await response.json();
        setData(chartsData); // Store the data in state
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();
    const intervalId = setInterval(() => {
      fetchChartData();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [token]);

  // If data is still loading, show a loading message
  if (!data) {
    return <div>Loading...</div>;
  }
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 18,
          },
        },
      },
      title: {
        display: true,
      },

    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 14, // Optional: increase X-axis label size (programs)
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 14, // Optional: increase Y-axis label size
          },
        },
      },
    },
  };


  // Step 1: Filter out undefined or empty program labels
  const filteredLabels = data.labels.filter(label => label && label !== 'undefined' && label.trim() !== '');

  // Step 2: Clean and align datasets with filtered labels
  const cleanedDatasets = data.datasets
    .filter(dataset => dataset.label && dataset.label !== 'undefined') // Remove undefined university names
    .map((dataset, index) => {
      // Align dataset data with filtered labels
      const cleanedData = filteredLabels.map(label => {
        const labelIndex = data.labels.indexOf(label);
        return dataset.data[labelIndex] || 0; // Use 0 if index not found
      });

      return {
        ...dataset,
        data: cleanedData,
        backgroundColor: `hsl(${(index * 360) / data.datasets.length}, 70%, 60%)`, // Unique color
      };
    });

  // Final chart data
  const chartsData = {
    labels: filteredLabels,
    datasets: cleanedDatasets,
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const { type, id } = deleteTarget;

    try {
      if (type === 'university') {
        await axios.delete(`http://localhost:3001/api/universities/${id}`);
        setUniversities((prev) => prev.filter((uni) => uni._id !== id));
        toast.success('University deleted successfully');
      } else if (type === 'admin') {
        await axios.delete(`http://localhost:3001/api/Uniadmins/${id}`);
        setUniadmins((prev) => prev.filter((admin) => admin._id !== id));
        setDisplayedAdmins((prev) => prev.filter((admin) => admin._id !== id));
        toast.success('Admin deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Deletion failed');
    }

    setDeleteTarget(null);
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  return (
    <div className="container">
      <Toaster position="top-center" />

      <h2 className='Academic-Analytics'>Academic Analytics</h2>
      <div className='ratings'>

        <div>
          {loading && <p>Loading...</p>}  {/* Show loading message while fetching */}
          {error && <p style={{ color: 'red' }}>{error}</p>}  {/* Show error message if there's an issue */}

          {!loading && !error && (
            <div className="chart-container">
              <h2>University Ratings Distribution</h2>
              <Pie data={chartData} options={{ responsive: true }} /> {/* Render the pie chart */}
            </div>
          )}
        </div>
        <div className="bar-container">
          <h2>Programs Ranking by Session Count</h2>
          <Bar data={chartsData} options={chartOptions} />
        </div>
      </div>
      <main className="main-content">
        {/* Universities Table */}
        <h2 style={{ marginTop: '50px' }}>Universities</h2>
        <input
          type="text"
          placeholder="🔍︎ Search universities..."
          value={universitySearch}
          onChange={(e) => setUniversitySearch(e.target.value)}
          className="search-bar"
        />
        {filteredUniversities.length > 5 && (
          <button
            style={{
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '108px',
              textAlign: 'center',
              justifyContent: 'center',
              marginRight: '35px',
              marginLeft: '1145px',
              height: '40px'
            }}
            onClick={toggleUniversities}>
            {showAllUniversities ? 'View Less' : 'View All'}
          </button>
        )}
        <table style={{
          borderRadius: '12px',
          borderSpacing: '0',
          overflow: 'hidden',
          marginTop: '25px'

        }} className='university-table'>
          <thead>
            <tr>
              <th>University</th>
              <th>Campus</th>
              <th>Program</th>
              <th style={{ width: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
  {displayedUniversities.length > 0 ? (
    displayedUniversities.map((university) => {
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
                      {campusIndex === 0 && programIndex === 0 && (
                        <td rowSpan={totalCampusRows}>{university.name}</td>
                      )}
                      {programIndex === 0 && (
                        <td rowSpan={totalProgramRows}>{campus.name}</td>
                      )}
                      <td>{program.name}</td>
                      {campusIndex === 0 && programIndex === 0 && (
                        <td rowSpan={totalCampusRows}>
                          <div className="button-wrapper">
                            <button className="edit-button" onClick={() => handleEditClick(university)}>Edit</button>
                            <button
                              style={{
                                backgroundColor: 'crimson',
                                fontSize: '16px',
                                height: '39px'
                              }}
                              className="delete-button"
                              onClick={() => confirmDelete('university', university._id)}
                            >Delete</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    {campusIndex === 0 && (
                      <td rowSpan={totalCampusRows}>{university.name}</td>
                    )}
                    <td>{campus.name}</td>
                    <td>No programs</td>
                    {campusIndex === 0 && (
                      <td rowSpan={totalCampusRows}>
                        <div className='edit-delete-buttons'>
                          <button onClick={() => handleEditClick(university)}>Edit</button>
                          <button
                            style={{ backgroundColor: 'crimson' }}
                            className="delete-button"
                            onClick={() => confirmDelete('university', university._id)}
                          >Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      );
    })
  ) : (
    <tr>
      <td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>
        No universities found.
      </td>
    </tr>
  )}
</tbody>

        </table>



        {/* University Admins Table */}
        <h2 style={{ marginTop: '50px' }}>University Admins</h2>
        <input
          type="text"
          placeholder="🔍︎ Search by Admin ID, University..."
          value={adminSearch}
          onChange={(e) => setAdminSearch(e.target.value)}
          className="search-bar"
        />
        {filteredUniAdmins.length > 5 && (
          <button
            style={{
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '108px',
              textAlign: 'center',
              justifyContent: 'center',
              marginRight: '35px',
              marginLeft: '1145px',
              height: '40px'
            }}
            onClick={toggleAdmins}>
            {showAllAdmins ? 'View Less' : 'View All'}
          </button>
        )}
        <table className='admin-table' style={{
          borderRadius: '12px',
          borderSpacing: '0',
          overflow: 'hidden',
          marginTop: '25px'
        }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Admin ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>University</th>
              <th>Campus</th>
              <th>Actions</th> {/* Add actions column for the delete button */}
            </tr>
          </thead>
          <tbody>
            {displayedAdmins.length > 0 ? (
              displayedAdmins.map((admin) => (
                <tr key={admin._id}>
                  <td>{admin.name}</td>
                  <td>{admin.sapid}</td>
                  <td>{admin.email}</td>
                  <td>{admin.phone}</td>
                  <td>{admin.university}</td>
                  <td>{admin.campus}</td>
                  <td>
                    <button
                      style={{
                        backgroundColor: 'crimson',
                        height: '39px',
                        fontSize: '16px',
                      }}
                      className="delete-button"
                      onClick={() => confirmDelete('admin', admin._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '10px' }}>
                  No university admins found.
                </td>
              </tr>
            )}
          </tbody>

        </table>



        {/* Verified Students Table */}
        <h2 style={{ marginTop: '50px' }}>Registered Students</h2>
        <input
          type="text"
          placeholder="🔍︎ Search by Student ID, University, Campus, Program..."
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          className="search-bar"
        />
        {filteredStudents.length > 5 && (
          <button
            style={{
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '108px',
              textAlign: 'center',
              justifyContent: 'center',
              marginRight: '35px',
              marginLeft: '1145px',
              height: '40px'
            }}
            onClick={toggleStudents}>
            {showAllStudents ? 'View Less' : 'View All'}
          </button>
        )}
        <table className='student-table' style={{
          borderRadius: '12px',
          borderSpacing: '0',
          overflow: 'hidden',
          marginTop: '25px'
        }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>University</th>
              <th>Campus</th>
              <th>Program</th>
            </tr>
          </thead>
         <tbody>
  {displayedStudents.length > 0 ? (
    displayedStudents.map((student) => (
      <tr key={student._id}>
        <td>{student.name}</td>
        <td>{student.sapid}</td>
        <td>{student.email}</td>
        <td>{student.phone}</td>
        <td>{student.university}</td>
        <td>{student.campus}</td>
        <td>{student.program}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" style={{ textAlign: 'center', padding: '10px' }}>
        No students found.
      </td>
    </tr>
  )}
</tbody>

        </table>


      </main>
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="delete-confirmation-modal">
          <div className="delete-modal-content">
            <p>Are you sure you want to delete this {deleteTarget.type}?</p>
            <div className="modal-buttons">
              <button style={{
                backgroundColor: 'crimson',
              }}
                className="modal-button confirm" onClick={handleDeleteConfirm}>Yes</button>
              <button className="modal-button cancel" onClick={handleDeleteCancel}>No</button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default Dashboard;