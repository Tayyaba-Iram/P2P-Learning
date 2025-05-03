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
    
        // Check if the file type matches the allowed MIME types or extensions
        const fileExtension = file?.name.split('.').pop().toLowerCase();
        const fileType = file?.type;
    
        if (!allowedTypes.includes(fileType) && !allowedExtensions.some(ext => fileExtension === ext)) {
            toast.error('Invalid file type. Only .jpg, .jpeg, .png, .pdf, .docx, and .word files are allowed.');
            setFile(null); // Clear the file input if the file type is invalid
        } else {
            setFile(file); // Set the file if it's valid
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
      
          console.log('Response:', res);  // Check response for the filename
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
          toast.error(error.response?.data?.error || 'Error submitting complaint');
        }
      };

    return (
        <form onSubmit={handleSubmit} className="complaint-submit">
            <h3>Submit a Complaint</h3>
            <p>Please use this form to submit a complaint regarding any issue related to your experience as a student.</p>

            <input
                type="text"
                name="targetname"
                placeholder="Target Name"
                value={formData.targetname}
                onChange={handleChange}
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
            />

            <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
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
                accept=".jpg,.jpeg,.png,.pdf,.docx,.word"
                onChange={handleFileChange}
                required
            />

            <button className='submit-complain' type="submit">Submit Complaint</button>
            <Toaster position="top-center" />
        </form>
    );
};

export default ComplaintForm;
