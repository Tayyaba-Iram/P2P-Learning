import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Student Home.css';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

const localizer = momentLocalizer(moment);

function Home() {
  const [agenda, setAgenda] = useState([]);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false); // For viewing session details
  const [message, setMessage] = useState('');
  const [sessionDetails, setSessionDetails] = useState({
    topic: '',
    startTime: '',
    endTime: '',
    date: new Date(),
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = sessionStorage.getItem('token'); // Get token from local storage
        const response = await axios.get('http://localhost:3001/api/sessions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched sessions:", response.data); // ✅ log sessions here
        setAgenda(response.data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };
    fetchSessions();
  }, []);


  const handleEventSelect = (event) => {
    const session = agenda.find((s) => s._id === event.id);
    if (session) {
      setSessionDetails({
        topic: session.topic,
        startTime: session.startTime,
        endTime: session.endTime,
        date: new Date(session.date),
        meetingLink: session.meetingLink,
      });
      setSelectedEvent(session);
      setDetailsModalOpen(true);
    }
  };

  const handleDeleteSession = async () => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: 'This session will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3001/api/sessions/${selectedEvent._id}`);
        setAgenda(agenda.filter((session) => session._id !== selectedEvent._id));
        setDetailsModalOpen(false);
        toast.success('Session deleted successfully');
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sessionDetails.meetingLink);
    toast.success('Link copied to clipboard');
  };

  const events = agenda.map((session) => ({
    id: session._id,
    title: session.topic,
    start: new Date(session.date.split('T')[0] + 'T' + session.startTime),
    end: new Date(session.date.split('T')[0] + 'T' + session.endTime),
  }));
  const [broadcastRequests, setBroadcastRequests] = useState([]);

  useEffect(() => {
    const fetchBroadcastRequests = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`http://localhost:3001/api/get-broadcastRequest`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBroadcastRequests(response.data);
      } catch (error) {
        console.error('Error fetching broadcast requests:', error);
      }
    };

    fetchBroadcastRequests();
  }, []);
  const handleDeleteBroadcastRequest = async (requestId) => {
    console.log('Deleting request with ID:', requestId);  // Log the requestId to verify it's correct

    const confirmDelete = await Swal.fire({
      title: 'Mark as resolved?',
      text: 'This request will be marked as resolved and removed from the display.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Mark as Resolved',
      cancelButtonText: 'Cancel',
    });

    if (confirmDelete.isConfirmed) {
      try {
        const token = sessionStorage.getItem('token');  // Get token from sessionStorage

        // Ensure the requestId is being passed correctly and is a valid MongoDB ObjectId
        await axios.delete(`http://localhost:3001/api/delete-broadcastRequest/${requestId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Add the Bearer token to the request
          },
        });

        setBroadcastRequests(broadcastRequests.filter(request => request._id !== requestId));
        toast.success('Request deleted successfully');
      } catch (error) {
        console.error('Error deleting request:', error);
        toast.error('Error deleting request');
      }
    }
  };


  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Log to check if the effect is running
        console.log('Fetching broadcast requests...');

        const token = sessionStorage.getItem('token');  // Get token from sessionStorage
        console.log('Token:', token);  // Log the token to verify if it's being retrieved

        if (!token) {
          console.log('Token not found');  // Log if token is missing
          setError('Token not found');
          setLoading(false);
          return;
        }

        // Log before making the API call
        console.log('Making API call to fetch broadcast requests...');

        // Make API call to fetch broadcast requests
        const res = await axios.get('http://localhost:3001/api/broadcastRequest-By-Programs', {
          headers: {
            Authorization: `Bearer ${token}`  // Add token to headers
          }
        });

        // Log the response data to verify it's being received
        console.log('Response received:', res.data);

        // Set the fetched data to state
        setRequests(res.data);
        setLoading(false);
      } catch (err) {
        // Log the error
        console.log('Error in fetchRequests:', err);
        setError('Error fetching broadcast requests');
        setLoading(false);
      }
    };

    fetchRequests();
  /*  const intervalId = setInterval(() => {
      fetchRequests();  // Re-fetch data every 10 seconds
    }, 1000);  // 10000ms = 10 seconds

    // Cleanup on component unmount
    return () => clearInterval(intervalId);*/
  }, []);  // Call the fetchRequests function when the component mounts
  


  return (
    <>
      <div className="main-container">
        {/* Calendar Section */}
        <div className="calendar-container">
          <h3 className="calendar-title">Session Calendar</h3>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            onSelectEvent={handleEventSelect}
          />
        </div>

        {/* Side Container */}
        <div className="side-container">
          <div className="schedule-session-container">
            <h3>Schedule a Session</h3>
            <p>Plan a session and manage your learning schedule.</p>
            <Link to="/session" className="schedule-btn">
              Schedule Session
            </Link>
          </div>
          <div className="chat-container">
            <h3>Chat</h3>
            <p>Start a chat with your peers!</p>
            <Link to="/Chat" className="chat-button">
              Chat
            </Link>
          </div>
          <div className="conduct-session-container">
            <h3>Conduct a Session</h3>
            <p>Start a session with your peers and learn together!</p>
            <Link to="/ConductSession" className="conduct-session-button">
              Conduct Session
            </Link>
          </div>
        </div>


        {/* Session Details Modal */}
        {isDetailsModalOpen && (
          <div className="form-backdrop" onClick={() => setDetailsModalOpen(false)}>
            <div className="schedule-form" onClick={(e) => e.stopPropagation()}>
              <h3 className="form-title">Session Details</h3>
              <div className="form-group">
                <label>Topic</label>
                <input
                  type="text"
                  value={sessionDetails.topic}
                  readOnly
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '10px',
                    width: '100%',
                  }}
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="text"
                  value={sessionDetails.date.toLocaleDateString()}
                  readOnly
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '10px',
                    width: '100%',
                  }}
                />
              </div>

              <div className="form-group">
                <label>Start Time</label>
                <input type="text" value={sessionDetails.startTime} readOnly />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="text" value={sessionDetails.endTime} readOnly />
              </div>
              <div className="form-group">
                <label>Meeting Link</label>
                <a
                  href={sessionDetails.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sessionDetails.meetingLink}
                </a>
                <button className="copy-btn" onClick={handleCopyLink}>
                  Copy Link
                </button>
              </div>
              <div className="form-actions">
                <button
                  className="delete-btn"
                  onClick={handleDeleteSession}
                >
                  Delete Session
                </button>
                <button
                  className="clear-btn"
                  onClick={() => setDetailsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <div style={{ marginTop: '40px' }}>
  {broadcastRequests.length === 0 ? (
    <p></p>
  ) : (
    <div className="broadcast-requests-table">
      <h3>Broadcast Requests</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Topic</th>
            <th>Subtopic</th>
            <th>Urgency</th>
            <th>Programs</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {broadcastRequests.map((request, index) => (
            <tr key={index}>
              <td>{request.topic}</td>
              <td>{request.subtopic}</td>
              <td>{request.urgency}</td>
              <td>{request.programs?.join(', ')}</td>
              <td>
                <button
                  onClick={() => handleDeleteBroadcastRequest(request._id)}
                  style={{ backgroundColor: 'green', color: 'white' }}
                >
                  Resolved
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

<div>
  {requests.length === 0 ? (
    <p></p>
  ) : (
    <div>
      <h2>Broadcast Requests</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Topic</th>
            <th>Subtopic</th>
            <th>Urgency</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req._id}>
              <td>{req.name}</td>
              <td>{req.email}</td>
              <td>{req.topic}</td>
              <td>{req.subtopic}</td>
              <td>{req.urgency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


    </>
  );
}

export default Home;
