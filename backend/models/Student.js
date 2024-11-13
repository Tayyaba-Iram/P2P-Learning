import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sapid: { type: String, required: true },
  email: { type: String, required: true },
  cnic: { type: String, required: true },
  phone: { type: String, required: true },
  university: { type: String, required: true },
  campus: { type: String, required: true },
  program: { type: String, required: true },
  semester: { type: Number, required: true },
});

const StudentModel = mongoose.model('Student', studentSchema);

const studentsData = [
  {
    name: 'John Doe',
    sapid: '30001',
    email: '35927@students.riphah.edu.pk',
    cnic: '00000-0000000-0',
    phone: '0000-0000000',
    university: 'Riphah',
    campus: 'Gulberg Greens',
    program: 'Cyber Security',
    semester: 1,
  },
  {
    name: 'Jane Smith',
    sapid: '30002',
    email: '30002@students.riphah.edu.pk',
    cnic: '11111-1111111-1',
    phone: '1111-1111111',
    university: 'Riphah',
    campus: 'Gulberg Greens',
    program: 'Software Engineering',
    semester: 2
  },
];

// Insert initial student data if collection is empty
StudentModel.countDocuments()
  .then(count => {
    if (count === 0) {
      return StudentModel.insertMany(studentsData);
    } else {
      console.log('Students already exist in the database. Skipping insertion.');
    }
  })
  .then(() => {
    console.log('Initial student data setup completed.');
  })
  .catch(err => console.error('Error setting up initial student data:', err));

export default StudentModel;
