import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Broadcast Request.css';

const BroadcastRequest = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]); 
  const [formData, setFormData] = useState({
    topic: '',
    subtopic: '',
    urgency: 'Low',
    programs: [],
  });
  const [myRequests, setMyRequests] = useState([]); 
  const [statusMessage, setStatusMessage] = useState('');
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/fetchPrograms', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });

        setPrograms(response.data); 
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchPrograms();
      const intervalId = setInterval(() => {
        fetchPrograms();
    }, 1000); 

    return () => clearInterval(intervalId);
  }, [token]);

 
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
        toast.success('Request sending successfully');
        navigate('/')
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
        <div className="form-groupb">
          <label>Topic:</label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-groupb">
          <label>Subtopic:</label>
          <input
            type="text"
            name="subtopic"
            value={formData.subtopic}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-groupb">
          <label>Urgency:</label>
          <select name="urgency" value={formData.urgency} onChange={handleChange}
            style={{
              paddingRight: '24px', 
              backgroundPosition: 'right 8px center',
              backgroundRepeat: 'no-repeat',
              backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'%23000\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>")', // custom arrow
              appearance: 'none', 
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <label className='chose-program'>Choose Programs:</label>

        {programs.length > 0 ? (
          programs.map((program) => (
            <div key={program} className="checkbox-group" style={{ marginBottom: '0' }}>
              <input
                type="checkbox"
                value={program}
                checked={formData.programs.includes(program)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  const value = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    programs: checked
                      ? [...prev.programs, value]
                      : prev.programs.filter((p) => p !== value),
                  }));
                }}

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
