import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Broadcast Request.css';

const BroadcastRequest = () => {
  const [formData, setFormData] = useState({
    topic: '',
    subtopic: '',
    urgency: 'Low',
    programs: [],
  });

  const [myRequests, setMyRequests] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const programsList = [
    "BS Software Engineering",
    "BS Computer Science",
    "BS Cyber Security",
    "BS Electrical Engineering",
    "BS Physics",
    "MBBS"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'programs') {
      setFormData((prev) => {
        const updatedPrograms = prev.programs.includes(value)
          ? prev.programs.filter((p) => p !== value)
          : [...prev.programs, value];
        return { ...prev, programs: updatedPrograms };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    axios.get(`http://localhost:3001/api/broadcastRequest/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setMyRequests(response.data);
      })
      .catch((error) => {
        console.error("Error fetching requests:", error);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.programs.length === 0) {
      setStatusMessage('Please select at least one program.');
      return;
    }

    setLoading(true);

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
        const newReqData = response.data;
        sessionStorage.setItem('lastBroadcastRequest', JSON.stringify(newReqData));
        sessionStorage.setItem('broadcastSubmitted', 'true');

        setMyRequests((prev) => [...prev, newReqData]);
        setStatusMessage('Your request has been successfully submitted!');
        setShowPopup(true);

        setTimeout(() => setShowPopup(false), 3000);

        setFormData({ topic: '', subtopic: '', urgency: 'Low', programs: [] });
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      setStatusMessage(`Error: ${err.response ? err.response.data : err.message}`);
    } finally {
      setLoading(false);
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

        <div className="form-group">
          <label>Programs</label>
          <div className="program-checkboxes">
            {programsList.map((program) => (
              <label key={program}>
                <input
                  type="checkbox"
                  name="programs"
                  value={program}
                  checked={formData.programs.includes(program)}
                  onChange={handleChange}
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
    </div>
  );
};

export default BroadcastRequest;
