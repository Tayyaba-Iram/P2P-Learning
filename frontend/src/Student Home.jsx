import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Student Home.css';
import Swal from 'sweetalert2';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import toast, { Toaster } from 'react-hot-toast';


const localizer = momentLocalizer(moment);

function Home() {
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState(null);

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


  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const handleDeleteBroadcastRequest = (requestId) => {
    setConfirmDeleteId(requestId); // Trigger modal
  };
  const handleDeleteConfirm = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/delete-broadcastRequest/${confirmDeleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBroadcastRequests(prev =>
        prev.filter(request => request._id !== confirmDeleteId)
      );
      toast.success('Request deleted successfully');
      setConfirmDeleteId(null); // Close modal
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Error deleting request');
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteId(null); // Just close modal
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
  // Fetch the logged-in user details
  const [user, setUser] = useState(null);
  const [verifiedStudents, setVerifiedStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);

  // Fetch user details from the server (keep token logic intact)
  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('No token found. User not authenticated.');
        return;
      }
      try {
        const response = await axios.get('http://localhost:3001/api/getUserDetails', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data._id) {
          setUser(response.data);
        } else {
          console.error('User data is missing _id:', response.data);
        }
      } catch (err) {
        console.error('Error fetching user:', err.response?.data || err.message);
      }
    };

    fetchUser();
  }, []);

  // Fetch verified students list from the server (with token)
  useEffect(() => {
    const fetchVerifiedStudents = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('No token found. User not authenticated.');
        return;
      }
      try {
        const response = await axios.get('http://localhost:3001/api/verifiedStudents', {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token here for authentication
          },
        });
        if (response.data && Array.isArray(response.data)) {
          setVerifiedStudents(response.data);
        } else {
          console.error('Verified students data is invalid:', response.data);
        }
      } catch (err) {
        console.error('Error fetching verified students:', err.response?.data || err.message);
      }
    };

    fetchVerifiedStudents();
  }, []);

  const handleStartChat = (student) => {
    setActiveStudent(student);
  };

  const handleChatClick = (request) => {
    console.log(" Full request object received:", request);
    console.log(" Keys in request:", Object.keys(request));

    const studentId = request.userId; // Extract userId for matching
    console.log(" Extracted studentId:", studentId);

    //  Add this line to debug all verified student IDs
    console.log(" All verified student IDs:", verifiedStudents.map(s => s._id));

    const matchedStudent = verifiedStudents.find(
      (student) => student._id.toString() === studentId?.toString()
    );

    if (matchedStudent) {
      console.log(" Matched student:", matchedStudent);
      setSelectedStudentId(matchedStudent._id);
      handleStartChat(matchedStudent);
    } else {
      console.error(" No matching student found for the request with ID:", studentId);
    }
    navigate(`/chat/${studentId}`);
  };
 const [showAll, setShowAll] = useState(false);

  const visibleRequests = showAll ? broadcastRequests : broadcastRequests.slice(0, 5);
  const visibleRequest = showAll ? requests : requests.slice(0, 5);



  return (
    <>
      <div className="main-container">
        <Toaster position="top-center" />

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
            <Link to="/session" className="btn">
              Schedule Session
            </Link>
          </div>

          <div className="chat-container">
            <h3>Chat</h3>
            <p>Start a chat with your peers!</p>
            <Link to="/Chat" className="btn">
              Chat
            </Link>
          </div>

          <div className="conduct-session-container">
            <h3>Conduct a Session</h3>
            <p>Start a session with your peers and learn together!</p>
            <Link to="/ConductSession" className="btn">
              Conduct Session
            </Link>
          </div>
        </div>



        {/* Session Details Modal */}
        {isDetailsModalOpen && (
          <div className="form-backdrop" onClick={() => setDetailsModalOpen(false)}>
            <div className="schedule-form" onClick={(e) => e.stopPropagation()}>
              <h2 className="form-title">Session Details</h2>
              <div className="form-group">
                <label>Topic</label>
                <input
                  type="text"
                  value={sessionDetails.topic}
                  readOnly
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    width: '133.5%',
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
                    width: '133.5%',
                  }}
                />
              </div>

              <div className="form-group">
                <label>Start Time</label>
                <input type="text" value={sessionDetails.startTime} readOnly 
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    width: '133.5%',
                  }}/>
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="text" value={sessionDetails.endTime} readOnly 
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    width: '133.5%',
                  }}/>
              </div>
              <div className="form-group-link">
                <label
                 style={{
                 marginRight: '20px'
                }}
                >Meeting Link: </label>
                <a
                  href={sessionDetails.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginRight: '20px'
                   }}
                >
                  {sessionDetails.meetingLink}
                </a>
                <button className="copy-btn" onClick={handleCopyLink}>
                  Copy Link
                </button>
              </div>
              <div className="form-actionss">
                <button
                  className="delete-btn"
                  onClick={handleDeleteSession}
                  style={{
                    backgroundColor: 'crimson',
                  }}
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
      <div>
        {broadcastRequests.length === 0 ? (
          <p></p>
        ) : (
          <div className="broadcast-request-table">
             <h2>My Broadcast Requests</h2>
  <div style={{ position: 'relative', textAlign: 'right' }}>
           
             {broadcastRequests.length > 5 && (
              <button
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width:'100px',
                  textAlign: 'center',
                  justifyContent: 'center', 
                  marginRight:'25px',
                  marginBottom:'15px',
                  marginTop:'0px'
                }}
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'View Less' : 'View All'}
              </button>
            )}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Subtopic</th>
                  <th>Urgency</th>
                  <th>Programs</th>
                  <th style={{ width: '155px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRequests.map((request, index) => (
                  <tr key={index}>
                    <td>{request.topic}</td>
                    <td>{request.subtopic}</td>
                    <td>{request.urgency}</td>
                    <td>{request.programs?.join(', ')}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginBottom: '9px' }}>
                        <button className='request-resolve'
                          style={{
                            width: '100px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            textAlign: 'center',
                            justifyContent: 'center', alignItems: 'center',
                            backgroundColor: 'crimson',
                          }}
                          onClick={() => handleDeleteBroadcastRequest(request._id)}>
                          Delete
                        </button>
                      </div>
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
          <div className='broadcast-request-table'>
            <h2>Peer Learning Requests</h2>
             <div style={{ position: 'relative', textAlign: 'right' }}>
           
             {requests.length > 5 && (
              <button
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width:'100px',
                  textAlign: 'center',
                  justifyContent: 'center', 
                  marginRight:'25px',
                  marginBottom:'15px',
                  marginTop:'0px'
                }}
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'View Less' : 'View All'}
              </button>
            )}</div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Topic</th>
                  <th>Subtopic</th>
                  <th>Urgency</th>
                  <th style={{ width: '155px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRequest.map((req) => (
                  <tr key={req._id}>
                    <td>{req.name}</td>
                    <td>{req.email}</td>
                    <td>{req.topic}</td>
                    <td>{req.subtopic}</td>
                    <td>{req.urgency}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginBottom: '9px' }}>
                        <button 
className={`chat-student ${selectedStudentId === req.userId ? 'selected' : ''}`}

                        onClick={() => handleChatClick(req)}>
                          Go to Chat
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <div className="delete-confirmation-modal">
          <div className="delete-modal-content">
            <p>Are you sure you want to delete this request?</p>
            <div className="modal-buttons">
              <button 
              style={{
                backgroundColor: 'crimson',
              }}
              className="modal-button confirm" onClick={handleDeleteConfirm}>Yes</button>
              <button className="modal-button cancel" onClick={handleDeleteCancel}>No</button>
            </div>
          </div>
        </div>
      )}


    </>
  );
}

export default Home;
