// src/components/ConductSession.jsx
import React, { useState } from 'react';
import ScreenShare from './ScreenShare';
import Whiteboard from './Whiteboard';
import './ConductSession.css';

const ConductSession = () => {
  const [meetingLink, setMeetingLink] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleJoinSession = () => {
    if (meetingLink) {
      setIsJoined(true);
    }
  };

  return (
    <div className="conduct-session">
      {!isJoined ? (
        <div className="join-section">
          <h2>Join Session</h2>
          <input
            type="text"
            placeholder="Enter Meeting Link"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
          />
          <button onClick={handleJoinSession}>Join</button>
        </div>
      ) : (
        <div className="meeting-controls">
          <h2>Meeting in Progress</h2>
          <ScreenShare />
          <Whiteboard />
        </div>
      )}
    </div>
  );
};

export default ConductSession;
