import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditRepository.css'
import toast, { Toaster } from 'react-hot-toast';

export default function EditRepository() {
  const { repoId } = useParams();
  const [repo, setRepo] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileLink, setFileLink] = useState('');  // Store the file link (it should not change unless the file is uploaded)
  const [fileName, setFileName] = useState('');  // Store the current file name
  const [newFile, setNewFile] = useState(null);  // To hold the new file if chosen
  const token = sessionStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRepo = async () => {
      if (!repoId) {
        console.error('Repository ID is missing');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/api/repositoryInfo/${repoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setRepo(response.data.repository);
          setTitle(response.data.repository.title);
          setDescription(response.data.repository.description);
          setFileLink(response.data.repository.fileLink || '');  // Set file link from the API
          setFileName(response.data.repository.file || ''); // Set current file name
        } else {
          console.error('Error:', response.data.message);
        }
      } catch (err) {
        console.error('Error fetching repository:', err);
      }
    };

    fetchRepo();
  }, [repoId, token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewFile(file); // Set the new file selected by the user
    setFileName(file.name); // Display the new file name in the input field
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('title', title);  // Append title
    formData.append('description', description);  // Append description
  
    // If a new file is selected, append it to FormData
    if (newFile) {
      formData.append('file', newFile);
    }
  
    // Append the current fileLink if it exists (e.g., if no new file is uploaded)
    formData.append('fileLink', fileLink);
  
    try {
      const response = await axios.put(
        `http://localhost:3001/api/updateRepository/${repoId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',  // Important for file uploads
          },
        }
      );
  
      if (response.data.success) {
        setFileLink(response.data.repository.fileLink);  // Update the file link in the state after update if file is uploaded
        toast.success('Repository updated successfully!');
        navigate('/repository');
      } else {
        console.error('Error:', response.data.message);
      }
    } catch (err) {
        console.error('Error:', response.data.message);
        toast.error('Failed to update repository');
    }
  };

  return (
      
<div className='editcontainer'>
<h2>Edit Repository</h2>
      <label>Title:</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Description:</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>File Link:</label>
      <input
        type="text"
        value={fileLink || ''}  // If fileLink is empty, use empty string (""), otherwise use fileLink
        placeholder={fileLink ? '' : 'No file uploaded'}  // Show placeholder when no fileLink exists
        onChange={(e) => setFileLink(e.target.value)} // Update fileLink when user changes the input
      />

      {/* Display Current File Name and allow user to select a new file */}
      <label>Current File:</label>
      <div>
      {fileName ? (
  <div>
    <input
      type="text"
      value={fileName}
      readOnly
      className="file-name-input"
    />
  </div>
) : (
  <input
    type="text"
    value="No file chosen"
    readOnly
    className="file-name-input"
  />
)}

        {/* Input for selecting a file */}
        <label>New File:</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt" // You can add more file types as needed
        />
      </div>

      <br />
      <button className="update-btn" onClick={handleSubmit}>Update Repository</button>
       <Toaster position="top-center" />
    </div>
  );
}
