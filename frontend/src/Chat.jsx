import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Chat.css';

function Chat() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);
  const endOfMessages = useRef(null);

  // Fetch the logged-in user details
  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('No token found. User not authenticated.');
        return;
      }
      try {
        const response = await axios.get('http://localhost:3001/api/getUserDetails', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('User data fetched:', response.data);
        if (response.data && response.data._id) {
          setUser(response.data);
        } else {
          console.error('User data is missing _id:', response.data);
        }
      } catch (err) {
        console.error('Error fetching user:', err.response?.data || err.message);
      }
    };

    fetchUser();
  }, []);

  // Fetch all students except the logged-in user
  useEffect(() => {
    const fetchStudents = async () => {
      if (user) {
        try {
          const { data } = await axios.get('http://localhost:3001/api/verifiedStudents', { withCredentials: true });
          setStudents(data.filter(student => student._id !== user._id));
        } catch (err) {
          console.error('Error fetching students:', err);
        }
      }
    };
    fetchStudents();
  }, [user]);

  // Initialize socket connection and handle incoming messages
  useEffect(() => {
    // Check if socket is already connected to avoid re-connecting
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3001');

      socketRef.current.on('connect', () => {
        console.log(`Connected to socket server. Socket ID: ${socketRef.current.id}`);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });
    }

    // Listen for incoming messages
    const handleIncomingMessage = (message) => {
      console.log('Received message:', message);
      setMessages(prevMessages => [...prevMessages, message]);
    };

    // Add listener if it's not already added
    socketRef.current?.on('newMessage', handleIncomingMessage);

    // Cleanup function to remove listeners and disconnect socket on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage', handleIncomingMessage);
        console.log('Removed socket listeners');
      }
    };
  }, []);

  // Fetch chat history with a specific student
  const fetchChatHistory = async (student) => {
    try {
      const { data } = await axios.get(`http://localhost:3001/api/chat/${student._id}`, {
        params: { userId: user._id },
        withCredentials: true,
      });
      setMessages(data);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  // Start a new chat with a selected student
  const handleStartChat = (student) => {
    if (!user || !student) return;

    setActiveStudent(student);
    setMessages([]);

    const senderId = user._id;
    const receiverId = student._id;
    const roomName = [senderId, receiverId].sort().join('-');

    // Check if already joined the room before trying to join again
    if (socketRef.current) {
      socketRef.current.emit('joinRoom', roomName, (err) => {
        if (err) console.error('Error joining room:', err);
        else console.log(`Joined room: ${roomName}`);
      });
    }

    fetchChatHistory(student);
  };

  const [isSending, setIsSending] = useState(false);
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeStudent || !user) {
      console.error('Missing information');
      return;
    }

    const senderId = user._id;
    const receiverId = activeStudent._id;
    const roomName = [senderId, receiverId].sort().join('-');
    const msg = { senderId, receiverId, text: newMessage };

    console.log('Sending message:', msg);

    // Emit the message to the WebSocket
    socketRef.current?.emit('newMessage', { room: roomName, message: msg });

    // Clear the input field
    setNewMessage('');
  };

  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    if (endOfMessages.current) {
      endOfMessages.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="Chat-container">
      <div className="sidebar">
        {students.map(student => (
          <div key={student._id} onClick={() => handleStartChat(student)}>
            {student.name}
          </div>
        ))}
      </div>

      {activeStudent && (
        <div className="chat-box">
          <h2>Chat with {activeStudent.name}</h2>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.senderId === user._id ? 'sent' : 'received'}`}>
                <strong>{msg.senderId === user._id ? 'You' : activeStudent.name}</strong>: {msg.text}
              </div>
            ))}
            <div ref={endOfMessages}></div>
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage} disabled={isSending}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
