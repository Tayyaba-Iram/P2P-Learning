import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './Complain.css';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null); // Track which complaint is selected for deletion

  // Fetch complaints on component mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/get-complaints', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComplaints(response.data);
      } catch (error) {
        setError(error.response?.data?.error || 'Error fetching complaints');
      }
    };
    fetchComplaints();
  }, []);

  // Function to handle deleting a complaint
  const handleDelete = (id) => {
    setConfirmDeleteIndex(id);  // Store the complaint ID to confirm delete
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.delete(`http://localhost:3001/api/delete-complaint/${confirmDeleteIndex}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setComplaints((prevComplaints) =>
          prevComplaints.filter((complaint) => complaint._id !== confirmDeleteIndex)
        );
      } else {
        toast.error(response.data.message);
      }

      setConfirmDeleteIndex(null); // Close the modal after confirming
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete complaint');
      setConfirmDeleteIndex(null); // Close the modal if there is an error
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteIndex(null); // Close the modal if canceled
  };

  return (
    <div className="complaints-list-container">
      <Link to="/complain-form">
        <button className="complaint-add-button">Add Complain</button>
      </Link>
      <h2 className='complaintss'>Your Complaints</h2>
      {error && <p className="error-message">{error}</p>}

      <table className="complaints-table">
        <thead>
          <tr>
            <th className='heading'>Target Name</th>
            <th className='heading'>Target Email</th>
            <th className='heading'>Category</th>
            <th className='heading'>Description</th>
            <th className='heading'>Date</th>
            <th className='heading'>File</th>
            <th className='heading'>Action</th>
            <th className='heading'>Status</th> 
          </tr>
        </thead>
        <tbody>
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <tr key={complaint._id}>
                <td>{complaint.targetname}</td>
                <td>{complaint.targetemail}</td>
                <td>{complaint.category}</td>
                <td>{complaint.description}</td>
                <td>{new Date(complaint.date).toLocaleDateString()}</td>
                <td>
                  {complaint.file ? (
                    <a href={`http://localhost:3001/complains/${complaint.file}`} target="_blank" rel="noopener noreferrer">
                      View File
                    </a>
                  ) : (
                    'No file'
                  )}
                </td>
                <td>
          {complaint.status || 'Pending'}
        </td> 
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
              <td colSpan="7">No complaints found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {confirmDeleteIndex !== null && (
        <div className="delete-confirmation-modal">
          <div className="delete-modal-content">
            <p>Are you sure you want to delete this complaint?</p>
            <div className="modal-buttons">
              <button className="modal-button confirm" onClick={handleDeleteConfirm}>Yes</button>
              <button className="modal-button cancel" onClick={handleDeleteCancel}>No</button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-center" />
    </div>
  );
};

export default Complaints;
