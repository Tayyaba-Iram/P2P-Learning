import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './Complain Action.css';
import { UserContext } from './userContext';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="confirm-btn">Yes</button>
          <button onClick={onCancel} className="cancel-btn">No</button>
        </div>
      </div>
    </div>
  );
};

const ComplainAction = () => {
  const { setUser } = useContext(UserContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [actionType, setActionType] = useState('');
  const [complaint, setComplaint] = useState(null);
  const { complaintId } = useParams();

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        // Fetch only the complaint by its ID
        const response = await axios.get(`http://localhost:3001/api/complaint/${complaintId}`);
        setComplaint(response.data);
        console.log(response.data);

        // Fetch the account status
        const token = sessionStorage.getItem('token');
        const userResponse = await axios.get(
          `http://localhost:3001/api/user-status/${response.data.targetemail}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
                if (userResponse.data) {
          setComplaint((prevComplaint) => ({
            ...prevComplaint,
            status: userResponse.data.accountStatus,
          }));
        }
      } catch (error) {
        setError('Error fetching the complaint');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [complaintId]);

  const openModal = (email, type) => {
    setSelectedEmail(email);
    setActionType(type);
    setIsModalOpen(true);
  };

  const handleCancelAction = () => {
    setIsModalOpen(false);
    setSelectedEmail('');
    setActionType('');
  };

  const handleConfirmAction = async () => {
    if (!selectedEmail || !actionType) return;
    const token = sessionStorage.getItem('token');

    try {
      const url =
        actionType === 'suspend'
          ? `http://localhost:3001/api/suspend-account/${selectedEmail}`
          : `http://localhost:3001/api/unsuspend-account/${selectedEmail}`;

      const response = await axios.post(url, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast.success(response.data.message);

      // Update the complaint status locally to reflect the change
      setComplaint((prevComplaint) => ({
        ...prevComplaint,
        status: actionType === 'suspend' ? 'Suspended' : 'Active',
      }));

      // Update complaints array (if necessary)
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.targetemail === selectedEmail
            ? { ...complaint, status: actionType === 'suspend' ? 'Suspended' : 'Active' }
            : complaint
        )
      );
    } catch (error) {
      console.error(`Error ${actionType}ing account:`, error);
      toast.error(`Failed to ${actionType} account.`);
    } finally {
      handleCancelAction();
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="complain-dashboard">
      <h2>Complaint Details</h2>

      {complaint ? (
        <table className="complaint-table">
          <tbody>
            <tr>
              <th>Name</th>
              <td>{complaint.username}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{complaint.useremail}</td>
            </tr>
            <tr>
              <th>Target Name</th>
              <td>{complaint.targetname || 'N/A'}</td>
            </tr>
            <tr>
              <th>Target Email</th>
              <td>{complaint.targetemail || 'N/A'}</td>
            </tr>
            <tr>
              <th>Date</th>
              <td>{new Date(complaint.date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <th>Category</th>
              <td>{complaint.category}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{complaint.description}</td>
            </tr>
            <tr>
              <th>File</th>
              <td>
                {complaint.file ? (
                  <a
                    href={`http://localhost:3001/complains/${complaint.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                ) : (
                  'No File'
                )}
              </td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{complaint.status || 'Active'}</td>
            </tr>
            <tr>
              <th>Action</th>
              <td>
                {complaint.status === 'Suspended' ? (
                  <button 
                    onClick={() => openModal(complaint.targetemail, 'unsuspend')}
                    className="unsuspend-btn"
                  >
                    Unsuspend
                  </button>
                ) : (
                  <button
                  style={{
                    backgroundColor: 'crimson',
                  }}
                    onClick={() => openModal(complaint.targetemail, 'suspend')}
                    className="suspend-btn"
                  >
                    Suspend
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>No complaint data available</p>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        title={actionType === 'suspend' ? 'Suspend Account' : 'Unsuspend Account'}
        message={`Are you sure you want to ${actionType} this account?`}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </div>
  );
};

export default ComplainAction;
