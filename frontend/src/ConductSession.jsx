import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

const ConductSession = () => {
  const [meetingLink, setMeetingLink] = useState("");
  const [isJoinEnabled, setJoinEnabled] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [apiInstance, setApiInstance] = useState(null);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [rating, setRating] = useState(0);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadJitsiScript = () => {
      if (!window.JitsiMeetExternalAPI) {
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => console.log("Jitsi script loaded.");
        script.onerror = () => console.error("Failed to load Jitsi script.");
        document.body.appendChild(script);
      }
    };
    loadJitsiScript();
  }, []);

  const handleMeetingLinkChange = (e) => {
    const link = e.target.value;
    setMeetingLink(link);
    const jitsiLinkPattern = /^https:\/\/meet\.jit\.si\/([a-zA-Z0-9-_]+)$/;
    setJoinEnabled(jitsiLinkPattern.test(link));
  };

  const handleJoinSession = async () => {
    setIsJoining(true);
    const meetingID = meetingLink.split("https://meet.jit.si/")[1] || "";

    if (!meetingID) {
      alert("Invalid meeting link format.");
      setIsJoining(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3001/api/sessions/verify/${meetingID}`
      );

      if (response.data.success) {
        const domain = "meet.jit.si";
        const options = {
          roomName: meetingID,
          width: "100%",
          height: 600,
          parentNode: document.getElementById("jitsi-container"),
          configOverwrite: { disableDeepLinking: true },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            HIDE_INVITE_MORE_HEADER: true,
            TOOLBAR_BUTTONS: [
              "microphone", "camera", "hangup", "chat", "fullscreen",
              "raisehand", "tileview", "videobackgroundblur", "desktop",
            ],
          },
        };

        if (window.JitsiMeetExternalAPI) {
          const api = new window.JitsiMeetExternalAPI(domain, options);
          setApiInstance(api);

          api.addListener("readyToClose", () => {
            setIsJoining(false);
            setIsSessionEnded(true);
          });
        } else {
          alert("Failed to load Jitsi. Please refresh the page and try again.");
          setIsJoining(false);
        }
      } else {
        alert("Invalid meeting link or unauthorized access.");
        setIsJoining(false);
      }
    } catch (error) {
      console.error("Error verifying session:", error);
      alert("Error verifying the session. Please try again later.");
      setIsJoining(false);
    }
  };

  const handleEndSession = async () => {
    const confirmDelete = await Swal.fire({
      title: "End Session?",
      text: "Are you sure you want to end this session?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "End Session",
      cancelButtonText: "Cancel",
    });

    if (confirmDelete.isConfirmed) {
      if (apiInstance) {
        apiInstance.dispose();
        setIsSessionEnded(true);
        setIsJoining(false);
      }
    }
  };

  const handleRatingSubmit = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const sessionId = meetingLink?.replace("https://meet.jit.si/", "") || "";
  
      console.log("Token:", token);
      console.log("Full Meeting Link:", meetingLink);
      console.log("Session ID:", sessionId);
      console.log("Rating:", rating);
  
      await axios.post("http://localhost:3001/api/submits", {
        sessionId,
        rating,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      Swal.fire("Thank you!", "Your rating has been submitted.", "success");
      setIsRatingSubmitted(true);
      navigate("/");
    } catch (err) {
      console.error("Rating submission failed:", err);
      Swal.fire("Error", "Failed to submit rating. Please try again.", "error");
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
        disabled={isSessionEnded} // Disable input after session ends
      />
      <br />
      <button
        onClick={handleJoinSession}
        disabled={!isJoinEnabled || isJoining || isSessionEnded} // Disable button after session ends
        style={{
          padding: "10px 20px",
          backgroundColor: isJoinEnabled && !isJoining && !isSessionEnded ? "#48742F" : "gray",
          color: "white",
          cursor: isJoinEnabled && !isJoining && !isSessionEnded ? "pointer" : "not-allowed",
          border: "none",
          borderRadius: "5px",
        }}
      >
        {isJoining ? "Joining..." : "Join"}
      </button>

      {/* Rating section moved here directly below the Join button */}
      {isSessionEnded && !isRatingSubmitted && (
        <div style={{ marginTop: "20px" }}>
          <h3>Rate this session</h3>
          <Rating
            style={{ maxWidth: 250, margin: "auto" }}
            value={rating}
            onChange={setRating}
          />
          <button
            onClick={handleRatingSubmit}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Submit Rating
          </button>
        </div>
      )}

      {apiInstance && !isSessionEnded && (
        <button
          onClick={handleEndSession}
          style={{
            padding: "10px 20px",
            backgroundColor: "#FF4C4C",
            color: "white",
            cursor: "pointer",
            border: "none",
            borderRadius: "5px",
            marginTop: "20px",
            marginLeft: "10px",
          }}
        >
          End Session
        </button>
      )}

      <div id="jitsi-container" style={{ marginTop: "20px", width: "100%", height: "600px" }}></div>
    </div>
  );
};

export default ConductSession;
