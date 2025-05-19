import React, { useState, useEffect, useRef } from "react";
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
  const [isSessionStarted, setIsSessionStarted] = useState(false);

  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);

  // Helper: extract meeting ID
  const extractMeetingID = (link) => link?.split("https://meet.jit.si/")[1] || "";

  // Load Jitsi script
  useEffect(() => {
    const loadJitsiScript = () => {
      if (!window.JitsiMeetExternalAPI) {
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => console.log("Jitsi script loaded.");
        script.onerror = () =>
          Swal.fire("Error", "Failed to load Jitsi. Please refresh the page and try again.", "error");
        document.body.appendChild(script);
      }
    };
    loadJitsiScript();
  }, []);

  // Initialize Jitsi API when session starts
  useEffect(() => {
    if (isSessionStarted && window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
      const domain = "meet.jit.si";
      const roomName = extractMeetingID(meetingLink);
      const options = {
        roomName,
        width: "100%",
        height: 600,
        parentNode: jitsiContainerRef.current,
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

      const api = new window.JitsiMeetExternalAPI(domain, options);
      setApiInstance(api);
    }
  }, [isSessionStarted, meetingLink]);

  // Poll to check if session has expired
  useEffect(() => {
    if (!isSessionStarted) return;

    const interval = setInterval(async () => {
      const meetingID = extractMeetingID(meetingLink);
      try {
        const response = await axios.get(`http://localhost:3001/api/sessions/verify/${meetingID}`);
        if (response.data.expired) {
          Swal.fire({
            title: "Session Ended",
            text: "Session time is over.",
            icon: "info",
            confirmButtonText: "OK",
            customClass: { confirmButton: "swal-confirm-btn-ok",
               icon: "swal-info-icon",
             },
          }).then(() => {
            if (apiInstance) {
              apiInstance.dispose();
              setApiInstance(null);
            }
            setIsSessionEnded(true);
            setIsSessionStarted(false);
          });
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isSessionStarted, meetingLink, apiInstance]);

  const handleMeetingLinkChange = (e) => {
    const link = e.target.value;
    setMeetingLink(link);
    const validPattern = /^https:\/\/meet\.jit\.si\/([a-zA-Z0-9-_]+)$/;
    setJoinEnabled(validPattern.test(link));
  };

  const handleJoinSession = async () => {
    setIsJoining(true);
    const meetingID = extractMeetingID(meetingLink);
    if (!meetingID) {
      setIsJoining(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:3001/api/sessions/verify/${meetingID}`);
      if (res.data.success) {
        setIsSessionStarted(true);
      } else if (res.data.expired) {
        Swal.fire({
          title: "Session Ended",
          text: "This session has already expired.",
          icon: "info",
          confirmButtonText: "OK",
          customClass: { confirmButton: "swal-confirm-btn-ok",
             icon: "swal-info-icon",
           },
        }).then(() => {
          setIsJoining(false);
          setIsSessionEnded(true);
          navigate("/");
        });
      } else {
        Swal.fire("Not Found", "Session not found.", "error");
        setIsJoining(false);
      }
    } catch (err) {
      console.error("Session verify error:", err);
      Swal.fire("Error", "Failed to verify session. Please try again.", "error");
      setIsJoining(false);
    }
  };

  const handleEndSession = async () => {
    const confirm = await Swal.fire({
      title: "End Session?",
      text: "Are you sure you want to end this session?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "End Session",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
        icon: "swal-info-icon",
      },
      buttonsStyling: false,
    });

    if (confirm.isConfirmed) {
      if (apiInstance) {
        apiInstance.dispose();
        setApiInstance(null);
      }
      setIsSessionEnded(true);
      setIsSessionStarted(false);
    }
  };

  const handleRatingSubmit = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const sessionId = extractMeetingID(meetingLink);

      await axios.post("http://localhost:3001/api/submits", {
        sessionId,
        rating,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        title: "Thank you!",
        text: "Your rating has been submitted.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: { confirmButton: "swal-confirm-btn-ok" },
        buttonsStyling: false,
      }).then(() => {
        setIsRatingSubmitted(true);
        navigate("/");
      });

    } catch (err) {
      console.error("Rating submit failed:", err);
      Swal.fire("Error", "Failed to submit rating. Please try again.", "error");
    }
  };

  // Custom SweetAlert2 styles
  const applyCustomStyles = () => {
    const style = document.createElement("style");
    style.innerHTML = `
      .swal-confirm-btn-ok {
        background-color: #48742F !important;
        color: white !important;
        padding: 10px 20px !important;
        border-radius: 5px !important;
        font-size: 16px !important;
        width: 120px !important;
        cursor: pointer !important;
      }
      .swal-cancel-btn {
        background-color: #48742F !important;
        color: white !important;
        padding: 8px 16px !important;
        border-radius: 5px !important;
        cursor: pointer !important;
        width: 150px !important;
      }
      .swal-confirm-btn {
        background-color: #FF4C4C !important;
        color: white !important;
        padding: 8px 16px !important;
        border-radius: 5px !important;
        cursor: pointer !important;
        width: 150px !important;
      }
      .swal-info-icon {
        color: #48742F !important;
        border: 3px solid #48742F !important;
      }
    `;
    document.head.appendChild(style);
  };

  useEffect(() => {
    applyCustomStyles();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      {!isSessionStarted ? (
        <>
          <h2 style={{ marginBottom: "10px" }}>Conduct Session</h2>
          <input
            type="text"
            value={meetingLink}
            onChange={handleMeetingLinkChange}
            placeholder="Enter meeting link"
            style={{
              width: "80%",
              maxWidth: "300px",
              marginBottom: "20px",
              marginTop: "13px",
            }}
            disabled={isSessionEnded}
          />
          <br />
          <button
            onClick={handleJoinSession}
            disabled={!isJoinEnabled || isJoining || isSessionEnded}
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
        </>
      ) : (
        <div style={{ position: "relative" }}>
          <div
            ref={jitsiContainerRef}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          ></div>

          <button
            onClick={handleEndSession}
            style={{
              padding: "10px 20px",
              backgroundColor: "#FF4C4C",
              color: "white",
              cursor: "pointer",
              border: "none",
              borderRadius: "5px",
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: 10,
            }}
          >
            End Session
          </button>
        </div>
      )}

      {isSessionEnded && !isRatingSubmitted && (
        <div style={{ marginTop: "10px" }}>
          <h2 style={{ marginBottom: "5px" }}>Rate this session</h2>
          <Rating
            style={{ maxWidth: 250, margin: "auto", marginTop: "20px" }}
            value={rating}
            onChange={setRating}
          />
          <button
            onClick={handleRatingSubmit}
            style={{
              marginTop: "25px",
              padding: "10px 20px",
              backgroundColor: "#48742F",
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
    </div>
  );
};

export default ConductSession;
