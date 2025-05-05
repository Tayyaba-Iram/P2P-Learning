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
  const jitsiContainerRef = useRef(null); // Use ref for the Jitsi container

  useEffect(() => {
    const loadJitsiScript = () => {
      if (!window.JitsiMeetExternalAPI) {
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => {
          console.log("Jitsi script loaded.");
          initializeJitsi(); // Call initializeJitsi after the script is loaded
        };
        script.onerror = () => {
          console.error("Failed to load Jitsi script.");
          Swal.fire("Error", "Failed to load Jitsi. Please refresh the page and try again.", "error");
        };
        document.body.appendChild(script);
      } else {
        // If Jitsi is already loaded, initialize it
        initializeJitsi();
      }
    };

    const initializeJitsi = () => {
      if (jitsiContainerRef.current) {
        console.log("Jitsi initialized.");
      } else {
        console.log("Jitsi container not available yet.");
      }
    };

    loadJitsiScript();
  }, []); // Empty dependency array to load the script only once when the component mounts

  useEffect(() => {
    if (isSessionStarted && window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
      initializeJitsiAPI();
    }
  }, [isSessionStarted]); // Re-run when session starts

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
      setIsJoining(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3001/api/sessions/verify/${meetingID}`
      );

      if (response.data.success) {
        setIsSessionStarted(true);
      } else {
        setIsJoining(false);
      }
    } catch (error) {
      console.error("Error verifying session:", error);
      setIsJoining(false);
    }
  };

  const initializeJitsiAPI = () => {
    const domain = "meet.jit.si";
    const options = {
      roomName: meetingLink.split("https://meet.jit.si/")[1],
      width: "100%",
      height: 600,
      parentNode: jitsiContainerRef.current, // Ensure container is available
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

    api.addListener("readyToClose", () => {
      setIsJoining(false);
      setIsSessionEnded(true);
      setIsSessionStarted(false);
    });
  };

  const handleEndSession = async () => {
    const confirmDelete = await Swal.fire({
      title: "End Session?",
      text: "Are you sure you want to end this session?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "End Session",
  cancelButtonText: "Cancel",
  customClass: {
    icon: "swal-info-icon",
    confirmButton: 'swal-confirm-btn',
    cancelButton: 'swal-cancel-btn'
  },
  buttonsStyling: false
    });

    if (confirmDelete.isConfirmed) {
      if (apiInstance) {
        apiInstance.dispose();
        setIsSessionEnded(true);
        setIsSessionStarted(false);
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
      
          Swal.fire({
            title: "Thank you!",
            text: "Your rating has been submitted.",
            icon: "success",
            confirmButtonText: "OK",
            customClass: {
              confirmButton: "swal-confirm-btn-ok",
            },
            buttonsStyling: false, 
          }).then(() => {
            setIsRatingSubmitted(true);
            navigate("/");
          });
      
        } catch (err) {
          console.error("Rating submission failed:", err);
          Swal.fire("Error", "Failed to submit rating. Please try again.", "error");
        }
      };
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
      
      // Call this function when the component is ready or before opening SweetAlert
      applyCustomStyles();
      

  return (
    <div style={{ textAlign: "center" }}>
      {!isSessionStarted ? (
        <>
          <h2 className="conduct-session" style={{ marginBottom: "10px" }}>Conduct Session</h2>
<input
  type="text"
  value={meetingLink}
  onChange={handleMeetingLinkChange}
  placeholder="Enter meeting link"
  style={{
    width: "80%",
    maxWidth: "300px",
    marginBottom: "20px",
    marginTop: "13px",  // Reduced space above the input
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
              padding: 0,
              margin: 0,
              position: "absolute", /* Ensure absolute positioning to fill the screen */
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
            }}
          >
            End Session
          </button>
        </div>
      )}

      {isSessionEnded && !isRatingSubmitted && (
       <div style={{ marginTop: "10px" }}> {/* Reduce marginTop here */}
       <h2 style={{ marginBottom: "5px" }}>Rate this session</h2> {/* Reduce margin-bottom here */}
       <Rating
         style={{
           maxWidth: 250,
           margin: "auto",
           marginTop: "20px",  // Reduced space above the rating component
         }}
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
