import express from 'express';
import BroadcastRequest from '../models/BroadcastRequest.js';
import VerifiedStudentModel from '../models/VerifiedStudent.js';  
import verifyUser from '../middleware/verifyUser.js';  
import University from '../models/University.js'; 

const router = express.Router();

router.post('/broadcastRequest', verifyUser, async (req, res) => {
  try {
    const { topic, subtopic, urgency, programs } = req.body;

    const userId = req.user.id || req.user._id; 

    const newRequest = new BroadcastRequest({
      topic,
      subtopic,
      urgency,
      programs, 
      userId,
      name: req.user.name, 
      email: req.user.email, 
    });

    await newRequest.save();

    const matchedStudents = await VerifiedStudentModel.find({
      program: { $in: programs }, // Match programs against the list of programs in the request
      isVerified: true, 
    });
    console.log("Matched Students:", matchedStudents);
    // For each matched student, log their name and program
    matchedStudents.forEach(student => {
      console.log(`Request sent to: ${student.name} (${student.program})`);
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error in broadcast request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/get-broadcastRequest', verifyUser, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; 

    const requests = await BroadcastRequest.find({ userId });
       console.log('Fetched requests:', requests); 
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


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

    const studentProgram = student.program; 

    const matchingRequests = await BroadcastRequest.find({
      programs: { $in: [studentProgram] },
      userId: { $ne: req.user._id } // exclude current user's requests
    });
   matchingRequests.forEach((request, index) => {
   });
    res.status(200).json(matchingRequests);
  } catch (error) {
    console.error('Error fetching filtered broadcast requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/fetchPrograms', verifyUser, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;  
    console.log('User ID:', userId); 

    const user = await VerifiedStudentModel.findById(userId).select('university');
    console.log('Fetched User:', user); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const universityName = user.university;  

    const university = await University.findOne({ name: universityName }).select('campuses');

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    let programNames = [];

    university.campuses.forEach(campus => {
      campus.programs.forEach(program => {
        programNames.push(program.name);
      });
    });


    if (programNames.length === 0) {
      return res.status(404).json({ message: 'No programs found for this university' });
    }

    res.status(200).json(programNames);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
