import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Superadmin Dashboard.css';
import toast from 'react-hot-toast';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement,Tooltip,Legend,CategoryScale,LinearScale,BarElement,Title,} from 'chart.js';

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


const [ratingsData, setRatingsData] = useState([]);
 const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  
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
      toast.success('University deleted successfully');
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
  }, []);

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
  }, []);

  // If data is still loading, show a loading message
  if (!data) {
    return <div>Loading...</div>;
  }

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
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


  return (
    <div className="container">
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
    <h2>Feedback Sessions per Program per University</h2>
      <Bar data={chartsData} options={chartOptions} />
    </div>
    </div>
      <main className="main-content">
        {/* Universities Table */}
        <h2>Universities</h2>
        <input
          type="text"
          placeholder="Search universities..."
          value={universitySearch}
          onChange={(e) => setUniversitySearch(e.target.value)}
          className="search-bar"
        />
        {filteredUniversities.length > 5 && (
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
                                  <button className = 'edit-button'onClick={() => handleEditClick(university)}>Edit</button>
                                  <button className='delete-button'onClick={() => handleDeleteUniversity(university._id)}>
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
                                <div className='edit-delete-buttons'>
                                <button onClick={() => handleEditClick(university)}>Edit</button>
                                <button onClick={() => handleDeleteUniversity(university._id)}>
                                  Delete
                                </button>
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
                  <button  className='delete-button'onClick={() => handleDeleteAdmin(admin._id)}>Delete</button>
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