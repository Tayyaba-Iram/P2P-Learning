import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import axios from 'axios';
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
  const [meetingLink, setMeetingLink] = useState('');
  const [copyText, setCopyText] = useState("Mark as Copied");

  // Fetch saved sessions on component load using axios.get
  useEffect(() => {
    axios.get('http://localhost:3001/api/sessions')
      .then(response => setAgenda(response.data))
      .catch(error => console.error('Error fetching sessions:', error));
  }, []);

  const handleInputChange = (e) => {
    setSessionDetails({ ...sessionDetails, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setSessionDetails({ ...sessionDetails, date });
  };

  const handleAddSession = () => {
    if (!sessionDetails.topic || !sessionDetails.startTime || !sessionDetails.endTime) {
      alert("Please fill in all required fields.");
      return;
    }

    const newSession = {
      ...sessionDetails,
      date: sessionDetails.date.toISOString(),
      meetingLink: `https://meetinglink.com/${Math.floor(Math.random() * 10000)}`
    };

    axios.post('http://localhost:3001/api/addsessions', newSession)
      .then(response => {
        setAgenda(prevAgenda => [...prevAgenda, response.data]); // Add new session
        setMeetingLink(response.data.meetingLink);
        setModalOpen(false); // Close the modal
      })
      .catch(error => {
        console.error('Error saving session:', error);
        alert("Error saving session. Please try again.");
      });
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  const handleCopy = () => {
    const sessionText = `Topic: ${sessionDetails.topic}\nDate: ${sessionDetails.date.toDateString()}\nStart Time: ${sessionDetails.startTime}\nEnd Time: ${sessionDetails.endTime}\nMeeting Link: ${meetingLink}`;
    navigator.clipboard.writeText(sessionText);
    setCopyText("✔️ Copied!");
    setTimeout(() => setCopyText("Mark as Copied"), 2000);
  };

  const handleClearAgenda = () => {
    setAgenda([]);
    setMeetingLink('');
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
            <h2 className="page-title">New Session Details</h2>
            <div className="form-step">
              <h3>Step 1: Enter Topic Name</h3>
              <label>Topic:</label>
              <input
                type="text"
                name="topic"
                value={sessionDetails.topic}
                onChange={handleInputChange}
                required
                placeholder="Enter the session topic"
              />
            </div>
            <div className="form-step">
              <h3>Step 2: Select Date</h3>
              <label>Date:</label>
              <DatePicker
                selected={sessionDetails.date}
                onChange={handleDateChange}
                className="datepicker"
                required
              />
            </div>
            <div className="form-step">
              <h3>Step 3: Set Time</h3>
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
            </div>
            <div className="form-actions">
              <button className="submit-btn" onClick={handleAddSession}>
                Add Session
              </button>
              <button className="clear-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {agenda.length > 0 && (
        <div className="agenda">
          <h3>Session Agenda</h3>
          <ul>
            {agenda.map((session, index) => (
              <li key={index}>
                <em>Topic:</em> {session.topic} <br />
                <em>Date:</em> {new Date(session.date).toDateString()} <br />
                <em>Start Time:</em> {session.startTime} <br />
                <em>End Time:</em> {session.endTime} <br />
              </li>
            ))}
          </ul>
          <div className="meeting-link">
            <em>Meeting Link:</em> <a href={meetingLink} target="_blank" rel="noopener noreferrer">{meetingLink}</a>
          </div>
          <div className="action-buttons">
            <button className="copy-btn" onClick={handleCopy}>
              {copyText}
            </button>
            <button className="clear-btn" onClick={handleClearAgenda}>
              Clear Agenda
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSession;
