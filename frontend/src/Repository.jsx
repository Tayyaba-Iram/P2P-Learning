import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Repository.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Repository = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    fileLink: ''
  });
  
  // State for search term
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/repositories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data && Array.isArray(res.data)) {
        setRepositories(res.data);
      } else {
        console.warn("Unexpected data format received:", res.data);
        setRepositories([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ title: '', description: '', file: null, fileLink: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const isValidFile = (file) => {
    const validFileExtensions = /\.(pdf|doc|docx|ppt|pptx|txt|mp4|avi|mkv|jpg|jpeg|png|gif|rar)$/i;
    return validFileExtensions.test(file.name);
  };

  const handleAddRepository = async () => {
    if (!formData.title || !formData.description || (!formData.file && !formData.fileLink)) {
      alert("Please fill out all fields and provide either a file or a valid link.");
      return;
    }

    if (formData.file && !isValidFile(formData.file)) {
      alert('Please upload a valid file (PDF, DOC, etc.)');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('fileLink', formData.fileLink);

      if (formData.file) {
        payload.append('file', formData.file);
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
        toast.success('Repository added successfully!');
        fetchRepositories();  // Fetch updated repositories
        handleCloseModal();
      } else {
        alert('Failed to upload repository');
        toast.error('Error to add repository!');
      }
    } catch (err) {
      console.error('Error uploading repository:', err);
      alert('Failed to upload repository');
    }
  };

  const handleDeleteRequest = (index) => {
    setConfirmDeleteIndex(index);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('You are not logged in!');
        return;
      }

      const repoId = repositories[confirmDeleteIndex]._id;
      await axios.delete(`http://localhost:3001/api/repositories/${repoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRepositories(repositories.filter((_, index) => index !== confirmDeleteIndex));
      setConfirmDeleteIndex(null);
      toast.success('Repository deleted successfully!');
    } catch (err) {
      console.error('Error deleting repository:', err);
      toast.error('Repository deleted unsuccessfully!');
      if (err.response && err.response.status === 401) {
        alert('Unauthorized! Please login again.');
        window.location.href = '/login';
      } else {
        alert('Failed to delete repository');
      }
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteIndex(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRepositories = repositories.filter((repo) =>
    repo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="repository-container">
      {/* Search bar */}
     
      <div style={{ display: 'flex', justifyContent: 'center' }}>
  <input
    className="directory-search"
    type="text"
    placeholder="Search by Title, or Description..."
    value={searchTerm}
    onChange={handleSearchChange}
    style={{
      padding: '10px',
      width: '60%',
      marginBottom: '20px',
      borderRadius: '8px',
      border: '1px solid #ccc',
    }}
  />
</div>

      <button className="add-button" onClick={handleAddClick}>Add Repository</button>

      {loading ? (
        <div className="loading">Loading repositories...</div>
      ) : filteredRepositories.length === 0 ? (
        <div className="empty-state">No repository files uploaded yet.</div>
      ) : (
        <table className="repository-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Document File</th>
              <th>File Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepositories.map((repo, index) => (
              <tr key={repo._id}>
                <td>{repo.title}</td>
                <td>{repo.description}</td>
                <td>
                  {repo.file ? (
                    <a href={`http://localhost:3001/uploads/${repo.file}`} target="_blank" rel="noopener noreferrer">
                      {repo.file}
                    </a>
                  ) : (
                    <span>No file uploaded</span>
                  )}
                </td>
                <td>
                  {repo.fileLink ? (
                    <a href={repo.fileLink} target="_blank" rel="noopener noreferrer">
                      {repo.fileLink}
                    </a>
                  ) : (
                    <span>No file link uploaded</span>
                  )}
                </td>
                <td>
                  <Link to={`/editRepository/${repo._id}`}>
                    <button className="edit-btn">Edit</button>
                  </Link>
                  <button className="delete-btn" onClick={() => handleDeleteRequest(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="modaal">
          <div className="modaal-content">
            <h3>Add Repository</h3>
            <label>Title:</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} />
            <label>Description:</label>
            <input type="text" name="description" value={formData.description} onChange={handleInputChange} />
            <label>File:</label>
            <input type="file" onChange={handleFileChange} />
            <label>File Link:</label>
            <input type="text" name="fileLink" value={formData.fileLink} onChange={handleInputChange} />
            <div className="modal-buttons">
              <button onClick={handleAddRepository}>Submit</button>
              <button onClick={handleCloseModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteIndex !== null && (
        <div className="delete-confirmation-modal">
          <div className="delete-modal-content">
            <p>Are you sure you want to delete this repository?</p>
            <div className="modal-buttons">
              <button onClick={handleDeleteConfirm}>Yes</button>
              <button onClick={handleDeleteCancel}>No</button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-center" />
    </div>
  );
};

export default Repository;
