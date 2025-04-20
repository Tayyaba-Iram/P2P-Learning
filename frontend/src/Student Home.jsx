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
import BroadcastRequest from './Broadcast Request';


const localizer = momentLocalizer(moment);

function Home() {
  const [agenda, setAgenda] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false); // For adding a new session
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

  return (
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
  );
}

export default Home;
