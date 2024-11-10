import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chat.css';

function Chat() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/verifiedStudents')
      .then(response => {
        setStudents(response.data);
      })
      .catch(err => {
        console.error('Error fetching students:', err);
      });
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.specification.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [searchQuery, students]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStartChat = (student) => {
    const existingChat = chatHistory.find(chat => chat.student._id === student._id);
    if (existingChat) {
      setActiveStudent(existingChat.student);
      setMessages(existingChat.messages);
    } else {
      setActiveStudent(student);
      setMessages([]);
    }
  };

  const handleMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const updatedMessages = [...messages, { sender: 'You', text: newMessage }];
      setMessages(updatedMessages);
      setNewMessage('');

      const updatedChatHistory = chatHistory.filter(chat => chat.student._id !== activeStudent._id);
      setChatHistory([...updatedChatHistory, { student: activeStudent, messages: updatedMessages }]);
    }
  };

  return (
    <div className="chat-container">
      {/* Left Sidebar for Students List and Search */}
      <div className="left-sidebar">
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name or specification..."
          />
        </div>
        <div className="students-list">
          {searchQuery && filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div key={student._id} className="student-card" onClick={() => handleStartChat(student)}>
                <p>{student.name}</p>
                <p>{student.specification}</p>
              </div>
            ))
          ) : searchQuery && filteredStudents.length === 0 ? (
            <p>No students found</p>
          ) : (
            <p>Search for students...</p>
          )}
        </div>
        <div className="active-chats">
          <h3>Active Chats</h3>
          {chatHistory.length > 0 ? (
            chatHistory.map((chat) => (
              <div key={chat.student._id} className="active-chat-card" onClick={() => handleStartChat(chat.student)}>
                <p>{chat.student.name}</p>
                <p>{chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : "No messages yet"}</p>
              </div>
            ))
          ) : (
            <p>No active chats</p>
          )}
        </div>
      </div>

      {/* Right side: Chat Window */}
      {activeStudent && (
        <div className="chat-box">
          <div className="chat-header">
            <p>{activeStudent.name}</p>
          </div>
          <div className="chat-messages">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div key={index} className={`message ${message.sender === 'You' ? 'sent' : 'received'}`}>
                  <p>{message.text}</p>
                </div>
              ))
            ) : (
              <p>No messages yet</p>
            )}
          </div>
          <div className="chat-input-container">
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
}

export default Chat;
