import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Broadcast Request.css';

const BroadcastRequest = () => {
  const [programs, setPrograms] = useState([]); // To store fetched programs
  const [formData, setFormData] = useState({
    topic: '',
    subtopic: '',
    urgency: 'Low',
    programs: [],
  });
  const [myRequests, setMyRequests] = useState([]); // To store the user's previous requests
  const [statusMessage, setStatusMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/fetchPrograms', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
  
        // Assuming the API now returns an array of program names
        setPrograms(response.data);  // Store fetched program names
  
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };
  
    fetchPrograms();
  }, []);
  

  // Handle checkbox selection
  const handleProgramChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData((prev) => ({ ...prev, programs: [...prev.programs, value] }));
    } else {
      setFormData((prev) => ({ ...prev, programs: prev.programs.filter((program) => program !== value) }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.programs.length === 0) {
      setStatusMessage('Please select at least one program.');
      return;
    }

    const userId = sessionStorage.getItem('userId');
    const newRequest = {
      topic: formData.topic,
      subtopic: formData.subtopic,
      urgency: formData.urgency,
      userId: userId,
      programs: formData.programs,
    };

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/broadcastRequest', newRequest, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.status === 201) {
        setMyRequests((prev) => [...prev, response.data]);
        toast.success('Your request has been successfully submitted!');

        setFormData({ topic: '', subtopic: '', urgency: 'Low', programs: [] });
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      setStatusMessage(`Error: ${err.response ? err.response.data : err.message}`);
    }
  };

  return (
    <div className="broadcast-container">
      <h2 className="broadcast-title">Broadcast a Learning Request</h2>
      <form onSubmit={handleSubmit} className="broadcast-form">
        <div className="form-group">
          <label>Topic</label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Subtopic</label>
          <input
            type="text"
            name="subtopic"
            value={formData.subtopic}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Urgency</label>
          <select name="urgency" value={formData.urgency} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {programs.length > 0 ? (
  programs.map((program) => (
    <div key={program}>  {/* Use program name as the key */}
      <input
        type="checkbox"
        value={program}
        onChange={handleProgramChange}
      />
      <label>{program}</label>
    </div>
  ))
) : (
  <p>No programs available</p>
)}


        <button type="submit" className="submit-btn">
          Submit Request
        </button>
      </form>
      <Toaster position="top-center" />
    </div>
  );
};

export default BroadcastRequest;
