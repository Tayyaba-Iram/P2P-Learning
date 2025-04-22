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
    name: 'Tayyaba Iram',
    sapid: '35722',
    email: '35722@students.riphah.edu.pk',
    cnic: '00000-0000000-0',
    phone: '0000-0000000',
    university: 'Riphah',
    campus: 'Gulberg Greens',
    program: 'BS Software Engineering',
    semester: 7
  },
  {
    name: 'Tayyaba Khan',
    sapid: '35927',
    email: '35927@students.riphah.edu.pk',
    cnic: '11111-1111111-1',
    phone: '1111-1111111',
    university: 'Riphah',
    campus: 'Gulberg Greens',
    program: 'BS Computer Science',
    semester: 8
  },
  {
    name: 'Gulfreen Bibi',
    sapid: '35440',
    email: '35440@students.riphah.edu.pk',
    cnic: '22222-2222222-2',
    phone: '2222-2222222',
    university: 'Riphah',
    campus: 'Gulberg Greens',
    program: 'BS Cyber Security',
    semester: 5
  },
  {
    name: 'Saima Bibi',
    sapid: '10001',
    email: '10001@students.riphah.edu.pk',
    cnic: '33333-3333333-3',
    phone: '3333-3333333',
    university: 'Riphah',
    campus: 'I-14',
    program: 'BS Physics',
    semester: 2
  },
  {
    name: 'Taleeha Tahoor',
    sapid: '10002',
    email: '10002@students.riphah.edu.pk',
    cnic: '44444-4444444-4',
    phone: '4444-4444444',
    university: 'Riphah',
    campus: 'I-14',
    program: 'BS Electrical Engineering',
    semester: 3
  },
  {
    name: 'Iqra Waheed',
    sapid: '10003',
    email: '10003@students.riphah.edu.pk',
    cnic: '55555-5555555-5',
    phone: '5555-5555555',
    university: 'Riphah',
    campus: 'G-7',
    program: 'AI',
    semester: 8
  },
  {
    name: 'Vareesha Naeem',
    sapid: '10004',
    email: '10004@students.riphah.edu.pk',
    cnic: '66666-6666666-6',
    phone: '6666-6666666',
    university: 'Riphah',
    campus: 'Al-Mizan',
    program: 'BBA',
    semester: 8
  },
  {
    name: 'Alishba Anjum',
    sapid: '35928',
    email: '35928@students.riphah.edu.pk',
    cnic: '77777-7777777-7',
    phone: '7777-7777777',
    university: 'Riphah',
    campus: 'Al-Mizan',
    program: 'MBBS',
    semester: 4
  }
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
