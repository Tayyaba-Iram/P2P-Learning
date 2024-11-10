import React, { useState } from 'react';
import axios from 'axios';

export default function AddUniversity() {
  const [newUniversityData, setNewUniversityData] = useState({
    name: '',
    campuses: [{ name: '', programs: [{ name: '' }] }],
  });

  // Handle input changes for university, campuses, and programs
  const handleInputChange = (e, campusIndex = null, programIndex = null) => {
    const { name, value } = e.target;

    setNewUniversityData((prevData) => {
      const updatedData = { ...prevData };

      if (campusIndex === null) {
        // Update university name
        updatedData[name] = value;
      } else if (programIndex === null) {
        // Update campus name
        updatedData.campuses[campusIndex][name] = value;
      } else {
        // Update program name
        updatedData.campuses[campusIndex].programs[programIndex].name = value;
      }

      return updatedData;
    });
  };

  // Add a new university
  const handleAddUniversity = async () => {
    try {
      if (!newUniversityData.name) {
        alert('Please enter a university name');
        return;
      }

      await axios.post('http://localhost:3001/api/uni', newUniversityData);
      alert('University added successfully');
      // Reset form after successful submission
      setNewUniversityData({
        name: '',
        campuses: [{ name: '', programs: [{ name: '' }] }],
      });
    } catch (error) {
      console.error('Error adding university:', error);
      alert('Failed to add university');
    }
  };

  // Add a new campus
  const handleAddCampus = () => {
    setNewUniversityData((prevData) => ({
      ...prevData,
      campuses: [...prevData.campuses, { name: '', programs: [{ name: '' }] }],
    }));
  };

  // Remove a campus
  const handleRemoveCampus = (campusIndex) => {
    setNewUniversityData((prevData) => {
      const updatedCampuses = prevData.campuses.filter((_, index) => index !== campusIndex);
      return { ...prevData, campuses: updatedCampuses };
    });
  };

  // Add a new program to a campus
  const handleAddProgram = (campusIndex) => {
    setNewUniversityData((prevData) => {
      const updatedCampuses = [...prevData.campuses];
      const lastProgram = updatedCampuses[campusIndex].programs.at(-1);

      // Add a new program field only if the last one is not empty
      if (lastProgram && lastProgram.name.trim() !== '') {
        updatedCampuses[campusIndex].programs.push({ name: '' });
      }

      return { ...prevData, campuses: updatedCampuses };
    });
  };

  // Remove a program from a campus
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
    <div className="add-form">
      <h2>Add University</h2>
      <label>
        University Name:
        <input
          type="text"
          name="name"
          value={newUniversityData.name}
          onChange={(e) => handleInputChange(e)}
        />
      </label>

      {newUniversityData.campuses.map((campus, campusIndex) => (
        <div key={campusIndex} className="campus-section">
          <h3>Campus {campusIndex + 1}</h3>
          <label>
            Campus Name:
            <input
              type="text"
              name="name"
              value={campus.name}
              onChange={(e) => handleInputChange(e, campusIndex)}
            />
          </label>
          <button onClick={() => handleRemoveCampus(campusIndex)}>Remove Campus</button>

          {campus.programs.map((program, programIndex) => (
            <div key={programIndex} className="program-section">
              <label>
                Program Name:
                <input
                  type="text"
                  name="program"
                  value={program.name}
                  onChange={(e) => handleInputChange(e, campusIndex, programIndex)}
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
    </div>
  );
}
