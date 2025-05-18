import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Repository Form.css';
import Select from 'react-select';

const RepositoryForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    fileLink: '',
    accessType: '',
    allowedStudent: [],
  });
  const [message, setMessage] = useState('');
  const [students, setStudents] = useState([]);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const isValidFile = (file) => {
    const validExtensions = /\.(pdf|docx?|pptx?|txt|mp4|avi|mkv|jpg|jpeg|png|gif|rar)$/i;
    return validExtensions.test(file.name);
  };

  const handleAccessTypeChange = (e) => {
    const accessType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      accessType,
      allowedStudent: [],
    }));
  };

  const fetchStudents = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/repo-verifiedStudents', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    if (formData.accessType === 'specific') {
      fetchStudents();
    }
  }, [formData.accessType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);

    if ((!formData.file && formData.fileLink.trim() === '')) {
      setMessage('Please upload a file, provide a file link, or both.');
      return;
    }

    if (formData.file && !isValidFile(formData.file)) {
      setMessage('Invalid file type');
      return;
    }
    if (formData.fileLink && !/^https?:\/\//i.test(formData.fileLink)) {
      setMessage('File link must start with http:// or https://');
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      const payload = new FormData();

      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('fileLink', formData.fileLink?.trim() !== '' ? formData.fileLink : 'No File Link uploaded');
      payload.append('accessType', formData.accessType);
      payload.append('allowedStudent', JSON.stringify(formData.allowedStudent));

      if (formData.file) {
        payload.append('file', formData.file);
      } else {
        payload.append('file', ''); // Send an empty value if no file
      }


      const response = await axios.post(
        'http://localhost:3001/api/uploadRepositories',
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage('');
        navigate('/repository');
        toast.success('Repository uploaded successfully!');
        setFormData({
          title: '',
          description: '',
          file: null,
          fileLink: '',
          accessType: 'private',
          allowedStudent: [],
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {

        toast.error('Failed to update repository');

      }
    } catch (err) {
      console.error(err);

    }
  };

  const studentOptions = students.map((student) => ({
    value: student.email,
    label: `${student.name} (${student.email})`,
  }));

  setTimeout(() => {
    setMessage('');
  }, 15000);

  return (
    <div className="repository-form-container">
      <h2>Add Repository</h2>
      {message && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '16px' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />

        <label>Description:</label>
        <input type="text" name="description" value={formData.description} onChange={handleInputChange} required />

        <label>File:</label>
        <input type="file"
          accept=".pdf, .docx, .doc, .pptx, .txt, .mp4, .avi, .mkv, .jpg, .jpeg, .png, .gif, .rar, .svg"

          onChange={handleFileChange} ref={fileInputRef} />

        <label>File Link:</label>
        <input type="text" name="fileLink" value={formData.fileLink} onChange={handleInputChange} />

        <label>Access Type:</label>
        <div className="radioo-group">
          <div className="radio-repo-container">
            <input
              type="radio"
              id="access-private"
              name="accessType"
              value="private"
              checked={formData.accessType === 'private'}
              onChange={handleAccessTypeChange}
              required
            />
            <label className="radio-repo" htmlFor="access-private">Private</label>
          </div>

          <div className="radio-repo-container">
            <input
              type="radio"
              id="access-public"
              name="accessType"
              value="public"
              checked={formData.accessType === 'public'}
              onChange={handleAccessTypeChange}
              required
            />
            <label className="radio-repo" htmlFor="access-public">Public</label>
          </div>

          <div className="radio-repo-container">
            <input
              type="radio"
              id="access-specific"
              name="accessType"
              value="specific"
              checked={formData.accessType === 'specific'}
              onChange={handleAccessTypeChange}
              required
            />
            <label className="radio-repo" htmlFor="access-specific">Specific Student</label>
          </div>


        </div>

        {formData.accessType === 'specific' && (
          <div className='select-student'>
            <label>Select Students:</label>
            <Select
              isMulti
              options={studentOptions}
              value={studentOptions.filter((option) =>
                formData.allowedStudent.some(student => student.email === option.value)
              )}
              onChange={(selectedOptions) => {
                const selectedStudents = selectedOptions
                  ? selectedOptions.map((opt) => ({ name: opt.label.split(' (')[0], email: opt.value }))
                  : [];
                setFormData((prev) => ({
                  ...prev,
                  allowedStudent: selectedStudents,
                }));
              }}
              placeholder="Search and select students..."
              isClearable
            />
          </div>
        )}

        <button className='add-repo' type="submit">Submit</button>
      </form>

      <Toaster position="top-center" />
    </div>
  );
};

export default RepositoryForm;
