import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './Edit University.css';
import toast from 'react-hot-toast';

function EditUniversity() {
  const { state } = useLocation(); // Get the university data passed from the Dashboard
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

  // Get token from local storage
  const token = sessionStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`, // Add token to headers for authentication
  };
console.log(token)
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

    setLoading(true); // Set loading state while saving
    try {
      const updatedUniversity = { name: universityName, campuses };

      // Save university name
      await axios.put(
        `http://localhost:3001/api/universities/${state.university._id}`,
        updatedUniversity,
        { headers }
      );

      // Save campus and program data
      for (let i = 0; i < campuses.length; i++) {
        if (!campuses[i].name) continue; // Skip invalid campuses

        const campusId = campuses[i]._id; // Get the campus _id
        if (campusId) {
          // Update campus data using the campus _id
          await axios.put(
            `http://localhost:3001/api/universities/${state.university._id}/campuses/${campusId}`,
            { name: campuses[i].name },
            { headers }
          );
        }

        for (let j = 0; j < campuses[i].programs.length; j++) {
          if (!campuses[i].programs[j].name) continue; // Skip invalid programs

          const programId = campuses[i].programs[j]._id; // Get the program _id
          if (programId) {
            // Update program data using the program _id
            await axios.put(
              `http://localhost:3001/api/universities/${state.university._id}/campuses/${campusId}/programs/${programId}`,
              { name: campuses[i].programs[j].name },
              { headers }
            );
          }
        }
      }

      navigate('/superdashboard'); // Navigate to dashboard after saving
    } catch (error) {
      toast.success('University Updated Successfully')
      navigate('/superdashboard'); // Navigate to dashboard after saving
     
      console.error('Error updating university:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false); // Reset loading state after the save is completed
    }
  };

  return (
    <div className="update-university-container">
      {/* University Section */}
      <div className="university-section">
        <h3>Edit University</h3>
        <label>University Name</label>
        <input
          type="text"
          value={universityName}
          onChange={handleUniversityChange}
        />
      </div>

      {/* Campuses Section */}
      <div className="campuses-section">
        {campuses.map((campus, campusIndex) => (
          <div key={campusIndex} className="campus-item">
            <h3>Campus {campusIndex + 1}</h3>
            <div className="campus-set">
              <input
                type="text"
                value={campus.name}
                onChange={(e) => handleCampusChange(campusIndex, 'name', e.target.value)}
              />
              <button onClick={() => handleRemoveCampus(campusIndex)}>
                <i className="fa fa-trash"></i>
              </button>
            </div>

            {/* Programs Section */}
            <div className="programs-section">
              <h3>Programs</h3>
              {campus.programs.map((program, programIndex) => (
                <div key={programIndex} className="program-item">
                  <label>Program {programIndex + 1}</label>
                  <div className="program-set">
                    <input
                      type="text"
                      value={program.name}
                      onChange={(e) => handleProgramChange(campusIndex, programIndex, e.target.value)}
                    />
                    <button onClick={() => handleRemoveProgram(campusIndex, programIndex)}>
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
              <button className="main-buttons" onClick={() => handleAddProgram(campusIndex)}>
                Add Program
              </button>
            </div>
          </div>
        ))}
        <button className="main-buttons" onClick={handleAddCampus}>
          Add Campus
        </button>
      </div>

      {/* Save Changes Section */}
      <button className="save-changes-section" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
}

export default EditUniversity;
