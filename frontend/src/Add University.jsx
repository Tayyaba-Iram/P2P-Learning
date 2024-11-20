import React, { useState } from 'react';
import axios from 'axios';
import './Add University.css';
import { useNavigate } from 'react-router-dom';

function AddUniversity() {
  const [newUniversityData, setNewUniversityData] = useState({
    name: '',
    campuses: [{ name: '', programs: [{ name: '' }] }],
  });
  const navigate = useNavigate();

  const handleInputChange = (e, campusIndex = null, programIndex = null) => {
    const { name, value } = e.target;
    setNewUniversityData((prevData) => {
      const updatedData = { ...prevData };
      if (campusIndex === null) {
        updatedData[name] = value;
      } else if (programIndex === null) {
        updatedData.campuses[campusIndex][name] = value;
      } else {
        updatedData.campuses[campusIndex].programs[programIndex].name = value;
      }
      return updatedData;
    });
  };

  const handleAddUniversity = async () => {
    try {
      if (!newUniversityData.name) {
        alert('Please enter a university name');
        return;
      }
      await axios.post('http://localhost:3001/api/uni', newUniversityData);
      alert('University added successfully');
      setNewUniversityData({
        name: '',
        campuses: [{ name: '', programs: [{ name: '' }] }],
      });
      navigate('/superdashboard');
    } catch (error) {
      console.error('Error adding university:', error);
      alert('Failed to add university');
    }
  };

  const handleAddCampus = () => {
    setNewUniversityData((prevData) => {
      // Get the last campus from the campuses array
      const lastCampus = prevData.campuses[prevData.campuses.length - 1];
  
      // Check if the last campus name is filled before adding a new one
      if (lastCampus.name.trim() !== '') {
        return {
          ...prevData,
          campuses: [...prevData.campuses, { name: '', programs: [{ name: '' }] }],
        };
      } else {
        // Optionally, you can add a message here or alert
        alert('Please fill in the last campus name before adding a new one.');
        return prevData; // Return without adding a new campus
      }
    });
  };
  

  const handleRemoveCampus = (campusIndex) => {
    setNewUniversityData((prevData) => {
      if (prevData.campuses.length === 1) {
        alert('You must have at least one campus.');
        return prevData;
      }
      const updatedCampuses = prevData.campuses.filter((_, index) => index !== campusIndex);
      return { ...prevData, campuses: updatedCampuses };
    });
  };

  const handleAddProgram = (campusIndex) => {
    setNewUniversityData((prevData) => {
      const updatedCampuses = [...prevData.campuses];
  
      // Add a new program only if the last program is filled
      const lastProgram = updatedCampuses[campusIndex].programs[updatedCampuses[campusIndex].programs.length - 1];
      
      if (lastProgram && lastProgram.name.trim() !== '') {
        // Only add one new program if the last program is not empty
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

  const getDisabledClass = (condition) => (condition ? 'disabled-button' : '');

  return (
    <div className="add-form">
      <h3>Add University</h3>
      <label  htmlFor="name"> University Name  </label>
        <input type="text" name="name" value={newUniversityData.name} onChange={(e) => handleInputChange(e)}  />
      {newUniversityData.campuses.map((campus, campusIndex) => (
        <div key={campusIndex} >
        

          <h3>Campus {campusIndex + 1}</h3>
        
            <label>
              Campus Name </label>
              <div className='campus'>
              <input
                type="text"
                name="name"
                value={campus.name}
                onChange={(e) => handleInputChange(e, campusIndex)}
              />
           
            
           <button
  onClick={() => handleRemoveCampus(campusIndex)}
  className={`remove-campus-button ${getDisabledClass(newUniversityData.campuses.length === 1)}`}
  disabled={newUniversityData.campuses.length === 1}
>
  <i className="fa fa-trash"></i>
</button>

          </div>
          
          {campus.programs.map((program, programIndex) => (
            <div key={programIndex} className="program-section">
              
              <label>
                Program {programIndex+1}:  </label>
                <div className='program'>
                <input
                  type="text"
                  name="program"
                  value={program.name}
                  onChange={(e) => handleInputChange(e, campusIndex, programIndex)}
                />
            
            <button
  onClick={() => handleRemoveProgram(campusIndex, programIndex)}
  className={`remove-program-button ${getDisabledClass(campus.programs.length === 1)}`}
  disabled={campus.programs.length === 1}
>
  <i className="fa fa-trash"></i>
</button>

          </div>
            </div>
          ))}  
          <button className='add-campus' onClick={() => handleAddProgram(campusIndex)}> Add Program</button>

        </div>
        
      ))}
        <button className='add-campus' onClick={handleAddCampus}>Add Campus</button>
      <button className='add-uni' onClick={handleAddUniversity}>Add University</button>
    </div>
  );
}

export default AddUniversity;
