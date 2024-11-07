import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import StudentModel from './models/Student.js';  // Import StudentModel
import studentRoutes from './routes/studentRoutes.js';
import auth from './routes/auth.js'
import sessionRoutes from './routes/sessionsRoutes.js';


const app = express();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));



// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/P2P-Learning')
  .then(() => {
    console.log('Connected to MongoDB');

    const studentsData = [
      {
        name: 'John Doe',
        sapid: '30001',
        email: '30001@students.riphah.edu.pk',
        cnic: '00000-0000000-0',
        university: 'Riphah',
        levelOfStudy: 'Undergraduate',
        campus: 'Gulberg Greens',
        program: 'Cyber Security',
        semester: 1,
      },
      {
        name: 'Jane Smith',
        sapid: '30002',
        email: '30002@students.riphah.edu.pk',
        cnic: '11111-1111111-1',
        university: 'Riphah',
        levelOfStudy: 'Undergraduate',
        campus: 'Gulberg Greens',
        program: 'Software Engineering',
        semester: 2
      },
    ];

    // Insert initial student data
    StudentModel.insertMany(studentsData)
      .then(() => {
        console.log('Students saved successfully');
      })
      .catch(err => console.error('Error saving students:', err));
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));


  

// Use student routes
app.use('/api', studentRoutes);
app.use('/api', auth);
app.use('/api', sessionRoutes);

// Start the server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
