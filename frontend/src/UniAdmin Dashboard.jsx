import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './UniAdmin Dashboard.css';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { UserContext } from './userContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { setUser } = useContext(UserContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [data, setData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:3001/api/admin-dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(response => {
          setUserData(response.data.user);
        })
        .catch(err => {
          setError(err.response ? err.response.data.error : 'An error occurred');
        });
    } else {
      setError('Token is missing, please log in.');
    }
  }, []);

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

  const fetchChartData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ratings-university-program', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
      });
      const chartsData = await response.json();
      setData(chartsData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);



  if (!data) {
    return <div>Loading...</div>;
  }

  const filteredLabels = data.labels.filter(
    label => label && label !== 'undefined' && label.trim() !== ''
  );

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
        ticks: { stepSize: 1 },
      },
    },
  };

  const chartsData = {
    labels: filteredLabels,
    datasets: cleanedDatasets,
  };


  const handleResolve = async (id) => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await axios.put(`http://localhost:3001/api/resolve-complaint/${id}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success(response.data.message);

      // Update the complaints list by marking the resolved one
      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint._id === id ? { ...complaint, status: 'Resolved' } : complaint
        )
      );
    } catch (error) {
      console.error('Error resolving complaint:', error);
      toast.error('Failed to resolve complaint.');
    }
  };

  return (
    <div className="admin-dashboard">
      {userData ? (
        <div className="user-info">
          <h2>Welcome {userData.name}!</h2>
        </div>
      ) : (
        <div className="error-message">
          {error ? <p>{error}</p> : <p>Loading user data...</p>}
        </div>
      )}

      <div className="bar-container">
        <h2>Programs Ranking by Session Count </h2>

        <Bar data={chartsData} options={chartOptions} />
      </div>

      <h2>Complaints Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th className='heading'>Name</th>
            <th className='heading'>Email</th>
            <th className='heading'>Category</th>
            <th className='heading'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr
              key={complaint._id}
              onClick={() => navigate(`/complain-action/${complaint._id}`)}
              style={{ cursor: 'pointer' }} // cursor pointer show karega
            >
              <td>{complaint.username}</td>
              <td>{complaint.useremail}</td>
              <td>{complaint.category}</td>
              <td>
                <button className='admin-resolve-button'
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent table row click (navigation)
                    handleResolve(complaint._id);
                  }}
                  disabled={complaint.status === 'Resolved'}
                  style={{
                    backgroundColor: complaint.status === 'Resolved' ? 'gray' : 'green',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '5px',
                    cursor: complaint.status === 'Resolved' ? 'not-allowed' : 'pointer'
                  }}
                >
                  {complaint.status === 'Resolved' ? 'Resolved' : 'Resolve'}
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
