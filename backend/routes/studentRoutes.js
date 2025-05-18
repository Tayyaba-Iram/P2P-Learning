import express from 'express';
import StudentModel from '../models/Student.js';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
import verifyUser from '../middleware/verifyUser.js'; 

const router = express.Router();

router.post('/registerStudent', async (req, res) => {
  const { name, sapid, email, cnic, phone, university, campus, program, semester,specification, password, cpassword } = req.body;

  console.log('Received data:', {
    name, sapid, email, cnic, phone, university, campus, program, semester,specification, password, cpassword
  });

  try {
    const existingVerifiedStudent = await VerifiedStudentModel.findOne({ email });
    if (existingVerifiedStudent) {
      console.log('Email already registered:', email);
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const student = await StudentModel.findOne({
      name, sapid, email, cnic, phone, university, campus, program,  semester});

    if (student) {
      console.log('Student found:', student);

      const verifiedStudentData = { ...student.toObject(), specification,phone,password, cpassword };

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
    const query = req.query.query || ''; 
    const regex = new RegExp(query, 'i'); 

    const verifiedStudents = await VerifiedStudentModel.find({
      $or: [
        { name: { $regex: regex } },
        { specification: { $regex: regex } },
      ],
    });

    res.status(200).json(verifiedStudents);
  } catch (error) {
    console.error('Error fetching verified students:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});


router.get('/get-profile', verifyUser, async (req, res) => {
  try {
    const userEmail = req.user.email;  
    console.log('Decoded email:', userEmail); 
    const student = await VerifiedStudentModel.findOne({ email: userEmail });
    if (student) {
      console.log('Student Found:', student);
    }
    if (!student) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        name: student.name,
        sapid: student.sapid,
        email: student.email,
        cnic: student.cnic,
        phone: student.phone,
        university: student.university,
        campus: student.campus,
        program: student.program,
        semester: student.semester,
        specification: student.specification,
        password: student.password,  
        cpassword: student.cpassword,  
      },
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ success: false, message: 'An error occurred while fetching profile data.' });
  }
});

router.put('/update-profile', verifyUser, async (req, res) => {
  const { phone, campus, program, semester, specification} = req.body;

  try {
    const userEmail = req.user.email;

    const student = await VerifiedStudentModel.findOne({ email: userEmail });

    if (!student) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (phone) student.phone = phone;
    if (campus) student.campus = campus;
    if (program) student.program = program;
    if (semester) student.semester = semester;
    if (specification) student.specification = specification;

  
    await student.save();

    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: 'An error occurred while updating profile.' });
  }
});
router.put('/update-password', verifyUser, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'Current password, new password, and confirm password are required.' });
  }
  if (currentPassword == newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password must be different!' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'New password and confirm password do not match.' });
  }

  try {
    const userEmail = req.user.email;
    const student = await VerifiedStudentModel.findOne({ email: userEmail });

    if (!student) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (currentPassword !== student.password) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    student.password = newPassword;
    student.cpassword = confirmPassword; 
    await student.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ success: false, message: 'An error occurred while updating the password.' });
  }
});

router.get('/verifiedStudents/:studentId', async (req, res) => {
  const { studentId } = req.params;
  console.log('Fetching student details for studentId:', studentId);

  try {
    const student = await VerifiedStudentModel.findById(studentId);
    if (!student) {
      return res.status(404).send('Student not found');
    }
    res.json(student);
  } catch (error) {
    res.status(500).send('Server error');
  }
});


export default router;
