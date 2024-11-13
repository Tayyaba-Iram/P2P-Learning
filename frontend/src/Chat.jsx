import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './Chat.css';

const socket = io('http://localhost:3002');

const Chat = () => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  // Fetch logged-in user on mount
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/getUserDetails', {
          withCredentials: true,
        });
        setUser(data.name);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchLoggedInUser();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const socketInstance = io('http://localhost:3001');
      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user]);

  // Join a room when starting a chat
  useEffect(() => {
    if (user && activeStudent && socket) {
      const roomName = [user, activeStudent._id].sort().join('-');
      socket.emit('joinRoom', { sender: user, receiver: activeStudent._id });

      // Listen for incoming messages in the room
      socket.on('message', (msg) => {
        if (msg.receiver === user || msg.sender === user) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      return () => {
        socket.emit('leaveRoom', { sender: user, receiver: activeStudent._id });
      };
    }
  }, [user, activeStudent, socket]);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/verifiedStudents');
        const filteredData = data.filter((student) => student.name !== user);
        setStudents(filteredData);
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };

    if (user) fetchStudents();
  }, [user]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const filtered = students.filter((student) =>
      student.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleStartChat = (student) => {
    if (activeStudent?._id !== student._id) {
      setActiveStudent(student);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && activeStudent && socket) {
      const msg = {
        sender: user,
        receiver: activeStudent._id,
        text: newMessage,
      };

      const roomName = [user, activeStudent._id].sort().join('-');
      socket.emit('newMessage', { room: roomName, message: msg });

      try {
        const { data } = await axios.post('http://localhost:3001/api/chat', msg, { withCredentials: true });
        setMessages((prev) => [...prev, data]);
        setNewMessage('');
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="left-sidebar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search students..."
        />
        <div className="students-list">
          {(searchQuery ? filteredStudents : students).map((student) => (
            <div
              key={student._id}
              onClick={() => handleStartChat(student)}
              className={`student-card ${activeStudent?._id === student._id ? 'active' : ''}`}
            >
              {student.name}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Box */}
      {activeStudent && (
        <div className="chat-box">
          <h2>Chat with {activeStudent.name}</h2>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender === user ? 'sent' : 'received'}`}>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
