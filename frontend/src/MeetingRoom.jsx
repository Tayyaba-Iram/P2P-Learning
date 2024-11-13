import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./MeetingRoom.css"; // Ensure this contains necessary styles for the meeting room

const MeetingRoom = () => {
  const location = useLocation();
  const meetingLink = location.state?.meetingLink || "DefaultMeetingRoom";  // Default room if no link provided

  useEffect(() => {
    const loadJitsiAPI = () => {
      if (window.JitsiMeetExternalAPI) {
        const domain = "meet.jit.si";  // Jitsi server domain
        const options = {
          roomName: meetingLink,
          width: "100%",
          height: "100%",
          parentNode: document.getElementById("jitsi-container"),
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            startAudioOnly: true,
            disableModeratorIndicator: true,
            disableDeepLinking: true,
            p2p: { enabled: true },
            requireDisplayName: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone", "camera", "fullscreen", "hangup", "chat", "tileview"
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            HIDE_INVITE_MORE_HEADER: true,
          },
        };

        try {
          const api = new window.JitsiMeetExternalAPI(domain, options);

          api.addEventListener("videoConferenceJoined", () => {
            console.log("Successfully joined the meeting!");
          });

          api.addEventListener("videoConferenceLeft", () => {
            console.log("Left the meeting.");
          });

          return api;
        } catch (error) {
          console.error("Error initializing Jitsi API:", error);
        }
      } else {
        console.error("Jitsi Meet API script is not loaded.");
        alert("Failed to load Jitsi Meet API. Please try again later.");
      }
    };

    const apiInstance = loadJitsiAPI();

    // Cleanup on unmount
    return () => {
      if (apiInstance) {
        apiInstance.dispose();
      }
    };
  }, [meetingLink]);

  return (
    <div className="meeting-room">
      <div id="jitsi-container" className="jitsi-container"></div>
    </div>
  );
};

export default MeetingRoom;
