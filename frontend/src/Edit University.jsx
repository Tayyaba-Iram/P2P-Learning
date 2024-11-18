import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './Edit University.css';

function EditUniversity() {
  const { state } = useLocation();  // Get the university data passed from the Dashboard
  const navigate = useNavigate();

  const [universityName, setUniversityName] = useState('');
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state for saving

  useEffect(() => {
    if (state && state.university) {
      setUniversityName(state.university.name);
      setCampuses(state.university.campuses);
    }
  }, [state]);

  // Handle changes in the university name
  const handleUniversityChange = (e) => {
    setUniversityName(e.target.value);
  };

  // Handle changes in the campus name
  const handleCampusChange = (index, field, value) => {
    const updatedCampuses = [...campuses];
    updatedCampuses[index][field] = value;
    setCampuses(updatedCampuses);
  };

  // Handle changes in program name within a campus
  const handleProgramChange = (campusIndex, programIndex, value) => {
    const updatedCampuses = [...campuses];
    updatedCampuses[campusIndex].programs[programIndex].name = value;
    setCampuses(updatedCampuses);
  };

  // Add a new campus
  const handleAddCampus = () => {
    setCampuses([...campuses, { name: '', programs: [] }]);
  };

  // Remove a campus
  const handleRemoveCampus = (index) => {
    const updatedCampuses = campuses.filter((_, i) => i !== index);
    setCampuses(updatedCampuses);
  };

  // Add a new program to a campus
  const handleAddProgram = (campusIndex) => {
    const updatedCampuses = [...campuses];
    updatedCampuses[campusIndex].programs.push({ name: '' });
    setCampuses(updatedCampuses);
  };

  // Remove a program from a campus
  const handleRemoveProgram = (campusIndex, programIndex) => {
    const updatedCampuses = [...campuses];
    updatedCampuses[campusIndex].programs = updatedCampuses[campusIndex].programs.filter((_, i) => i !== programIndex);
    setCampuses(updatedCampuses);
  };

  // Handle saving the updated university data
  const handleSave = async () => {
    if (loading) return; // Prevent multiple saves

    setLoading(true);  // Set loading state while saving
    try {
      // Save university name
      const updatedUniversity = { name: universityName, campuses };
      await axios.put(`http://localhost:3001/api/universities/${state.university._id}`, updatedUniversity);

      // Save campus data for each campus
      for (let i = 0; i < campuses.length; i++) {
        if (!campuses[i].name) {
          console.error(`Campus ${i} has an invalid name`);
          continue; // Skip invalid campuses
        }

        const campusId = campuses[i]._id; // Get the campus _id
        if (!campusId) {
          console.error(`Campus ${i} does not have a valid _id`);
          continue; // Skip if campus does not have a valid _id
        }

        // Update campus data using the campus _id
        await axios.put(`http://localhost:3001/api/universities/${state.university._id}/campuses/${campusId}`, { name: campuses[i].name });

        // Save program data for each program within the campus
        for (let j = 0; j < campuses[i].programs.length; j++) {
          if (!campuses[i].programs[j].name) {
            console.error(`Program ${j} in campus ${i} has an invalid name`);
            continue; // Skip invalid programs
          }

          const programId = campuses[i].programs[j]._id; // Get the program _id
          if (!programId) {
            console.error(`Program ${j} in campus ${i} does not have a valid _id`);
            continue; // Skip if program does not have a valid _id
          }

          // Update program data using the program _id
          await axios.put(`http://localhost:3001/api/universities/${state.university._id}/campuses/${campusId}/programs/${programId}`, { name: campuses[i].programs[j].name });
        }
      }

      alert('University updated successfully');
      navigate('/superdashboard');
    } catch (error) {
      console.error('Error updating university:', error);
    } finally {
      setLoading(false);  // Reset loading state after the save is completed
    }
  };

  return (
    <div className="edit-university-container">
      <div className='container'>
    <h2>Edit University</h2>
    <label>
      University Name:
      <input
        type="text"
        value={universityName}
        onChange={handleUniversityChange}
      />
    </label>
    
    <h3>Campuses</h3>
    
    {campuses.map((campus, campusIndex) => (
      <div key={campusIndex} className="campus">
        <label>
          Campus {campusIndex + 1}:
          <input
            type="text"
            value={campus.name}
            onChange={(e) => handleCampusChange(campusIndex, 'name', e.target.value)}
          />
        </label>
        <button onClick={() => handleRemoveCampus(campusIndex)}>
          <i className="fa fa-trash"></i>
        </button>
        <h4>Programs</h4>
        {campus.programs.map((program, programIndex) => (
          <div key={programIndex} className="program">
            <label>
              Program {programIndex+1}:
              <input
                type="text"
                value={program.name}
                onChange={(e) => handleProgramChange(campusIndex, programIndex, e.target.value)}
              />
            </label>
            <button onClick={() => handleRemoveProgram(campusIndex, programIndex)}>
              <i className="fa fa-trash"></i>
            </button>
          </div>
        ))}
        <button onClick={() => handleAddProgram(campusIndex)}>
          <i className="fa fa-plus"></i>
        </button>
      </div>
    ))}
    <button onClick={handleAddCampus}>
     Add Campus
    </button>

    <button onClick={handleSave}>Save Changes</button>
  </div></div>
  );
}

export default EditUniversity;
