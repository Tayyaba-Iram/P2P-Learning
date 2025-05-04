import React, { useState } from 'react';
import axios from 'axios';
import './Add University.css';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function AddUniversity() {
  const [newUniversityData, setNewUniversityData] = useState({
    name: '',
    campuses: [{ name: '', programs: [{ name: '' }] }],
  });
  const navigate = useNavigate();

  const handleInputChange = (e, campusIndex = null, programIndex = null) => {
    const { name, value } = e.target;

    // Allow only alphabets and spaces
    if (!/^[a-zA-Z\s]*$/.test(value)) return;

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
      if (!newUniversityData.name) return;

      await axios.post('http://localhost:3001/api/uni', newUniversityData);

      setNewUniversityData({
        name: '',
        campuses: [{ name: '', programs: [{ name: '' }] }],
      });

      toast.success('University added successfully');
      navigate('/superdashboard');
    } catch (error) {
      console.error('Error adding university:', error);
    }
  };

  const handleAddCampus = () => {
    setNewUniversityData((prevData) => {
      const lastCampus = prevData.campuses[prevData.campuses.length - 1];
      if (lastCampus.name.trim() !== '') {
        return {
          ...prevData,
          campuses: [...prevData.campuses, { name: '', programs: [{ name: '' }] }],
        };
      }
      return prevData;
    });
  };

  const handleRemoveCampus = (campusIndex) => {
    setNewUniversityData((prevData) => {
      if (prevData.campuses.length === 1) return prevData;
      const updatedCampuses = prevData.campuses.filter((_, index) => index !== campusIndex);
      return { ...prevData, campuses: updatedCampuses };
    });
  };

  const handleAddProgram = (campusIndex) => {
    setNewUniversityData((prevData) => {
      const updatedCampuses = [...prevData.campuses];
      const lastProgram = updatedCampuses[campusIndex].programs.slice(-1)[0];
      if (lastProgram.name.trim() !== '') {
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
    <form
      className="add-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleAddUniversity();
      }}
    >
      <Toaster position="top-center" />
      <h2>Add University</h2>

      <label htmlFor="name">University Name</label>
      <input
        type="text"
        placeholder="Enter University"
        name="name"
        value={newUniversityData.name}
        onChange={(e) => handleInputChange(e)}
        required
      />

      {newUniversityData.campuses.map((campus, campusIndex) => (
        <div key={campusIndex}>
          <h3>Campus {campusIndex + 1}</h3>
          <label>Campus Name</label>
          <div className="campus">
            <input
              type="text"
              name="name"
              placeholder="Enter Campus"
              value={campus.name}
              onChange={(e) => handleInputChange(e, campusIndex)}
              required
            />
            <button
              type="button"
              style={{
                backgroundColor: 'crimson',
              }}
              onClick={() => handleRemoveCampus(campusIndex)}
              className={`remove-campus-button ${getDisabledClass(
                newUniversityData.campuses.length === 1
              )}`}
              disabled={newUniversityData.campuses.length === 1}
            >
              <i className="fa fa-trash"></i>
            </button>
          </div>

          {campus.programs.map((program, programIndex) => (
            <div key={programIndex} className="program-section">
              <label>Program {programIndex + 1}:</label>
              <div className="program">
                <input
                  type="text"
                  name="program"
                  placeholder="Enter Program"
                  value={program.name}
                  onChange={(e) => handleInputChange(e, campusIndex, programIndex)}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveProgram(campusIndex, programIndex)}
                  className={`remove-program-button ${getDisabledClass(
                    campus.programs.length === 1
                  )}`}
                  disabled={campus.programs.length === 1}
                >
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>
          ))}

          <button type="button" className="add-campus" onClick={() => handleAddProgram(campusIndex)}>
            Add Program
          </button>
        </div>
      ))}

      <button type="button" className="add-campus" onClick={handleAddCampus}>
        Add Campus
      </button>

      <button type="submit" className="add-uni">
        Add University
      </button>
    </form>
  );
}

export default AddUniversity;
