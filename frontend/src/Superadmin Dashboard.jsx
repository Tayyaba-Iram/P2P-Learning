import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import './Superadmin Dashboard.css';

function Dashboard() {
  const [universities, setUniversities] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [editData, setEditData] = useState({});
  const [newUniversityData, setNewUniversityData] = useState({
    name: '',
    campuses: [
      {
        name: '',
        programs: [{ name: '' }],
      },
    ],
  });

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/universities');
        setUniversities(response.data);
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };
    fetchUniversities();
  }, []);

  const handleDeleteUniversity = async (universityId) => {
    try {
      await axios.delete(`http://localhost:3001/api/universities/${universityId}`);
      setUniversities((prev) => prev.filter((university) => university._id !== universityId));
      alert('University deleted successfully');
    } catch (error) {
      console.error('Error deleting university:', error);
      alert('Failed to delete university');
    }
  };

  const handleDeleteCampus = async (universityId, campusIndex) => {
    try {
      const campusId = universities.find((u) => u._id === universityId).campuses[campusIndex]._id;
      await axios.delete(`http://localhost:3001/api/universities/${universityId}/campuses/${campusId}`);
      setUniversities((prevUniversities) => {
        const updatedUniversities = [...prevUniversities];
        const university = updatedUniversities.find((u) => u._id === universityId);
        university.campuses.splice(campusIndex, 1);
        return updatedUniversities;
      });
      alert('Campus deleted successfully');
    } catch (error) {
      console.error('Error deleting campus:', error);
      alert('Failed to delete campus');
    }
  };

  const handleDeleteProgram = async (universityId, campusId, programId) => {
    try {
      await axios.delete(`http://localhost:3001/api/universities/${universityId}/campuses/${campusId}/programs/${programId}`);
      setUniversities((prevUniversities) => {
        const updatedUniversities = [...prevUniversities];
        const university = updatedUniversities.find((u) => u._id === universityId);
        const campus = university.campuses.find((c) => c._id === campusId);
        campus.programs = campus.programs.filter((program) => program._id !== programId);
        return updatedUniversities;
      });
      alert('Program deleted successfully');
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('Failed to delete program');
    }
  };
  

  const handleEditClick = (university) => {
    setSelectedUniversity(university);
    setEditData(JSON.parse(JSON.stringify(university))); // Deep copy for editing
    setEditMode(true);
  };

  const handleAddClick = () => {
    setNewUniversityData({
      name: '',
      campuses: [{ name: '', programs: [{ name: '' }] }],
    });
    setAddMode(true);
  };

  const handleInputChange = (e, campusIndex, programIndex, isEditMode = true) => {
    const { name, value } = e.target;
    const data = isEditMode ? { ...editData } : { ...newUniversityData };

    if (typeof campusIndex === 'number' && typeof programIndex === 'number') {
      data.campuses[campusIndex].programs[programIndex][name] = value;
    } else if (typeof campusIndex === 'number') {
      data.campuses[campusIndex][name] = value;
    } else {
      data[name] = value;
    }

    isEditMode ? setEditData(data) : setNewUniversityData(data);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3001/api/universities/${editData._id}`, editData);
      setUniversities((prevUniversities) => prevUniversities.map((u) => (u._id === editData._id ? editData : u)));
      setEditMode(false);
      alert('University updated successfully');
    } catch (error) {
      console.error('Error updating university:', error);
      alert('Failed to update university');
    }
  };

  const handleAddUniversity = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/uni', newUniversityData);
      setUniversities([...universities, response.data]);
      setAddMode(false);
      alert('University added successfully');
    } catch (error) {
      console.error('Error adding university:', error);
      alert('Failed to add university');
    }
  };

  const handleAddCampus = () => {
    setNewUniversityData((prevData) => ({
      ...prevData,
      campuses: [...prevData.campuses, { name: '', programs: [{ name: '' }] }],
    }));
  };

  const handleRemoveCampus = (campusIndex) => {
    setNewUniversityData((prevData) => {
      const updatedCampuses = prevData.campuses.filter((_, index) => index !== campusIndex);
      return { ...prevData, campuses: updatedCampuses };
    });
  };

  const handleAddProgram = (campusIndex) => {
    setNewUniversityData((prevData) => {
      const updatedCampuses = [...prevData.campuses];
      const lastProgram = updatedCampuses[campusIndex].programs[updatedCampuses[campusIndex].programs.length - 1];

      if (lastProgram && lastProgram.name !== '') {
        updatedCampuses[campusIndex].programs.push({ name: '' });
      }

      return { ...prevData, campuses: updatedCampuses };
    });
  };

  const handleRemoveProgram = (campusIndex, programIndex) => {
    setNewUniversityData((prevData) => {
      const updatedCampuses = [...prevData.campuses];
      if (updatedCampuses[campusIndex].programs.length > 1) {
        updatedCampuses[campusIndex].programs.splice(programIndex, 1);
      }
      return { ...prevData, campuses: updatedCampuses };
    });
  };

  return (
    <div className="container">
      <main className="main-content">
        <h1>Universities</h1>
        {editMode ? (
          <div className="edit-form">
           <h2>Edit University</h2>
            <label>
              University Name:
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={(e) => handleInputChange(e)}
              />
            </label>
            {editData.campuses.map((campus, campusIndex) => (
              <div key={campusIndex}>
                <h3>Edit Campus {campusIndex + 1}</h3>
                <label>
                  Campus Name:
                  <input
                    type="text"
                    name="name"
                    value={campus.name}
                    onChange={(e) => handleInputChange(e, campusIndex)}
                  />
                </label>
                <button onClick={() => handleDeleteCampus(editData._id, campusIndex)}>Remove Campus</button>
                {campus.programs.map((program, programIndex) => (
                  <div key={programIndex}>
                    <h4>Edit Program {programIndex + 1}</h4>
                    <label>
                      Program Name:
                      <input
                        type="text"
                        name="name"
                        value={program.name}
                        onChange={(e) => handleInputChange(e, campusIndex, programIndex)}
                      />
                    </label>
                    <button onClick={() => handleDeleteProgram(editData._id, campusIndex, programIndex)}>Remove Program</button>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        ) : addMode ? (
          <div className="add-form">
            <h2>Add University</h2>
            <label>
              University Name:
              <input
                type="text"
                name="name"
                value={newUniversityData.name}
                onChange={(e) => handleInputChange(e, null, null, false)}
              />
            </label>
            {newUniversityData.campuses.map((campus, campusIndex) => (
              <div key={campusIndex}>
                <h3>Campus {campusIndex + 1}</h3>
                <label>
                  Campus Name:
                  <input
                    type="text"
                    name="name"
                    value={campus.name}
                    onChange={(e) => handleInputChange(e, campusIndex, null, false)}
                  />
                </label>
                <button onClick={() => handleRemoveCampus(campusIndex)}>Remove Campus</button>
                {campus.programs.map((program, programIndex) => (
                  <div key={programIndex}>
                    <h4>Program {programIndex + 1}</h4>
                    <label>
                      Program Name:
                      <input
                        type="text"
                        name="name"
                        value={program.name}
                        onChange={(e) => handleInputChange(e, campusIndex, programIndex, false)}
                      />
                    </label>
                    <button onClick={() => handleRemoveProgram(campusIndex, programIndex)}>Remove Program</button>
                  </div>
                ))}
                <button onClick={() => handleAddProgram(campusIndex)}>Add Program</button>
              </div>
            ))}
            <button onClick={handleAddCampus}>Add Campus</button>
            <button onClick={handleAddUniversity}>Add University</button>
            <button onClick={() => setAddMode(false)}>Cancel</button>
          </div>
        ) : (
          <div>
         <Link to="/adminregisteration"><button className="btn">Add Admin</button></Link>
            <button onClick={handleAddClick}>Add University</button>
            <ul>
              {universities.map((university) => (
                <li key={university._id}>
                  <h2>{university.name}</h2>
                  <button onClick={() => handleEditClick(university)}>Edit</button>
                  <button onClick={() => handleDeleteUniversity(university._id)}>Delete University</button>
                  {university.campuses.map((campus, campusIndex) => (
                    <div key={campus._id}>
                      <h3>{campus.name}</h3>
                      <button onClick={() => handleDeleteCampus(university._id, campusIndex)}>Delete Campus</button>
                      {campus.programs.map((program, programIndex) => (
                        <div key={program._id}>
                          <h4>{program.name}</h4>
                          <button onClick={() => handleDeleteProgram(university._id, campusIndex, programIndex)}>Delete Program</button>
                        </div>
                      ))}
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
