import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Student Home.css'; // Updated to ensure styles are combined correctly

function Home() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [sessionDetails, setSessionDetails] = useState({
    topic: '',
    startTime: '',
    endTime: '',
    date: new Date(),
  });
  const [agenda, setAgenda] = useState([]);
  const [copiedSessionId, setCopiedSessionId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:3001/api/student-dashboard', { withCredentials: true })
      .then((response) => setUserData(response.data.user))
      .catch((err) => setError(err.response ? err.response.data.error : 'An error occurred'));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/api/student-dashboard', { withCredentials: true })
      .then(response => {
        setUserData(response.data.user);
      })
      .catch(err => {
        setError(err.response ? err.response.data.error : 'An error occurred');
      });
  }, []);

  const handleInputChange = (e) => {
    setSessionDetails({ ...sessionDetails, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setSessionDetails({ ...sessionDetails, date });
  };

  const handleAddSession = async () => {
    const { topic, startTime, endTime } = sessionDetails;
    if (!topic || !startTime || !endTime) {
      alert('Please fill in all required fields.');
      return;
    }

    if (endTime <= startTime) {
      alert('End time must be after the start time.');
      return;
    }

    const newSession = {
      ...sessionDetails,
      date: sessionDetails.date.toISOString(),
      meetingLink: `https://meet.jit.si/${Math.floor(Math.random() * 10000)}`,
    };

    try {
      const response = await axios.post('http://localhost:3001/api/sessions', newSession);
      setAgenda((prevAgenda) => [...prevAgenda, response.data]);
      setModalOpen(false);
      setSessionDetails({ topic: '', startTime: '', endTime: '', date: new Date() });
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Error saving session. Please try again.');
    }
  };

  const handleCopy = (sessionId, session) => {
    const sessionText = `Topic: ${session.topic}\nDate: ${new Date(session.date).toDateString()}\nStart Time: ${formatTime(session.startTime)}\nEnd Time: ${formatTime(session.endTime)}\nMeeting Link: ${session.meetingLink}`;
    navigator.clipboard.writeText(sessionText);
    setCopiedSessionId(sessionId);
    setTimeout(() => setCopiedSessionId(null), 2000);
  };

  const handleCancel = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this schedule session?')) {
      try {
        await axios.delete(`http://localhost:3001/api/sessions/${sessionId}`);
        setAgenda((prevAgenda) => prevAgenda.filter((session) => session._id !== sessionId));
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('Error canceling session. Please try again.');
      }
    }
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const formattedHour = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const toggleShowAll = () => {
    setShowAll((prevState) => !prevState);
  };

  const displayedAgenda = showAll ? agenda : agenda.slice(0, 5);

  return (
    <div className="content">
      <div className="banner">
        <div className="text-container">
          <h1>Welcome to Peer to Peer Learning!</h1>
        </div>
      </div>

      {userData ? (
        <div className="user-info">
          <h2>Welcome: {userData.name}!</h2>
          <p>Email: {userData.email}</p>
        </div>
      ) : (
        <div className="error-message">
          {error ? <p>{error}</p> : <p>Loading user data...</p>}
        </div>
      )}
<Link to="/studentupdateprofile">
        <button className="register-button">Profile Update</button>
      </Link>
      <Link to="/chat">
        <button className="register-button">Go to Chat</button>
      </Link>
    </div>
  );
}

export default Home;
