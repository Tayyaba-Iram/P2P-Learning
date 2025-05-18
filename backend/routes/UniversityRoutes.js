import express from 'express';
import University from '../models/University.js'; 
import verifyUser from '../middleware/verifyUser.js';  

const router = express.Router();

router.post('/addUniversity', async (req, res) => {
    const { universityName, campuses } = req.body;

   
    if (!universityName || !Array.isArray(campuses) || campuses.length === 0) {
        return res.status(400).send('Invalid data: University and campuses are required!');
    }

    try {
        const updatedUniversity = await University.findOneAndUpdate(
            { name: universityName },
            { $set: { campuses } },
            { new: true, upsert: true } 
        );
        res.status(200).json(updatedUniversity);
    } catch (error) {
        console.error('Error adding/updating university:', error);
        res.status(500).send('Failed to add/update university due to an internal error');
    }
});
router.put('/universities/:id', async (req, res) => {
  const { id } = req.params; 
  const updateData = req.body;

  try {
    // Check if the university exists
    const university = await University.findById(id);

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    const updatedUniversity = await University.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json(updatedUniversity);
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({ message: 'Failed to update university' });
  }
});

router.post('/api/universities/:universityId/campuses', async (req, res) => {
  try {
    const { universityId } = req.params;
    const { name } = req.body; 
    
    const newCampus = { name, programs: [] };
    const updatedUniversity = await University.findByIdAndUpdate(
      universityId,
      { $push: { campuses: newCampus } },
      { new: true }
    );
    res.status(201).json(updatedUniversity);
  } catch (error) {
    res.status(500).json({ message: 'Error adding campus', error });
  }
});

router.post('/api/universities/:universityId/campuses/:campusId/programs', async (req, res) => {
  try {
    const { universityId, campusId } = req.params;
    const { name } = req.body; 
    const updatedUniversity = await University.findOneAndUpdate(
      { _id: universityId, 'campuses._id': campusId },
      { $push: { 'campuses.$.programs': { name } } },
      { new: true }
    );
    res.status(201).json(updatedUniversity);
  } catch (error) {
    res.status(500).json({ message: 'Error adding program', error });
  }
});


router.get('/universities', async (req, res) => {
    try {
        const universities = await University.find(); 
        res.status(200).json(universities);
    } catch (error) {
        console.error('Error fetching universities:', error);
        res.status(500).send('Failed to fetch universities');
    }
});

router.delete('/universities/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUniversity = await University.findByIdAndDelete(id);
        if (!deletedUniversity) {
            return res.status(404).send('University not found');
        }
        res.status(200).send('University deleted successfully');
    } catch (error) {
        console.error('Error deleting university:', error);
        res.status(500).send('Failed to delete university due to an internal error');
    }
});

router.delete('/universities/:universityId/campuses/:campusIndex', async (req, res) => {
    const { universityId, campusIndex } = req.params;

    try {
        const university = await University.findById(universityId);
        if (!university) {
            return res.status(404).send('University not found');
        }

        university.campuses.splice(campusIndex, 1); 
        await university.save();
        
        res.status(200).send('Campus deleted successfully');
    } catch (error) {
        console.error('Error deleting campus:', error);
        res.status(500).send('Failed to delete campus due to an internal error');
    }
});

router.delete('/universities/:universityId/campuses/:campusId/programs/:programId', async (req, res) => {
    const { universityId, campusId, programId } = req.params;

    try {
        const university = await University.findById(universityId);
        if (!university) {
            return res.status(404).send('University not found');
        }

        const campus = university.campuses.id(campusId);
        if (!campus) {
            return res.status(404).send('Campus not found');
        }

        const programIndex = campus.programs.findIndex((program) => program._id.toString() === programId);
        if (programIndex === -1) {
            return res.status(404).send('Program not found');
        }

        campus.programs.splice(programIndex, 1); 
        await university.save();

        res.status(200).send('Program deleted successfully');
    } catch (error) {
        console.error('Error deleting program:', error);
        res.status(500).send('Failed to delete program due to an internal error');
    }
});

router.put('/api/universities/:universityId', verifyUser,async (req, res) => {
    const { name } = req.body;
    try {
      const updatedUniversity = await University.findByIdAndUpdate(
        req.params.id,
        { name },
        { new: true }
      );
      if (!updatedUniversity) {
        return res.status(404).json({ message: 'University not found' });
      }
      res.json(updatedUniversity);
    } catch (error) {
      res.status(500).json({ message: 'Error updating university', error });
    }
  });

router.put('/api/universities/:universityId/campuses/:campusId', async (req, res) => {
  try {
    const { universityId, campusId } = req.params;
    const { name } = req.body;


    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
console.log(university)
    const campus = university.campuses.id(campusId);
    if (!campus) {
      return res.status(404).json({ error: 'Campus not found' });
    }

    campus.name = name;
    await university.save();
console.log(campus)
    res.status(200).json({ message: 'Campus updated successfully' });
  } catch (error) {
    console.error('Backend Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/universities/:universityId/campuses/:campusId/programs/:programId',async (req, res) => {
  const { universityId, campusId, programId } = req.params;
  const { name } = req.body;

  try {
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    // Find the campus
    const campus = university.campuses.id(campusId);
    if (!campus) {
      return res.status(404).json({ error: 'Campus not found' });
    }

    // Find the program
    const program = campus.programs.id(programId);
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Update the program name
    program.name = name;

    await university.save();

    res.status(200).json({ message: 'Program updated successfully' });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/uni', async (req, res) => {
  try {
    const newUniversity = new University(req.body);
    const savedUniversity = await newUniversity.save();
    res.status(201).json(savedUniversity);
  } catch (error) {
    res.status(400).json({ message: 'Error adding university', error });

  }
});

  
export default router;
