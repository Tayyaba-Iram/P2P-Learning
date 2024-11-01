// src/components/ScreenShare.jsx
import React, { useState } from 'react';

const ScreenShare = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState(null);

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      setStream(screenStream);
      setIsSharing(true);
    } catch (error) {
      console.error('Screen sharing failed:', error);
    }
  };

  const stopScreenShare = () => {
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
    setIsSharing(false);
  };

  return (
    <div className="screen-share">
      <h3>Screen Share</h3>
      {!isSharing ? (
        <button onClick={startScreenShare}>Start Screen Share</button>
      ) : (
        <button onClick={stopScreenShare}>Stop Screen Share</button>
      )}
    </div>
  );
};

export default ScreenShare;
