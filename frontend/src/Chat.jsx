import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Chat.css';
import { useParams } from 'react-router-dom';

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

  const { studentId } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('No token found. User not authenticated.');
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/api/verifiedStudents/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(response.data);
      } catch (err) {
        console.error('Error fetching student details:', err.response?.data || err.message);
      }
    };

    fetchStudent();
  }, [studentId]);
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

        console.log('Chatted students:', response.data);
        setChattedStudents(response.data);
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
        setMessages((prev) => [...prev, message]);

        setChattedStudents((prevStudents) =>
          prevStudents.map((s) =>
            s._id === activeStudent._id ? { ...s, hasUnread: false } : s
          )
        );
      } else {
        setUnreadMessages((prevUnread) => {
          const updated = { ...prevUnread };
          updated[message.senderId] = true; // Mark message as unread for this sender
          return updated;
        });

        setChattedStudents((prevStudents) =>
          prevStudents.map((s) =>
            s._id === message.senderId ? { ...s, hasUnread: true } : s
          )
        );

      }
    };


    socketRef.current?.on('newMessage', handleIncomingMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage', handleIncomingMessage);
      }
    };
  }, [activeStudent]);
  const fetchChatHistory = async (student) => {
    try {
      const token = sessionStorage.getItem('token');

      const { data } = await axios.get(`http://localhost:3001/api/chat/${student._id}`, {
        params: { userId: user._id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(data);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };
  const [selectedStudentId, setSelectedStudentId] = useState(null);


  const handleStartChat = async (student) => {
    setSelectedStudentId(student._id);
    if (!user || !student) return;

    setActiveStudent(student);
    setMessages([]); // Clear previous chat history

    const senderId = user._id;
    const receiverId = student._id;
    const roomName = [senderId, receiverId].sort().join('-');

    setChattedStudents((prev) => {
      const exists = prev.some((s) => s._id === student._id);
      return exists ? prev : [...prev, student];
    });

    // Join the socket room
    if (socketRef.current) {
      socketRef.current.emit('joinRoom', roomName, (err) => {
        if (err) console.error('Error joining room:', err);
        else console.log(`Joined room: ${roomName}`);
      });
    }

    try {
      await axios.post('http://localhost:3001/api/chat/markAsRead', {
        senderId: student._id,
        receiverId: user._id
      });

      setUnreadMessages((prev) => {
        const updated = { ...prev };
        delete updated[student._id];
        return updated;
      });

      setChattedStudents((prevStudents) =>
        prevStudents.map((s) =>
          s._id === student._id ? { ...s, hasUnread: false } : s
        )
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
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

    socketRef.current?.emit('newMessage', { room: roomName, message: msg });

    setNewMessage('');
  };

  //  chat container scroll to the bottom when a new message is added
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
      if (favoriteStudents.includes(studentId)) {
        // Remove from favorites
        setFavoriteStudents((prev) => prev.filter((id) => id !== studentId));
      } else {
        // Add to favorites
        setFavoriteStudents((prev) => [...prev, studentId]);
        const token = sessionStorage.getItem('token');
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

        console.log(response.data.message);
      }
    } catch (error) {
      console.error('Error favoriting student:', error.response?.data || error.message);
    }
  };
  const unfavoriteStudent = async (favoriteStudentId) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('User is not authenticated');
        return;
      }

      const response = await axios.delete(
        `http://localhost:3001/api/unfavoriteStudent/${favoriteStudentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.message);

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
  useEffect(() => {
    const fetchStudentAndStartChat = async () => {
      if (!studentId || !user) return;

      const token = sessionStorage.getItem('token');

      try {
        const res = await axios.get(`http://localhost:3001/api/verifiedStudents/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const student = res.data;
        setActiveStudent(student);
        setSelectedStudentId(student._id);

        const senderId = user._id;
        const receiverId = student._id;
        const roomName = [senderId, receiverId].sort().join('-');

        socketRef.current?.emit('joinRoom', roomName, (err) => {
          if (err) console.error("Socket join error:", err);
          else console.log("Joined room:", roomName);
        });

        const msgRes = await axios.get(`http://localhost:3001/api/chat/${student._id}`, {
          params: { userId: user._id, peerId: student._id },
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessages(msgRes.data);
      } catch (error) {
        console.error("Error loading student/chat:", error);
      }
    };

    fetchStudentAndStartChat();
  }, [studentId, user]);


  return (
    <div className="Chat-container">
      <div className="sidebar">
        <input className='search'
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
            <div
              key={student._id}
              onClick={() => handleStartChat(student)}
              className={`chat-student ${selectedStudentId === student._id ? 'selected' : ''}`}
            >
              {student.hasUnread && (
                <span className="green-dot"></span>
              )}
              <span>{student.name} - </span>
              <span>{student.specification}</span>
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

            </div>
          ))
        )}
      </div>

      {activeStudent ? (
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
      ) : (
        <div className="chat-placeholder">
          <h3>Your chat inbox is quiet. Pick a student to break the silence!</h3>
        </div>
      )}

    </div>
  );
}

export default Chat;