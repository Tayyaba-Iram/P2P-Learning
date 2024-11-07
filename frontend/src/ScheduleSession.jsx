import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ScheduleSession.css';

const ScheduleSession = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [sessionDetails, setSessionDetails] = useState({
    topic: '',
    startTime: '',
    endTime: '',
    date: new Date(),
  });
  const [agenda, setAgenda] = useState([]);
  const [copiedSessionId, setCopiedSessionId] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/sessions');
        const updatedSessions = response.data.map(session => ({
          ...session,
          status: session.status || 'Pending',
        }));
        setAgenda(updatedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };
    fetchSessions();
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
      alert("Please fill in all required fields.");
      return;
    }

    const newSession = {
      ...sessionDetails,
      date: sessionDetails.date.toISOString(),
      meetingLink: `https://meet.jit.si/${Math.floor(Math.random() * 10000)}`,  // Correct way to generate the link
      status: 'Pending',
    };
    

    try {
      const response = await axios.post('http://localhost:3001/api/sessions', newSession);
      setAgenda(prevAgenda => [...prevAgenda, response.data]);
      setModalOpen(false);
      setSessionDetails({ topic: '', startTime: '', endTime: '', date: new Date() });
    } catch (error) {
      console.error('Error saving session:', error);
      alert("Error saving session. Please try again.");
    }
  };

  const handleCopy = (sessionId, session) => {
    const sessionText = `Topic: ${session.topic}\nDate: ${new Date(session.date).toDateString()}\nStart Time: ${formatTime(session.startTime)}\nEnd Time: ${formatTime(session.endTime)}\nMeeting Link: ${session.meetingLink}`;
    
    navigator.clipboard.writeText(sessionText);
    
    setCopiedSessionId(sessionId);

    setTimeout(() => {
      setCopiedSessionId(null);
    }, 2000);
  };

  const handleCancel = async (sessionId) => {
    try {
      await axios.delete(`http://localhost:3001/api/sessions/${sessionId}`);
      setAgenda(prevAgenda => prevAgenda.filter((session) => session._id !== sessionId));
      alert('Session deleted');
    } catch (error) {
      console.error('Error deleting session:', error);
      alert("Error canceling session. Please try again.");
    }
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const formattedHour = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${formattedHour}:${minute} ${ampm}`;
  };

  return (
    <div className="schedule-session-container">
      <h1 className="page-title">Schedule a New Session</h1>
      <button className="schedule-btn" onClick={() => setModalOpen(true)}>
        Schedule Session
      </button>

      {isModalOpen && (
        <div className="form-backdrop">
          <div className="schedule-form">
            <h2 className="form-title">New Session Details</h2>
            <label className='topic'>Topic:</label>
            <input
              type="text"
              name="topic"
              value={sessionDetails.topic}
              onChange={handleInputChange}
              placeholder="Enter the session topic"
              required
            />
            <label className='date'>Date:</label>
            <DatePicker
              selected={sessionDetails.date}
              onChange={handleDateChange}
              className="datepicker"
              required
            />
            <label>Start Time:</label>
            <input
              type="time"
              name="startTime"
              value={sessionDetails.startTime}
              onChange={handleInputChange}
              required
            />
            <label>End Time:</label>
            <input
              type="time"
              name="endTime"
              value={sessionDetails.endTime}
              onChange={handleInputChange}
              required
            />
            <div className="form-actions">
              <button className="submit-btn" onClick={handleAddSession}>Add Session</button>
              <button className="clear-btn" onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {agenda.length > 0 && (
        <div className="agenda">
          <h3>Session Agenda</h3>
          <table className="agenda-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Meeting Link</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agenda.map((session) => (
                <tr key={session._id} className={session.status === 'Canceled' ? 'canceled-row' : ''}>
                  <td>{session.topic}</td>
                  <td>{new Date(session.date).toDateString()}</td>
                  <td>{formatTime(session.startTime)}</td>
                  <td>{formatTime(session.endTime)}</td>
                  <td>
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                      {session.meetingLink}
                    </a>
                  </td>
                  <td>{session.status}</td>
                  <td>
                    {session.status !== 'Canceled' && (
                      <button onClick={() => handleCopy(session._id, session)}>
                        {copiedSessionId === session._id ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                    <button onClick={() => handleCancel(session._id)}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleSession;
