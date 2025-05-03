import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Repository.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Repository = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
  const navigate = useNavigate();

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
          placeholder="🔍︎ Search by Title, or Description..."
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
      <button
        onClick={() => navigate('/addRepository')}
        className="add-repository-btn"
      >
        Add Repository
      </button>

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
              <th>Access Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepositories.map((repo, index) => (
              <tr key={repo._id}>
                <td>{repo.title}</td>
                <td>{repo.description}</td>
                <td>
                  {repo.file &&
                    repo.file !== '' &&
                    repo.file !== 'No File Uploaded' &&
                    repo.file !== null &&
                    !repo.file.toLowerCase().includes('no file uploaded') ? (
                    <a href={`http://localhost:3001/uploads/${repo.file}`} target="_blank" rel="noopener noreferrer">
                      {repo.file}
                    </a>
                  ) : (
                    <span>No file uploaded</span>
                  )}
                </td>

                <td>
                  {repo.fileLink &&
                    repo.fileLink !== '' &&
                    repo.fileLink !== 'No File Link uploaded' &&
                    repo.fileLink !== null &&
                    !repo.fileLink.toLowerCase().includes('no file link uploaded') ? (
                    <a href={repo.fileLink} target="_blank" rel="noopener noreferrer">
                      {repo.fileLink}
                    </a>
                  ) : (
                    <span>No file link uploaded</span>
                  )}
                </td>

                <td>
                  {repo.accessType === 'specific' ? (
                    <div>
                      {repo.allowedStudent && repo.allowedStudent.length > 0 ? (
                        repo.allowedStudent.map((student, index) => (
                          <div key={index} className="student-info">
                          <strong>{student.name}</strong> 
                          <p>{student.email}</p>
                        </div>
                        
                        ))
                      ) : (
                        <span>No specific students allowed</span>
                      )}
                    </div>
                  ) : (
                    <span>{repo.accessType || 'N/A'}</span>
                  )}
                </td>
                <td>
                  <div className='repo-buttons'>
                  <Link to={`/editRepository/${repo._id}`}>
                    <button className="edit-repo">Edit</button>
                  </Link>
                  <button className="delete-repo" onClick={() => handleDeleteRequest(index)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
