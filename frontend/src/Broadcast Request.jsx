import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RequestTable from './RequestTable';
import './Broadcast Request.css';

const BroadcastRequest = () => {
  // Form data state
  const [formData, setFormData] = useState({
    topic: '',
    subtopic: '',
    urgency: 'Low',
    programs: [],  // Array to hold selected programs
  });

  // State for storing requests
  const [myRequests, setMyRequests] = useState([]); // User's requests
  const [statusMessage, setStatusMessage] = useState(''); // For success or error message
  const [showPopup, setShowPopup] = useState(false); // Control popup visibility
  const [loading, setLoading] = useState(false); // Loading state

  // List of programs to display as checkboxes
  const programsList = [
    "BS Software Engineering",
    "BS Computer Science",
    "BS Cyber Security",
    "BS Electrical Engineering",
    "BS Physics",
    "MBBS"
  ];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'programs') {
      // Toggle program selection
      setFormData((prev) => {
        const updatedPrograms = prev.programs.includes(value)
          ? prev.programs.filter((program) => program !== value) // Remove if already selected
          : [...prev.programs, value]; // Add if not selected
        return {
          ...prev,
          programs: updatedPrograms,
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    axios.get('http://localhost:3001/api/broadcastRequest')
      .then((response) => {
        setMyRequests(response.data);
      })
      .catch((error) => {
        console.error("Error fetching requests:", error);
      });
  }, []);
  
  <RequestTable myRequests={myRequests} />


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the page from refreshing on submit

    if (formData.programs.length === 0) {
      setStatusMessage('Please select at least one program.');
      return;
    }

    setLoading(true);

    // Form data that we will send to backend
    const newRequest = {
      topic: formData.topic,
      subtopic: formData.subtopic,
      urgency: formData.urgency,
      userId: '12345',  // Replace with actual user ID from session or context
      programs: formData.programs,  // Array of program names
    };

    try {
      // Send POST request to the backend API
      const response = await axios.post('http://localhost:3001/api/broadcastRequest', newRequest, {
        withCredentials: true, // Ensure cookies (if any) are sent with the request
      });

      // If successful, add request to the state and show success message
      if (response.status === 201) {
        setMyRequests((prev) => [...prev, response.data]);
        setStatusMessage('Your request has been successfully submitted!');
        setShowPopup(true);
        
        // Hide popup after 3 seconds
        setTimeout(() => {
          setShowPopup(false);
        }, 3000);

        // Reset form fields after successful submission
        setFormData({ topic: '', subtopic: '', urgency: 'Low', programs: [] });
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      setStatusMessage(`Error: ${err.response ? err.response.data : err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId'); // Assuming userId is saved in localStorage
  
    if (!userId) return; // If there's no user ID, don't make the API request
  
    axios.get(`http://localhost:3001/api/broadcastRequest/${userId}`)
      .then(response => {
        setMyRequests(response.data);
      })
      .catch(error => {
        console.error("Error fetching requests:", error);
      });
  }, []);
  

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
        
        <div className="form-group">
          <label>Programs</label>
          <div className="program-checkboxes">
            {programsList.map((program) => (
              <label key={program}>
                <input
                  type="checkbox"
                  name="programs"
                  value={program}
                  onChange={handleChange}
                  checked={formData.programs.includes(program)}  // Ensure checkbox is checked when program is in the array
                /> {program}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      {showPopup && <div className="popup-message">{statusMessage}</div>}

      {/* Pass myRequests state to RequestTable */}
      <RequestTable myRequests={myRequests} />
    </div>
  );
};

export default BroadcastRequest;
