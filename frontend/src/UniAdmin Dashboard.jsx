import React, { useContext,useEffect, useState } from 'react';
import axios from 'axios';
import './UniAdmin Dashboard.css';
import { UserContext } from './userContext';



const AdminDashboard = () => {
  const { setUser } = useContext(UserContext);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
  
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
