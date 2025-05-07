import express from 'express';
import BroadcastRequest from '../models/BroadcastRequest.js';
import VerifiedStudentModel from '../models/VerifiedStudent.js';  // Use the correct model
import verifyUser from '../middleware/verifyUser.js';  // Import the middleware
import University from '../models/University.js'; // Note the .js extension

const router = express.Router();


router.post('/broadcastRequest', verifyUser, async (req, res) => {
  try {
    const { topic, subtopic, urgency, programs } = req.body;

    const userId = req.user.id || req.user._id; // Get user ID from the token middleware

    // Create a new BroadcastRequest instance with the provided data
    const newRequest = new BroadcastRequest({
      topic,
      subtopic,
      urgency,
      programs, // programs should be an array of strings
      userId,
      name: req.user.name,  // Assuming 'name' is part of the logged-in user's data
      email: req.user.email, // Assuming 'email' is part of the logged-in user's data
    });

    // Save the new request in the database
    await newRequest.save();

    // Fetch students whose program is in the 'programs' array and is verified
    const matchedStudents = await VerifiedStudentModel.find({
      program: { $in: programs }, // Match programs against the list of programs in the request
      isVerified: true, // Ensure the students are verified
    });
    console.log("Matched Students:", matchedStudents);
    // For each matched student, log their name and program
    matchedStudents.forEach(student => {
      console.log(`Request sent to: ${student.name} (${student.program})`);
    });

    // Send a response with the newly created request
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error in broadcast request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET route to fetch all broadcast requests for the logged-in user
router.get('/get-broadcastRequest', verifyUser, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; // Get from token

    const requests = await BroadcastRequest.find({ userId });
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// DELETE route to delete a specific broadcast request
router.delete('/delete-broadcastRequest/:id', verifyUser, async (req, res) => {
  try {
    const deletedRequest = await BroadcastRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting broadcast request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/broadcastRequest-By-Programs', verifyUser, async (req, res) => {
  try {
    const student = await VerifiedStudentModel.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentProgram = student.program; // e.g., "BSSE"

    const matchingRequests = await BroadcastRequest.find({
      programs: { $in: [studentProgram] },
      userId: { $ne: req.user._id } // exclude current user's requests
    });
   // ✅ Log each matching request to console
   console.log('Matching Broadcast Requests:');
   matchingRequests.forEach((request, index) => {
     console.log(`${index + 1}.`, request);
   });
    res.status(200).json(matchingRequests);
  } catch (error) {
    console.error('Error fetching filtered broadcast requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Fetch programs for logged-in user's university
router.get('/fetchPrograms', verifyUser, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;  // Get user from token middleware
    console.log('User ID:', userId);  // Log userId

    // Get the university of the logged-in user from VerifiedStudentModel
    const user = await VerifiedStudentModel.findById(userId).select('university');
    console.log('Fetched User:', user);  // Log user data

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const universityName = user.university;  // University name
    console.log('University Name:', universityName);  // Log universityName

    // Fetch the university from the UniversityModel to get the associated campuses and programs
    const university = await University.findOne({ name: universityName }).select('campuses');
    console.log('Fetched University:', university);  // Log university data

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    // Initialize an array to hold the program names
    let programNames = [];

    // Loop through each campus and add its programs' names
    university.campuses.forEach(campus => {
      campus.programs.forEach(program => {
        // Add the program name (assuming each program has a 'name' field)
        programNames.push(program.name);
      });
    });

    console.log('Program Names:', programNames);  // Log program names array

    if (programNames.length === 0) {
      return res.status(404).json({ message: 'No programs found for this university' });
    }

    // Send the program names to frontend
    res.status(200).json(programNames);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




export default router;
