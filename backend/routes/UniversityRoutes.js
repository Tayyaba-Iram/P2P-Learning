import express from 'express';
import University from '../models/University.js'; // Note the .js extension
import verifyUser from '../middleware/verifyUser.js';  // Import the middleware

const router = express.Router();

// Route to add or update a university along with campuses and programs
router.post('/addUniversity', async (req, res) => {
    const { universityName, campuses } = req.body;

    // Validate input
    if (!universityName || !Array.isArray(campuses) || campuses.length === 0) {
        return res.status(400).send('Invalid data: University and campuses are required!');
    }

    try {
        // Upsert university (update if exists, create if not)
        const updatedUniversity = await University.findOneAndUpdate(
            { name: universityName },
            { $set: { campuses } },
            { new: true, upsert: true } // Return the updated document
        );
        res.status(200).json(updatedUniversity);
    } catch (error) {
        console.error('Error adding/updating university:', error);
        res.status(500).send('Failed to add/update university due to an internal error');
    }
});
router.put('/universities/:id', async (req, res) => {
  const { id } = req.params; // University ID
  const updateData = req.body; // Data to update

  try {
    // Check if the university exists
    const university = await University.findById(id);

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    // Update the university document
    const updatedUniversity = await University.findByIdAndUpdate(id, updateData, { new: true });

    // Send back the updated university data
    res.status(200).json(updatedUniversity);
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({ message: 'Failed to update university' });
  }
});
// API route to add a campus to a specific university
router.post('/api/universities/:universityId/campuses', async (req, res) => {
  try {
    const { universityId } = req.params;
    const { name } = req.body; // Assuming you're passing campus name
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

// API route to add a program to a specific campus in a university
router.post('/api/universities/:universityId/campuses/:campusId/programs', async (req, res) => {
  try {
    const { universityId, campusId } = req.params;
    const { name } = req.body; // Assuming you're passing program name
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
        const universities = await University.find(); // Fetch all universities
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

// Route to delete a campus by university ID and campus index
router.delete('/universities/:universityId/campuses/:campusIndex', async (req, res) => {
    const { universityId, campusIndex } = req.params;

    try {
        const university = await University.findById(universityId);
        if (!university) {
            return res.status(404).send('University not found');
        }

        university.campuses.splice(campusIndex, 1); // Remove the campus at the specified index
        await university.save();
        
        res.status(200).send('Campus deleted successfully');
    } catch (error) {
        console.error('Error deleting campus:', error);
        res.status(500).send('Failed to delete campus due to an internal error');
    }
});
// Updated backend route to delete a program by university ID and program ID
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

        campus.programs.splice(programIndex, 1); // Remove the program at the specified index
        await university.save();

        res.status(200).send('Program deleted successfully');
    } catch (error) {
        console.error('Error deleting program:', error);
        res.status(500).send('Failed to delete program due to an internal error');
    }
});

// Route to edit a university's name
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
 // Backend route to update campus
// Updated route to use async/await
router.put('/api/universities/:universityId/campuses/:campusId', async (req, res) => {
  try {
    const { universityId, campusId } = req.params;
    const { name } = req.body;

    // Use async/await instead of callbacks
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
console.log(university)
    const campus = university.campuses.id(campusId);
    if (!campus) {
      return res.status(404).json({ error: 'Campus not found' });
    }

    // Update campus name
    campus.name = name;
    await university.save();
console.log(campus)
    res.status(200).json({ message: 'Campus updated successfully' });
  } catch (error) {
    console.error('Backend Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Backend route to update program using async/await
router.put('/universities/:universityId/campuses/:campusId/programs/:programId',async (req, res) => {
  const { universityId, campusId, programId } = req.params;
  const { name } = req.body;

  try {
    // Find the university using async/await
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

    // Save the updated university document
    await university.save();

    // Send a success response
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
