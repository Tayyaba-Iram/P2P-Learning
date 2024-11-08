// routes/register.js
import express from 'express';
import StudentModel from '../models/Student.js';
import VerifiedStudentModel from '../models/VerifiedStudent.js';

const router = express.Router();

// Registration endpoint
router.post('/registerStudent', async (req, res) => {
  const { name, sapid, email, cnic, phone, university, campus, program, semester,specification, password, cpassword } = req.body;

  console.log('Received data:', {
    name, sapid, email, cnic, phone, university, campus, program, semester,specification, password, cpassword
  });

  try {
    // Check if the email already exists in the VerifiedStudentModel collection
    const existingVerifiedStudent = await VerifiedStudentModel.findOne({ email });
    if (existingVerifiedStudent) {
      console.log('Email already registered:', email);
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Check if the student exists in the StudentModel collection
    const student = await StudentModel.findOne({
      name, sapid, email, cnic, phone, university, campus, program,  semester});

    if (student) {
      console.log('Student found:', student);

      // Create a new verified student object, including password fields
      const verifiedStudentData = { ...student.toObject(), specification,phone,password, cpassword };

      // Save to VerifiedStudentModel collection
      const verifiedStudent = new VerifiedStudentModel(verifiedStudentData);
      await verifiedStudent.save();

      console.log('Student verified and saved to verified collection:', verifiedStudent);

      res.status(200).json({ message: 'Registration verified successfully!' });
    } else {
      console.log('No matching student found');
      res.status(400).json({ error: 'Student information does not match our records' });
    }
  } catch (error) {
    console.error('Error during query:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});


router.get('/verifiedStudents', async (req, res) => {
  try {
    const verifiedStudents = await VerifiedStudentModel.find();
    res.status(200).json(verifiedStudents);
    console.log('Student verified and saved to verified collection:', verifiedStudents);

  } catch (error) {
    console.error('Error fetching verified students:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

router.put('/update-profile/:id', async (req, res) => {
  const { id } = req.params;
  const { phone, campus, program, semester, specification, password, cpassword } = req.body;

  // Check if passwords match
  if (password !== cpassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  try {
    const updatedStudent = await VerifiedStudentModel.findByIdAndUpdate(
      id,
      { phone, campus, program, semester, specification, password, cpassword },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



export default router;
