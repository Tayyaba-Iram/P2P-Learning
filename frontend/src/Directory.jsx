import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Directory.css';

function Directory() {
  const [repositories, setRepositories] = useState([]);
  const [filteredRepositories, setFilteredRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/yourRepositories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && Array.isArray(res.data)) {
        setRepositories(res.data);
        setFilteredRepositories(res.data); // Initially display all repositories
      } else {
        console.warn("Unexpected data format received:", res.data);
        setRepositories([]);
      }
    } catch (err) {
      console.error('Error fetching repositories:', err);
    } finally {
      setLoading(false);
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
      <h2>All Repositories (except yours)</h2>
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
              <th>File</th>
              <th>File Link</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepositories.map((repo, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{repo.uploadedByStudent || 'N/A'}</td>
                <td>{repo.uploadedByEmail || 'N/A'}</td>
                <td>{repo.title}</td>
                <td>{repo.description}</td>
                <td>
                  {repo.file ? (
                    <a
                      href={`http://localhost:3001/uploads/${repo.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {repo.file}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {repo.fileLink ? (
                    <a href={repo.fileLink} target="_blank" rel="noopener noreferrer">
                      {repo.fileLink}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Directory;
