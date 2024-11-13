import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './Chat.css';


const Chat = () => {
  const [user, setUser] = useState(null);  // Store logged-in user here
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch logged-in user and students on mount
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/getUserDetails', {
          withCredentials: true, // Ensure the token is sent with the request
        });
        setUser(data.name);  // Set the logged-in user's name
      } catch (err) {
        console.error('Error fetching logged-in user:', err);
      }
    };

    fetchLoggedInUser();
    socket.emit('joinRoom', user);

    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchStudents = async () => {
        try {
          const { data } = await axios.get('http://localhost:3001/api/verifiedStudents');
          console.log("Fetched students:", data);  // Log fetched students data
          const filteredData = data.filter(student => student.name !== user); // Exclude the logged-in user
          setStudents(filteredData);
        } catch (err) {
          console.error('Error fetching students:', err);
        }
      };
  
      fetchStudents();
    }
  }, [user]);
  

  // Load chat history when active student changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeStudent && user) {
        try {
          const { data } = await axios.get(`http://localhost:3001/api/chat/${user}/${activeStudent._id}`);
          setMessages(data);
        } catch (err) {
          console.error('Error loading chat history:', err);
        }
      }
    };
    fetchMessages();
  }, [activeStudent, user]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
  }, []);

  // Handle search query input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredStudents(filtered);
    console.log("Filtered students:", filtered);  // Log filtered students based on search query
  };
  

  const handleStartChat = (student) => setActiveStudent(student);

  const handleMessageChange = (e) => setNewMessage(e.target.value);

  const handleSendMessage = async () => {
    if (newMessage.trim() && activeStudent) {
      const msg = {
        sender: user,
        receiver: activeStudent._id,
        text: newMessage,
      };

      try {
        // Emit the message to the server (Socket.IO)
        socket.emit('newMessage', msg);

        // Save the message in the database
        const { data } = await axios.post('http://localhost:3001/api/chat', msg, {
          withCredentials: true,
        });

        setMessages(prev => [...prev, data]);
        setNewMessage('');
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  };

  return (
    <div className="chat-container">
      {/* Left Sidebar */}
      <div className="left-sidebar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search students..."
        />
    <div className="students-list">
  {(searchQuery ? filteredStudents : students).map(student => (
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
              onChange={handleMessageChange}
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
