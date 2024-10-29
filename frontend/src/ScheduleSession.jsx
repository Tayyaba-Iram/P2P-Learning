import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
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

  const handleInputChange = (e) => {
    setSessionDetails({sessionDetails, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setSessionDetails({sessionDetails, date });
  };

  const handleAddSession = () => {
    if (!sessionDetails.topic || !sessionDetails.startTime || !sessionDetails.endTime) {
      alert("Please fill in all required fields.");
      return;
    }
    setAgenda([...agenda, sessionDetails]);
    setMeetingLink(`https://meetinglink.com/${Math.floor(Math.random() * 10000)}`);
    setModalOpen(false);
  };

  const handleCancel = () => {
    setModalOpen(false);
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
            <h2>New Session Details</h2>
            
            {/* Step 1: Enter Topic Name */}
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

            {/* Step 2: Select Date */}
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

            {/* Step 3: Set Start and End Time */}
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

            {/* Action Buttons */}
            <div className="form-actions">
              <button className="submit-btn" onClick={handleAddSession}>
                Add Session
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
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
                <strong>Topic:</strong> {session.topic} <br />
                <strong>Date:</strong> {session.date.toDateString()} <br />
                <strong>Start Time:</strong> {session.startTime} <br />
                <strong>End Time:</strong> {session.endTime} <br />
              </li>
            ))}
          </ul>
          <div className="meeting-link">
            <strong>Meeting Link:</strong> <a href={meetingLink} target="_blank" rel="noopener noreferrer">{meetingLink}</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSession;
