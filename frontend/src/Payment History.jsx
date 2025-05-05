import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import './Payment History.css';

const StudentSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('http://localhost:3001/api/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSessions(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleDeleteClick = (index) => {
    setConfirmDeleteIndex(index);
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteIndex(null);
  };

  const handleDeleteConfirm = async () => {
    const token = sessionStorage.getItem('token');
    if (!token || confirmDeleteIndex === null) return;

    const sessionToDelete = sessions[confirmDeleteIndex];

    try {
      await axios.delete(`http://localhost:3001/api/sessions/${sessionToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedSessions = [...sessions];
      updatedSessions.splice(confirmDeleteIndex, 1);
      setSessions(updatedSessions);
      setConfirmDeleteIndex(null);

      toast.success('Session deleted successfully!');
    } catch (err) {
      console.error('Error deleting session:', err);
      toast.error('Failed to delete session.');
    }
  };

  return (
    <div>
        <Toaster position="top-center" />
        <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Sessions History</h2>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</p>
      ) : sessions.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '18px' }}>
          No sessions conducted yet.
        </p>
      ) : (
        <div className="session-container">
          {sessions.map((session, index) => (
            <div className="session-card" key={index}>
              <h3>{session.paymentMethod === 'cash' ? 'Cash Session' : 'Food Session'}</h3>
              <table className="profile-table">
                <tbody>
                  <tr><th>Topic</th><td>{session.topic}</td></tr>
                  <tr><th>Date</th><td>{session.date}</td></tr>
                  <tr><th>Time</th><td>{session.startTime} - {session.endTime}</td></tr>

                  {session.paymentMethod === 'cash' ? (
                    <>
                      <tr><th>Amount</th><td>Rs. {session.amount}</td></tr>
                      <tr><th>Instructor</th><td>{session.instructorName}</td></tr>
                      <tr><th>Account Title</th><td>{session.instructorHolder}</td></tr>
                      <tr><th>Number</th><td>{session.instructorNumber}</td></tr>
                    </>
                  ) : (
                    <>
                      <tr><th>Receiver</th><td>{session.receiver}</td></tr>
                      <tr><th>Brand</th><td>{session.foodBrand}</td></tr>
                      <tr><th>Item</th><td>{session.foodItem}</td></tr>
                      <tr>
                        <th>Bill</th>
                        <td>
                          {session.foodBill ? (
                            <a
                              href={`http://localhost:3001/uploads/${session.foodBill}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Bill
                            </a>
                          ) : 'N/A'}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center' }}>
                      <button
                        className="delete-button"
                        style={{ backgroundColor: 'crimson' }}
                        onClick={() => handleDeleteClick(index)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteIndex !== null && (
        <div className="delete-confirmation-modal">
          <div className="delete-modal-content">
            <p>Are you sure you want to delete this session?</p>
            <div className="modal-buttons">
              <button
                style={{ backgroundColor: 'crimson' }}
                className="modal-button confirm"
                onClick={handleDeleteConfirm}
              >
                Yes
              </button>
              <button className="modal-button cancel" onClick={handleDeleteCancel}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSessions;
