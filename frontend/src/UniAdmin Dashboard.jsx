// src/components/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UniAdmin Dashboard.css'; // Import your CSS file for styling

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="admin-dashboard">
            <h2>Complaints Dashboard</h2>
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
