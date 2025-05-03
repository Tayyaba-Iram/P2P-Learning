import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select'; // Import Select for dropdown
import './EditRepository.css'
import toast, { Toaster } from 'react-hot-toast';

export default function EditRepository() {
  const { repoId } = useParams();
  const [repo, setRepo] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [fileName, setFileName] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [accessType, setAccessType] = useState('public');  // To track selected access type
  const [students, setStudents] = useState([]);  // To hold list of students
  const [studentOptions, setStudentOptions] = useState([]); // For populating Select dropdown
  const [allowedStudent, setAllowedStudent] = useState([]); // For storing selected students
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
          setFileLink(response.data.repository.fileLink || '');
          setFileName(response.data.repository.file || '');
          setAccessType(response.data.repository.accessType || 'public');
          setAllowedStudent(response.data.repository.allowedStudent || []); // Set allowed students from API
        } else {
          console.error('Error:', response.data.message);
        }
      } catch (err) {
        console.error('Error fetching repository:', err);
      }
    };

    fetchRepo();
  }, [repoId, token]);

  // Fetch the list of students for "specific" access
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/repo-verifiedStudents', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const studentData = response.data;
        setStudents(studentData);
        // Prepare student options for Select dropdown
        const options = studentData.map(student => ({
          value: student.email,
          label: `${student.name} (${student.email})`,
        }));
        setStudentOptions(options);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewFile(file);
    setFileName(file.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    if (newFile) {
      formData.append('file', newFile);
    }

    formData.append('fileLink', fileLink);
    formData.append('accessType', accessType);
    formData.append('allowedStudent', JSON.stringify(allowedStudent)); // Pass allowed students as JSON string

    try {
      const response = await axios.put(
        `http://localhost:3001/api/updateRepository/${repoId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success('Repository updated successfully!');
        navigate('/repository');
      } else {
        toast.error('Failed to update repository');
      }
    } catch (err) {
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
        value={fileLink || ''}
        placeholder={fileLink ? '' : 'No file uploaded'}
        onChange={(e) => setFileLink(e.target.value)}
      />

      <label>Current File:</label>
      <div>
        {fileName ? (
          <input
            type="text"
            value={fileName}
            readOnly
            className="file-name-input"
          />
        ) : (
          <input
            type="text"
            value="No file chosen"
            readOnly
            className="file-name-input"
          />
        )}
        <label>New File:</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt"
        />
      </div>

      <label>Access Type:</label>
      <div className="radioo-group">
        <div className="radio-repo-container">
          <input
            type="radio"
            id="private"
            name="accessType"
            value="private"
            checked={accessType === 'private'}
            onChange={() => setAccessType('private')}
          />
          <label className="radio-repo" htmlFor="access-private">Private</label>
        </div>
        <div className="radio-repo-container">
          <input
            type="radio"
            id="public"
            name="accessType"
            value="public"
            checked={accessType === 'public'}
            onChange={() => setAccessType('public')}
          />
            <label className="radio-repo" htmlFor="access-public">Public</label>
            </div>

        <div className="radio-repo-container">
          <input
            type="radio"
            id="specific"
            name="accessType"
            value="specific"
            checked={accessType === 'specific'}
            onChange={() => setAccessType('specific')}
          />
            <label className="radio-repo" htmlFor="access-specific">Specific Student</label>
            </div>

        {accessType === 'specific' && (
          <div className='select-student-to-edit'>
            <label className='label-stu'>Select Students:</label>
            <Select
              isMulti
              options={studentOptions}
              value={studentOptions.filter((option) =>
                allowedStudent.some(student => student.email === option.value)
              )}
              onChange={(selectedOptions) => {
                const selectedStudents = selectedOptions
                  ? selectedOptions.map((opt) => ({ name: opt.label.split(' (')[0], email: opt.value }))
                  : [];
                setAllowedStudent(selectedStudents);
              }}
              placeholder="Search and select students..."
              isClearable
            />
          </div>
        )}
      </div>
      <br />
      <button className="update-btn" onClick={handleSubmit}>Update Repository</button>
      <Toaster position="top-center" />
    </div>
  );
}
