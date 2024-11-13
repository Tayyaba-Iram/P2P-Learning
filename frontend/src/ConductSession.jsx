import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // This is used for navigation

const ConductSession = () => {
  const [meetingLink, setMeetingLink] = useState("");
  const [isJoinEnabled, setJoinEnabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadJitsiScript = () => {
      if (!window.JitsiMeetExternalAPI) {
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        document.body.appendChild(script);
        script.onload = () => console.log("Jitsi script loaded.");
        script.onerror = () => console.error("Failed to load Jitsi script.");
      }
    };
    loadJitsiScript();
  }, []);

  const handleMeetingLinkChange = (e) => {
    const link = e.target.value;
    setMeetingLink(link);

    // Validate link format for Jitsi
    const jitsiLinkPattern = /^https:\/\/meet\.jit\.si\/([a-zA-Z0-9-_]+)$/;
    const isValid = jitsiLinkPattern.test(link);
    setJoinEnabled(isValid);
  };

  const handleJoinSession = async () => {
    const meetingID = meetingLink.split("https://meet.jit.si/")[1] || "";

    if (!meetingID) {
      alert("Invalid meeting link format.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("No token found. Please log in first.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3001/api/sessions/verify/${meetingID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const domain = "meet.jit.si";
        const options = {
          roomName: meetingID,
          width: "100%",
          height: 600,
          parentNode: document.getElementById("jitsi-container"),
          configOverwrite: {
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            HIDE_INVITE_MORE_HEADER: true,
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "hangup",
              "chat",
              "fullscreen",
              "raisehand",
              "tileview",
              "videobackgroundblur",
            ],
          },
          userInfo: {
            email: "user@example.com", 
            displayName: "User", 
          },
          jwt: token, 
        };

        if (window.JitsiMeetExternalAPI) {
          const api = new window.JitsiMeetExternalAPI(domain, options);

          api.addListener("readyToClose", () => {
            navigate("/"); // Redirect to homepage when the meeting ends
          });
        } else {
          console.error("JitsiMeetExternalAPI not loaded.");
          alert("Failed to load Jitsi. Please refresh the page and try again.");
        }
      } else {
        alert("Invalid meeting link or unauthorized access.");
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
      <div
        id="jitsi-container"
        style={{ marginTop: "20px", width: "100%", height: "600px" }}
      ></div>
    </div>
  );
};

export default ConductSession;
