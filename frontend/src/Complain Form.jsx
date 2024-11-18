import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import toast, { Toaster } from 'react-hot-toast'; // Import toast and Toaster
import './Complain Form.css';

const ComplaintForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        sapid: '',
        email: '',
        university: '',
        date: new Date(),
        category: '',
        description: '',
    });

    const navigate = useNavigate(); // Initialize useNavigate hook

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date) => {
        setFormData({ ...formData, date });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3001/api/complaints', {
                ...formData,
                date: formData.date.toISOString(),
            });
            toast.success(res.data.message); // Show success toast
            setFormData({ name: '', sapid: '', email: '', university: '', date: new Date(), category: '', description: '' });
            
            // Redirect to /complains after successful submission
            navigate('/complains');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error submitting complaint'); // Show error toast
        }
    };

    return (
        <div className="complaint-form-container">
            <h2>Submit a Complaint</h2>
            <p>Please use this form to submit a complaint regarding any issue related to your experience as a student.</p>
            <form onSubmit={handleSubmit} className="complaint-form">
                <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                <input type="text" name="sapid" placeholder="SAP ID" value={formData.sapid} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="text" name="university" placeholder="University" value={formData.university} onChange={handleChange} required />
                <DatePicker
                    selected={formData.date}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    className="date-picker"
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
                 
                <button type="submit">Submit Complaint</button>
            </form>
            <Toaster position="top-center" /> {/* Include Toaster here */}
        </div>
    );
};

export default ComplaintForm;
