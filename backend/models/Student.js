import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sapid: { type: String, required: true },
  email: { type: String, required: true },
  cnic: { type: String, required: true },
  university: { type: String, required: true },
  levelOfStudy: { type: String, required: true },
  campus: { type: String, required: true },
  program: { type: String, required: true },
  semester: { type: Number, required: true },
});

const StudentModel = mongoose.model('Student', studentSchema);


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

export default StudentModel;
