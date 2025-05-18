import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './Complain.css';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
const [message, setMessage] = useState('');

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
setMessage(error.response?.data?.error || 'Error fetching complaints');
      }
    };
    fetchComplaints();
  }, []);

  const handleDelete = (id) => {
    setConfirmDeleteIndex(id);
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
        setComplaints((prev) =>
          prev.filter((complaint) => complaint._id !== confirmDeleteIndex)
        );
      } else {
        toast.error(response.data.message);
      }

      setConfirmDeleteIndex(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete complaint');
      setConfirmDeleteIndex(null);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteIndex(null);
  };
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComplaints = Array.isArray(complaints)
    ? complaints.filter((complaint) =>
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.targetemail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.targetname.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  return (
    <div className="complaints-list-container">

<div style={{ display: 'flex', justifyContent: 'center' }}>
  <input
    type="text"
    placeholder="🔍︎ Search complaints by Target Name, Email, Category and Description..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="directory-search"
    style={{
      width: '60%',
      borderRadius: '8px',
      border: '1px solid #ccc',
    }}
  />
</div>


      <Link to="/complain-form">
        <button className="complaint-add-button">Add Complaint</button>
      </Link>

      {filteredComplaints.length > 0 ? (
        <table  style={{
    borderRadius: '12px',
    borderSpacing: '0',
    overflow: 'hidden',
  }}className="complaints-table">
          <thead>
            <tr>
              <th className="heading">Target Name</th>
              <th className="heading">Target Email</th>
              <th className="heading">Category</th>
              <th className="heading">Description</th>
              <th className="heading">Date</th>
              <th className="heading">File</th>
              <th className="heading">Status</th>
              <th className="heading">Action</th>
            </tr>
          </thead>
         <tbody>
  {filteredComplaints.length > 0 ? (
    filteredComplaints.map((complaint) => (
      <tr key={complaint._id}>
        <td>{complaint.targetname}</td>
        <td>{complaint.targetemail}</td>
        <td>{complaint.category}</td>
        <td>{complaint.description}</td>
        <td>{new Date(complaint.date).toLocaleDateString()}</td>
        <td>
          {complaint.file ? (
            <a
              href={`http://localhost:3001/complains/${complaint.file}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View File
            </a>
          ) : (
            'No file'
          )}
        </td>
        <td>{complaint.status || 'Pending'}</td>
        <td>
          <button
            style={{
              backgroundColor: 'crimson',
              fontSize: '16px'
            }}
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
      <td colSpan="8" style={{ textAlign: 'center', padding: '10px' }}>
        No complaints found.
      </td>
    </tr>
  )}
</tbody>

        </table>
      ) : (
        <p className="no-complaints-msg">No complaints submitted yet.</p>
      )}

      {confirmDeleteIndex !== null && (
        <div className="delete-confirmation-modal">
          <div className="delete-modal-content">
            <p>Are you sure you want to delete this complaint?</p>
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

      <Toaster position="top-center" />
    </div>
  );
};

export default Complaints;
