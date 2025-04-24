import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './UniAdmin Dashboard.css';
import { UserContext } from './userContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { setUser } = useContext(UserContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  

    // Fetch logged-in user data
  useEffect(() => {
    const token = sessionStorage.getItem('token');  

    if (token) {
      axios.get('http://localhost:3001/api/admin-dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          console.log(response.data);  // Check the structure of the response
          setUserData(response.data.user);
        })
        .catch(err => {
          setError(err.response ? err.response.data.error : 'An error occurred');
        });
    } else {
      setError('Token is missing, please log in.');
    }
  }, []);

  // Fetch complaints data
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/viewcomplaints');
        setComplaints(response.data);
      } catch (error) {
        setError('Error fetching complaints');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);
  const handleSuspend = async (userEmail) => {
    const isConfirmed = window.confirm("Are you sure you want to suspend this user's account?");
    if (isConfirmed) {
      try {
        
        // Retrieve the JWT token from localStorage or wherever it is stored
        const token = sessionStorage.getItem('token'); // Replace with actual token storage method if needed
        
        if (!token) {
          console.error('No authentication token found');
          alert('You must be logged in to perform this action.');
          return;
        }
  
        const response = await axios.post(
          `http://localhost:3001/api/suspend-account/${userEmail}`,
          {}, // No body is needed for this request
          {
            headers: {
              'Authorization': `Bearer ${token}` // Add the Bearer token to the headers
            }
          }
        );
  
        alert(response.data.message); // Show a success message
  
        // Update the complaints list to reflect the suspended status
        setComplaints(complaints.map(complaint =>
          complaint.email === userEmail ? { ...complaint, status: 'Suspended' } : complaint
        ));
      } catch (error) {
        console.error('Error suspending account:', error);
        if (error.response && error.response.status === 404) {
          console.log("User not found!");
        } else {
          console.log('Failed to suspend account. Please try again later.');
        }
      }
    }
  };
  

 
  // Unsuspend a user
  const handleUnsuspend = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to unsuspend this user's account?");
    if (isConfirmed) {
      try {
        const response = await axios.post(`http://localhost:3001/api/unsuspend-account/${id}`);
        alert(response.data.message); // Show a success message
        setComplaints(complaints.map(complaint =>
          complaint._id === id ? { ...complaint, status: 'Active' } : complaint
        ));
      } catch (error) {
        setError('Failed to unsuspend account');
      }
    }
  };

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/ratings-university-program', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
        const chartsData = await response.json();
        setData(chartsData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  // Filter and clean labels
  const filteredLabels = data.labels.filter(
    label => label && label !== 'undefined' && label.trim() !== ''
  );

  // Clean datasets
  const cleanedDatasets = data.datasets
    .filter(dataset => dataset.label && dataset.label !== 'undefined')
    .map((dataset, index) => {
      const cleanedData = filteredLabels.map(label => {
        const labelIndex = data.labels.indexOf(label);
        return dataset.data[labelIndex] || 0;
      });

      return {
        ...dataset,
        data: cleanedData,
        backgroundColor: `hsl(${(index * 360) / data.datasets.length}, 70%, 60%)`,
      };
    });

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Sessions per Program ',
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

  const chartsData = {
    labels: filteredLabels,
    datasets: cleanedDatasets,
  };
  return (
    <div className="admin-dashboard">
      {userData ? (
        <div className="user-info">
          <h2>Welcome: {userData.name}!</h2>
        </div>
      ) : (
        <div className="error-message">
          {error ? <p>{error}</p> : <p>Loading user data...</p>}
        </div>
      )}
 <div className="bar-container">
    <h2>Feedback Sessions per Program per University</h2>
      <Bar data={chartsData} options={chartOptions} />
    </div>
      <h3>Complaints Dashboard</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>SAP ID</th>
            <th>Email</th>
            <th>University</th>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint._id}>
              <td>{complaint.name}</td>
              <td>{complaint.sapid}</td>
              <td>{complaint.email}</td>
              <td>{complaint.university}</td>
              <td>{new Date(complaint.date).toLocaleDateString()}</td>
              <td>{complaint.category}</td>
              <td>{complaint.description}</td>
              <td>
                {/* Show suspend/unsuspend buttons based on complaint status */}
                {complaint.status === 'Suspended' ? (
                  <button onClick={() => handleUnsuspend(complaint._id)} className="unsuspend-btn">
                    Unsuspend
                  </button>
                ) : (
                  <button onClick={() => handleSuspend(complaint._id)} className="suspend-btn">
                    Suspend
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
