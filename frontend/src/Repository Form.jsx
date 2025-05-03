import React, { useEffect, useRef, useState } from 'react';
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
    accessType: 'private',
    allowedStudent: [],
  });

  const [students, setStudents] = useState([]);
  const fileInputRef = useRef(); // ✅ Ref to reset file input

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

    if (!formData.title || !formData.description || (!formData.file && formData.fileLink.trim() === '')) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.file && !isValidFile(formData.file)) {
      toast.error('Invalid file type');
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
        toast.success('Repository uploaded successfully!');
        setFormData({
          title: '',
          description: '',
          file: null,
          fileLink: '',
          accessType: 'private',
          allowedStudent: [],
        });

        // ✅ Clear file input manually
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  };

  const studentOptions = students.map((student) => ({
    value: student.email,
    label: `${student.name} (${student.email})`,
  }));

  return (
    <div className="repository-form-container">
      <h2>Add Repository</h2>
      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input type="text" name="title" value={formData.title} onChange={handleInputChange} />

        <label>Description:</label>
        <input type="text" name="description" value={formData.description} onChange={handleInputChange} />

        <label>File:</label>
        <input type="file" onChange={handleFileChange} ref={fileInputRef} />

        <label>File Link:</label>
        <input type="text" name="fileLink" value={formData.fileLink} onChange={handleInputChange} />

        <label>Access Type:</label>
        <div className="access-options">
          <label>
            <input
              type="radio"
              name="accessType"
              value="public"
              checked={formData.accessType === 'public'}
              onChange={handleAccessTypeChange}
            />
            Public
          </label>
          <label>
            <input
              type="radio"
              name="accessType"
              value="private"
              checked={formData.accessType === 'private'}
              onChange={handleAccessTypeChange}
            />
            Private
          </label>
          <label>
            <input
              type="radio"
              name="accessType"
              value="specific"
              checked={formData.accessType === 'specific'}
              onChange={handleAccessTypeChange}
            />
            Specific Student
          </label>
        </div>

        {formData.accessType === 'specific' && (
          <>
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
          </>
        )}

        <button type="submit">Submit</button>
      </form>

      <Toaster position="top-center" />
    </div>
  );
};

export default RepositoryForm;
