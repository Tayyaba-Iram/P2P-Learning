import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);

  // Fetch complaints on component mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = sessionStorage.getItem('token');
        console.log('Token:', token); // Log the token to check if it's correct
        const response = await axios.get('http://localhost:3001/api/get-complaints', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComplaints(response.data);
      } catch (error) {
        setError(error.response?.data?.error || 'Error fetching complaints');
        toast.error(error.response?.data?.error || 'Error fetching complaints');
      }
    };
    fetchComplaints();
  }, []);
  

  // Function to handle deleting a complaint
  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.delete(`http://localhost:3001/api/delete-complaint/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setComplaints((prevComplaints) =>
          prevComplaints.filter((complaint) => complaint._id !== id)
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete complaint');
    }
  };

  return (
    <div className="complaints-list-container">
      <Link to="/complain-form">
        <button className="btn">Add Complain</button>
      </Link>
      <h2>Your Complaints</h2>
      {error && <p className="error-message">{error}</p>}

      <table className="complaints-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Description</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <tr key={complaint._id}>
                <td>{complaint.category}</td>
                <td>{complaint.description}</td>
                <td>{new Date(complaint.date).toLocaleDateString()}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(complaint._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No complaints found</td>
            </tr>
          )}
        </tbody>
      </table>
      <Toaster position="top-center" />
    </div>
  );
};

export default Complaints;
