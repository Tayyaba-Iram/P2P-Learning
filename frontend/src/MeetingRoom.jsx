import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./MeetingRoom.css";

const MeetingRoom = () => {
  const location = useLocation();
  const meetingLink = location.state?.meetingLink || "DefaultMeetingRoom";

  useEffect(() => {
    const loadJitsiAPI = () => {
      if (window.JitsiMeetExternalAPI) {
        const domain = "meet.jit.si"; // You can use other Jitsi servers if needed
        const options = {
          roomName: meetingLink,
          width: "100%",
          height: "100%",
          parentNode: document.getElementById("jitsi-container"),
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            enableWelcomePage: false,
            prejoinPageEnabled: false, // Skips the pre-join page
            startAudioOnly: true,
            disableModeratorIndicator: true, // Attempt to disable moderator role
            disableDeepLinking: true, // Avoids redirecting to the Jitsi app on mobile
            p2p: {
              enabled: true // Peer-to-peer mode for fewer restrictions
            },
            requireDisplayName: false, // Bypasses the need for a display name
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone", "camera", "fullscreen", "hangup", "chat", "tileview"
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            HIDE_INVITE_MORE_HEADER: true,
          }
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
