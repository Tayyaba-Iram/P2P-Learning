import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Chat.css';

function Chat() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [chattedStudents, setChattedStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState({});
  const [favoriteStudents, setFavoriteStudents] = useState([]);

  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);

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

  // Fetch chatted students
  useEffect(() => {
    const fetchChattedStudents = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          console.error('Token is missing');
          return;
        }

        const response = await axios.get('http://localhost:3001/api/chattedStudents', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        console.log('Chatted students:', response.data); // Log the response
        setChattedStudents(response.data); // Update your state with the data
      } catch (err) {
        console.error('Error fetching chatted students:', err.response?.data || err.message);
      }
    };

    fetchChattedStudents();
  }, [user]);

  // Fetch all students except the logged-in user
  useEffect(() => {
    const fetchStudents = async () => {
      if (user) {
        try {
          const { data } = await axios.get('http://localhost:3001/api/verifiedStudents', { withCredentials: true });
          setStudents(data.filter(student => student._id !== user._id));  // Remove logged-in user
        } catch (err) {
          console.error('Error fetching students:', err);
        }
      }
    };
    fetchStudents();
  }, [user]);

  // Initialize socket connection and handle incoming messages
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3001');
      socketRef.current.on('connect', () => {
        console.log(`Connected to socket server. Socket ID: ${socketRef.current.id}`);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });
    }

    const handleIncomingMessage = (message) => {
      if (
        activeStudent &&
        (message.senderId === activeStudent._id || message.receiverId === activeStudent._id)
      ) {
        // Show message in the current chat view
        setMessages((prev) => [...prev, message]);
      } else {
        // Message is from another student — show green dot
        setUnreadMessages((prevUnread) => ({
          ...prevUnread,
          [message.senderId]: true,
        }));
      }
    };

    socketRef.current?.on('newMessage', handleIncomingMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage', handleIncomingMessage);
      }
    };
  }, [activeStudent]);

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
    setMessages([]); // Clear previous chat history

    const senderId = user._id;
    const receiverId = student._id;
    const roomName = [senderId, receiverId].sort().join('-');

    if (socketRef.current) {
      socketRef.current.emit('joinRoom', roomName, (err) => {
        if (err) console.error('Error joining room:', err);
        else console.log(`Joined room: ${roomName}`);
      });
    }

    // Remove green dot for this student (clear unread)
    setUnreadMessages((prev) => {
      const updated = { ...prev };
      delete updated[student._id];
      return updated;
    });

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

    socketRef.current?.emit('newMessage', { room: roomName, message: msg });

    setNewMessage(''); // Clear the message input field
  };

  // Ensure that the chat container scrolls to the bottom when a new message is added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter students based on search query and exclude chatted students
  const filteredStudents = students.filter((student) =>
    !chattedStudents.some(chattedStudent => chattedStudent._id === student._id) &&
    (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     student.specification.toLowerCase().includes(searchQuery.toLowerCase()))
  );
 
  const toggleFavorite = async (studentId) => {
    try {
      // Check if the student is already in favorites
      if (favoriteStudents.includes(studentId)) {
        // Remove from favorites
        setFavoriteStudents((prev) => prev.filter((id) => id !== studentId));
      } else {
        // Add to favorites
        setFavoriteStudents((prev) => [...prev, studentId]);
  
        // Send POST request to backend to save the favorite
        const token = sessionStorage.getItem('token'); // Get the token
        if (!token) {
          console.error('User is not authenticated');
          return;
        }
  
        const response = await axios.post(
          `http://localhost:3001/api/favoriteStudent/${studentId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        console.log(response.data.message); // Show success message from backend
      }
    } catch (error) {
      console.error('Error favoriting student:', error.response?.data || error.message);
    }
  };
  const unfavoriteStudent = async (favoriteStudentId) => {
    try {
      const token = sessionStorage.getItem('token'); // Get the token
      if (!token) {
        console.error('User is not authenticated');
        return;
      }
  
      // Send DELETE request to remove the student from favorites
      const response = await axios.delete(
        `http://localhost:3001/api/unfavoriteStudent/${favoriteStudentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.message); // Show success message from backend
  
      // Remove from the favoriteStudents list in state
      setFavoriteStudents((prev) => prev.filter((id) => id !== favoriteStudentId));
    } catch (error) {
      console.error('Error unfavoriting student:', error.response?.data || error.message);
    }
  };
  const token = sessionStorage.getItem('token'); 
 
  const fetchFavorites = async () => {
    if (!token) {
      console.log('User is not logged in');
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/api/favoriteStudents', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const favoriteStudentIds = response.data.map(fav => fav.favoriteStudentId._id);
      setFavoriteStudents(favoriteStudentIds);
    } catch (error) {
      console.error('Error fetching favorite students:', error);
    }
  };
  useEffect(() => {
    if (token) {
      fetchFavorites();
    }
  }, [token]);
  
  // Filter favorite students
  const favoriteStudentsList = chattedStudents.filter(student => favoriteStudents.includes(student._id));

  // Filter non-favorite students
  const nonFavoriteStudentsList = chattedStudents.filter(student => !favoriteStudents.includes(student._id));

  const sortedChattedStudents = [...favoriteStudentsList, ...nonFavoriteStudentsList];

  return (
    <div className="Chat-container">
      <div className="sidebar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search peers by name or specification..."
        />
        {searchQuery.trim() && (
          filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <div key={student._id} onClick={() => handleStartChat(student)}>
                {student.name} - {student.specification}
              </div>
            ))
          ) : (
            <div>No matching students found.</div>
          )
        )}
        
       
        <h3 className="catted">Chats</h3>
        {chattedStudents.length === 0 ? (
          <div>No chatted students found.</div>
        ) : (
          sortedChattedStudents.map(student => (
            <div key={student._id} onClick={() => handleStartChat(student)}>
              <span>{student.name}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  if (favoriteStudents.includes(student._id)) {
                    unfavoriteStudent(student._id);
                  } else {
                    toggleFavorite(student._id);
                  }
                }}
                style={{ marginLeft: '10px', cursor: 'pointer' }}
              >
                {favoriteStudents.includes(student._id) ? '❤️' : '🤍'}
              </span>
              {unreadMessages[student._id] && (
                <span className="green-dot"></span>
              )}
            </div>
          ))
        )}
      </div>

      {activeStudent && (
        <div className="chat-box">
          <h2>Chat with {activeStudent.name}</h2>
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.slice().reverse().map((msg, idx) => (
              <div key={idx} className={`message ${msg.senderId === user._id ? 'sent' : 'received'}`}>
                <strong>{msg.senderId === user._id ? 'You' : activeStudent.name}</strong>: {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} disabled={isSending}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
