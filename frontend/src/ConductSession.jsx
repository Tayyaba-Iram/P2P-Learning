// src/components/ConductSession.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ConductSession = () => {
  const [meetingLink, setMeetingLink] = useState("");
  const [isJoinEnabled, setJoinEnabled] = useState(false);
  const navigate = useNavigate();

  const handleMeetingLinkChange = (e) => {
    const link = e.target.value;
    setMeetingLink(link);

    // Check if link matches Jitsi format (e.g., "https://meet.jit.si/roomname")
    const jitsiLinkPattern = /^https:\/\/meet\.jit\.si\/[a-zA-Z0-9-_]+$/;
    setJoinEnabled(jitsiLinkPattern.test(link));
  };

  const handleJoinSession = () => {
    // Extract the room name from the link
    const roomName = meetingLink.split("https://meet.jit.si/")[1];
    
    if (roomName) {
      // Pass the room name to the MeetingRoom component through state
      navigate("/meeting-room", { state: { meetingLink: roomName } });
    } else {
      alert("Invalid meeting link. Please enter a valid Jitsi link.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Conduct Session</h2>
      <input
        type="text"
        value={meetingLink}
        onChange={handleMeetingLinkChange}
        placeholder="Enter meeting link"
        style={{
          padding: "10px",
          width: "80%",
          maxWidth: "300px",
          marginBottom: "20px",
        }}
      />
      <br />
      <button
        onClick={handleJoinSession}
        disabled={!isJoinEnabled}
        style={{
          padding: "10px 20px",
          backgroundColor: isJoinEnabled ? "blue" : "gray",
          color: "white",
          cursor: isJoinEnabled ? "pointer" : "not-allowed",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Join
      </button>
    </div>
  );
};

export default ConductSession;
