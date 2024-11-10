import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ConductSession = () => {
  const [meetingLink, setMeetingLink] = useState("");
  const [isJoinEnabled, setJoinEnabled] = useState(false);
  const navigate = useNavigate();

  const handleMeetingLinkChange = (e) => {
    const link = e.target.value;
    setMeetingLink(link);

    // Validate link format for Jitsi
    const jitsiLinkPattern = /^https:\/\/meet\.jit\.si\/[a-zA-Z0-9-_]+$/;
    setJoinEnabled(jitsiLinkPattern.test(link));
  };

  const handleJoinSession = async () => {
    const meetingID = encodeURIComponent(meetingLink.split("https://meet.jit.si/")[1] || "");

    try {
      const response = await axios.get(`http://localhost:3001/api/sessions/verify/${meetingID}`);

      if (response.data.success) {
        // Embed the Jitsi meeting without a login prompt
        const domain = "meet.jit.si";
        const options = {
          roomName: meetingID,
          width: "100%",
          height: 600,
          parentNode: document.getElementById("jitsi-container"),
          configOverwrite: {
            disableDeepLinking: true, // Prevent Jitsi from trying to open in its own app
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            HIDE_INVITE_MORE_HEADER: true, // Hide invite options
            TOOLBAR_BUTTONS: [
              "microphone", "camera", "hangup", "chat", "fullscreen", "raisehand",
              "tileview", "videobackgroundblur" // Customize buttons as needed
            ]
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);

        // Handle meeting end to redirect to the main page
        api.addListener("readyToClose", () => {
          navigate("/"); // Redirect to homepage when the meeting ends
        });
      } else {
        alert("Invalid meeting link. Please enter a valid, authorized link.");
      }
    } catch (error) {
      console.error("Error verifying session:", error);
      alert("Error verifying the session. Please try again later.");
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
      <div id="jitsi-container" style={{ marginTop: "20px", width: "100%", height: "600px" }}></div>
    </div>
  );
};

export default ConductSession;
