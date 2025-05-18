import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './Edit University.css';
import toast from 'react-hot-toast';

function EditUniversity() {
  const { state } = useLocation(); 
  const navigate = useNavigate();

  const [universityName, setUniversityName] = useState('');
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state && state.university) {
      setUniversityName(state.university.name);
      setCampuses(state.university.campuses);
    }
  }, [state]);

  const token = sessionStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`, 
  };
  console.log(token)

  const handleUniversityChange = (e) => {
    setUniversityName(e.target.value);
  };

  const handleCampusChange = (index, field, value) => {
    const updatedCampuses = [...campuses];
    updatedCampuses[index][field] = value;
    setCampuses(updatedCampuses);
  };

  const handleProgramChange = (campusIndex, programIndex, value) => {
    const updatedCampuses = [...campuses];
    updatedCampuses[campusIndex].programs[programIndex].name = value;
    setCampuses(updatedCampuses);
  };

  const handleAddCampus = () => {
    setCampuses([...campuses, { name: '', programs: [] }]);
  };

  const handleRemoveCampus = (index) => {
    const updatedCampuses = campuses.filter((_, i) => i !== index);
    setCampuses(updatedCampuses);
  };

  const handleAddProgram = (campusIndex) => {
    const updatedCampuses = [...campuses];
    updatedCampuses[campusIndex].programs.push({ name: '' });
    setCampuses(updatedCampuses);
  };

  const handleRemoveProgram = (campusIndex, programIndex) => {
    const updatedCampuses = [...campuses];
    updatedCampuses[campusIndex].programs = updatedCampuses[campusIndex].programs.filter((_, i) => i !== programIndex);
    setCampuses(updatedCampuses);
  };

  const handleSave = async () => {
    if (loading) return; 

    setLoading(true);
    try {
      const updatedUniversity = { name: universityName, campuses };

      await axios.put(
        `http://localhost:3001/api/universities/${state.university._id}`,
        updatedUniversity,
        { headers }
      );

      for (let i = 0; i < campuses.length; i++) {
        if (!campuses[i].name) continue; 

        const campusId = campuses[i]._id;
        if (campusId) {
          await axios.put(
            `http://localhost:3001/api/universities/${state.university._id}/campuses/${campusId}`,
            { name: campuses[i].name },
            { headers }
          );
        }

        for (let j = 0; j < campuses[i].programs.length; j++) {
          if (!campuses[i].programs[j].name) continue; 

          const programId = campuses[i].programs[j]._id; 
          if (programId) {
            await axios.put(
              `http://localhost:3001/api/universities/${state.university._id}/campuses/${campusId}/programs/${programId}`,
              { name: campuses[i].programs[j].name },
              { headers }
            );
          }
        }
      }

      navigate('/superdashboard'); 
    } catch (error) {
      toast.success('University Updated Successfully')
      navigate('/superdashboard'); 

      console.error('Error updating university:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="update-university-container">
      <div className="university-section">
        <h3>Edit University</h3>
        <label>University Name</label>
        <input
          type="text"
          value={universityName}
          onChange={handleUniversityChange}
        />
      </div>

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
              <button className="trash-basket" onClick={() => handleRemoveCampus(campusIndex)}>
                <i className="fa fa-trash"></i>

              </button>
            </div>

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
                    <button className="trash-basket" onClick={() => handleRemoveProgram(campusIndex, programIndex)}>
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

      <button className="save-changes-section" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
}

export default EditUniversity;
