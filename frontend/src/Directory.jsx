import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Directory.css';

function Directory() {
  const [repositories, setRepositories] = useState([]);
  const [filteredRepositories, setFilteredRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequests, setSentRequests] = useState([]);

  useEffect(() => {
    fetchRepositories();
    fetchSentRequests();
  }, []);

  const fetchSentRequests = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/my-resource-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (Array.isArray(res.data)) {
        setSentRequests(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch sent requests:', error);
    }
  };

  const fetchRepositories = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/directory', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && Array.isArray(res.data)) {
        setRepositories(res.data);
        setFilteredRepositories(res.data);
      } else {
        console.warn('Unexpected data format received:', res.data);
        setRepositories([]);
      }
    } catch (err) {
      console.error('Error fetching repositories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (repoId) => {
    try {
      const token = sessionStorage.getItem('token');
  
      // Check if there's a rejected request already
      const existingRequest = sentRequests.find(r => r.repoId === repoId && r.status.toLowerCase() === 'rejected');
      if (existingRequest) {
        // Delete the rejected request
        await axios.delete(`http://localhost:3001/api/cancel-request/${repoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
  
      // Now send the new request
      await axios.post('http://localhost:3001/api/request-resource', { repoId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      fetchSentRequests(); // Refresh request list
    } catch (error) {
      alert(error.response?.data?.message || 'Error sending request');
    }
  };
  

  const handleCancelRequest = async (repoId) => {
    try {
      await axios.delete(`http://localhost:3001/api/cancel-request/${repoId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      fetchSentRequests();
    } catch (error) {
      alert('Failed to cancel request');
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const lowercasedSearchTerm = value.toLowerCase();
    const filtered = repositories.filter((repo) => {
      return (
        (repo.uploadedByStudent && repo.uploadedByStudent.toLowerCase().includes(lowercasedSearchTerm)) ||
        (repo.uploadedByEmail && repo.uploadedByEmail.toLowerCase().includes(lowercasedSearchTerm)) ||
        (repo.title && repo.title.toLowerCase().includes(lowercasedSearchTerm)) ||
        (repo.description && repo.description.toLowerCase().includes(lowercasedSearchTerm))
      );
    });

    setFilteredRepositories(filtered);
  };

  if (loading) return <div>Loading repositories...</div>;

  return (
    <div className="directory-container">
      <h2>Peer-Uploaded Repositories</h2>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <input
          className="directory-search"
          type="text"
          placeholder="Search by Name, Email, Title, or Description..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            padding: '10px',
            width: '60%',
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      {filteredRepositories.length === 0 ? (
        <p>No repositories found.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th>#</th>
              <th>Student Name</th>
              <th>Student Email</th>
              <th>Title</th>
              <th>Description</th>
              <th>Access Type</th>
              <th>File</th>
              <th>File Link</th>
              <th>Request</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepositories.map((repo, index) => {
              const request = sentRequests.find(r => r.repoId === repo._id);

              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{repo.uploadedByStudent || 'N/A'}</td>
                  <td>{repo.uploadedByEmail || 'N/A'}</td>
                  <td>{repo.title}</td>
                  <td>{repo.description}</td>
                  <td>{repo.accessType}</td>
                  <td>
                    {repo.file === 'Restricted' ? 'Restricted' :
                      repo.file && repo.file.trim() !== '' && repo.file.toLowerCase() !== 'no file uploaded' ? (
                        <a
                          href={`http://localhost:3001/uploads/${repo.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {repo.file}
                        </a>
                      ) : 'No file uploaded'}
                  </td>
                  <td>
                    {repo.fileLink === 'Restricted' ? 'Restricted' :
                      repo.fileLink && repo.fileLink.trim() !== '' && repo.fileLink.toLowerCase() !== 'no file link uploaded' ? (
                        <a href={repo.fileLink} target="_blank" rel="noopener noreferrer">
                          {repo.fileLink}
                        </a>
                      ) : 'No file link uploaded'}
                  </td>
                  <td>
  {(() => {
    const isRestricted = repo.file === 'Restricted' || repo.fileLink === 'Restricted';
    const isPrivateOrRestricted = repo.accessType === 'private' || isRestricted;

    if (isPrivateOrRestricted) {
      if (request) {
        const status = request.status.toLowerCase();
        if (status === 'accepted' && !isRestricted) {
          return <span style={{ color: 'gray' }}>Access Granted</span>;
        } else if (status === 'rejected') {
          // Show request button again if rejected
          return (
            <button
              onClick={() => handleSendRequest(repo._id)}
              style={{ backgroundColor: 'green', color: 'white', padding: '5px 10px', borderRadius: '5px' }}
            >
              Request
            </button>
          );
        } else {
          return (
            <button
              onClick={() => handleCancelRequest(repo._id)}
              style={{ backgroundColor: 'red', color: 'white', padding: '5px 10px', borderRadius: '5px' }}
            >
              Cancel Request
            </button>
          );
        }
      } else {
        return (
          <button
            onClick={() => handleSendRequest(repo._id)}
            style={{ backgroundColor: 'green', color: 'white', padding: '5px 10px', borderRadius: '5px' }}
          >
            Request
          </button>
        );
      }
    } else {
      return <span style={{ color: 'gray' }}>Access Granted</span>;
    }
  })()}
</td>


                  <td>
                    {(() => {
                      if (!request) return <span style={{ color: 'gray' }}>Not Requested</span>;
                      const statusColor = request.status === 'Accepted' ? 'green'
                                        : request.status === 'Pending' ? 'orange'
                                        : request.status === 'Rejected' ? 'red'
                                        : 'gray';
                      return <span style={{ fontWeight: 'bold', color: statusColor }}>{request.status}</span>;
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Directory;
