// routes/register.js
import express from 'express';
import StudentModel from '../models/Student.js';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
import verifyUser from '../middleware/verifyUser.js'; // Import the middleware

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

// Fetch the logged-in student's profile data
router.get('/get-profile', verifyUser, async (req, res) => {
  try {
    // Use the email from the verified token
    const userEmail = req.email;

    // Fetch the user's data from the database
    const student = await VerifiedStudentModel.findOne({ email: userEmail });

    // Check if the student exists
    if (!student) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return the student data as a response
    res.status(200).json({ 
      success: true,
      user: {
        name: student.name,
        email: student.email,
        phone: student.phone,
        university: student.university,
        campus: student.campus,
        program: student.program,
        semester: student.semester,
        specification: student.specification,
        password: student.password,
        cpassword: student.cpassword,
      }
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ success: false, message: 'An error occurred while fetching profile data.' });
  }
});

router.put('/update-profile', verifyUser, async (req, res) => {
  const { phone, campus, program, semester, specification, password, cpassword } = req.body;

  try {
    // Use the email from the verified token
    const userEmail = req.email;

    // Fetch the user's data from the VerifiedStudentModel
    const student = await VerifiedStudentModel.findOne({ email: userEmail });

    // Check if the student exists
    if (!student) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields only if they are provided in the request body
    if (phone) student.phone = phone;
    if (campus) student.campus = campus;
    if (program) student.program = program;
    if (semester) student.semester = semester;
    if (specification) student.specification = specification;

    // Update password and confirm password if both are provided
    if (password && cpassword) {
      if (password !== cpassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
      }
      student.password = password;
      student.cpassword = cpassword;
    }

    // Save the updated student profile
    await student.save();

    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: 'An error occurred while updating profile.' });
  }
});



export default router;
