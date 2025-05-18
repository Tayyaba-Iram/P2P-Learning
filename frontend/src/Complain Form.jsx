import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import toast, { Toaster } from 'react-hot-toast';
import './Complain Form.css';

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    targetname: '',
    targetemail: '',
    date: new Date(),
    category: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword']; // File MIME types
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.word']; // File extensions

    const fileExtension = file?.name.split('.').pop().toLowerCase();
    const fileType = file?.type;

    if (!allowedTypes.includes(fileType) && !allowedExtensions.some(ext => fileExtension === ext)) {
      setFile(null);
    } else {
      setFile(file);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to submit a complaint');
      return;
    }

    const data = new FormData();
    data.append('targetname', formData.targetname);
    data.append('targetemail', formData.targetemail);
    data.append('date', formData.date.toISOString());
    data.append('category', formData.category);
    data.append('description', formData.description);
    if (file) {
      data.append('file', file);
    }

    try {
      const res = await axios.post('http://localhost:3001/api/complaints', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response:', res);  
      toast.success(res.data.message);
      setFormData({
        targetname: '',
        targetemail: '',
        date: new Date(),
        category: '',
        description: '',
      });
      setFile(null);
      navigate('/complains');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error fetching complaints');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="complaint-submit">
      <h2>Submit a Complaint</h2>
      <p>Please use this form to submit a complaint regarding any issue related to your experience as a student.</p>

      <input
        type="text"
        name="targetname"
        placeholder="Target Name"
        value={formData.targetname}
        onChange={(e) => {
          const regex = /^[A-Za-z\s]*$/;
          if (regex.test(e.target.value)) {
            handleChange(e);
          }
        }}
        required
      />

      <input
        type="email"
        name="targetemail"
        placeholder="Target Email"
        value={formData.targetemail}
        onChange={handleChange}
        required
      />
      <DatePicker
        selected={formData.date}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        className="date-pickerc"
        minDate={new Date()}  // Disable past dates
      />

      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
        style={{
          paddingRight: '24px', 
          backgroundPosition: 'right 8px center', 
          backgroundRepeat: 'no-repeat',
          backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'%23000\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>")', // custom arrow
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
        }}
      >
        <option value="" disabled>Select Category</option>
        <option value="Technical Issue">Technical Issue</option>
        <option value="Content Concern">Content Concern</option>
        <option value="User Behavior">User Behavior</option>
      </select>

      <textarea
        name="description"
        placeholder="Describe your issue"
        value={formData.description}
        onChange={handleChange}
        required
      ></textarea>

      <input
        type="file"
        accept=".jpg, .jpeg, .png, .pdf, .docx, .word"
        onChange={handleFileChange}
        required
      />
      {message && <p style={{ color: 'red', marginTop: "20px", fontWeight: 'bold', fontSize: '16px', textAlign: 'center' }}>{message}</p>}

      <button className='submit-complain' type="submit">Submit Complaint</button>
      <Toaster position="top-center" />
    </form>
  );
};

export default ComplaintForm;
