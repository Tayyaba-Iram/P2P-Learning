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
    const { name, value } = e.target;
    setSessionDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setSessionDetails((prevDetails) => ({
      ...prevDetails,
      date: date,
    }));
  };

  const handleAddSession = () => {
    const { topic, startTime, endTime, date } = sessionDetails;

    if (!topic || !startTime || !endTime || !date) {
      alert("Please fill in all required fields.");
      return;
    }

    setAgenda((prevAgenda) => [...prevAgenda, sessionDetails]);
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
                <em>Your Session Topic:</em> {session.topic} <br />
                <em>Your Selected Date:</em> {session.date.toDateString()} <br />
                <em>Session Start Time:</em> {session.startTime} <br />
                <em>Session End Time:</em> {session.endTime} <br />
              </li>
            ))}
          </ul>
          <div className="meeting-link">
            <em>Meeting Link:</em> <a href={meetingLink} target="_blank" rel="noopener noreferrer">{meetingLink}</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSession;
