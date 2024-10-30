import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/P2P-Learning')
  .then(() => {
    console.log('Connected to MongoDB');
    const studentSchema = new mongoose.Schema({
      name: String,
      sapId: { type: String, required: true }, 
      email: { type: String, required: true }, 
      email: {type: String,required: true},
      department: {type: String,required: true},
      program: {type: String,required: true}, 
      semester: {type: Number,required: true}, 
      university: {type: String,required: true},
      campus: {type: String,required: true},
      cnic: {type: String,required: true},
    });

    const StudentModel = mongoose.model('Student', studentSchema);

    const studentsData = [
      {
        name: 'John Doe',
        sapId: '30001', 
        email: '30001@students.riphah.edu.pk',
        department: 'Faculty of Computing',
        program: 'Software Engineering',
        semester: 1,
        university: 'Riphah',
        campus: 'Gulberg Greens',
        cnic: '00000-0000000-0'
      },
      {
        name: 'Jane Smith',
        sapId: '30002',
        email: '30002@students.riphah.edu.pk',
        department: 'Faculty of Computing',
        program: 'Cyber Security',
        semester: 2,
        university: 'Riphah',
        campus: 'Lahore Campus',
        cnic: '11111-1111111-1'
      },
      {
        name: 'Ali Khan',
        sapId: '30003',
        email: '30003@students.riphah.edu.pk',
        department: 'Faculty of Computing',
        program: 'Computer Science',
        semester: 3,
        university: 'Riphah',
        campus: 'I-14 Campus',
        cnic: '22222-2222222-2'
      },
      {
        name: 'Fatima Noor',
        sapId: '30004',
        email: '30004@students.riphah.edu.pk',
        department: 'Faculty of Computing',
        program: 'Software Engineering',
        semester: 4,
        university: 'Riphah',
        campus: 'G7 Campus',
        cnic: '33333-3333333-3'
      },
      {
        name: 'Hassan Ali',
        sapId: '30005',
        email: '30005@students.riphah.edu.pk',
        department: 'Faculty of Computing',
        program: 'Cyber Security',
        semester: 5,
        university: 'Riphah',
        campus: 'Faisalabad Campus',
        cnic: '44444-4444444-4'
      },
      {
        name: 'Sara Ahmed',
        sapId: '30006',
        email: '30006@students.riphah.edu.pk',
        department: 'Faculty of Computing',
        program: 'Computer Science',
        semester: 6,
        university: 'Riphah',
        campus: 'Gulberg Greens',
        cnic: '55555-5555555-5'
      },
      {
        name: 'Usman Malik',
        sapId: '30007',
        email: '30007@students.riphah.edu.pk',
        department: 'Faculty of Computing',
        program: 'Software Engineering',
        semester: 7,
        university: 'Riphah',
        campus: 'Lahore Campus',
        cnic: '66666-6666666-6'
      },
      {
        name: 'Maira Khan',
        sapId: '30008',
        email: '30008@students.riphah.edu.pk',
        department: 'Faculty of Computing',
        program: 'Cyber Security',
        semester: 8,
        university: 'Riphah',
        campus: 'I-14 Campus',
        cnic: '77777-7777777-7'
      },
      {
        name: 'Bilal Qureshi',
        sapId: '30009',
        email: '30009@students.riphah.edu.pk',
        department: 'Faculty of Computing',
        program: 'Computer Science',
        semester: 1,
        university: 'Riphah',
        campus: 'G7 Campus',
        cnic: '88888-8888888-8'
      },
      {
        name: 'Nida Fatima',
        sapId: '30010',
        email: '30010@students.riphah.edu.pk',
        department: 'Faculty of Computing',
        program: 'Software Engineering',
        semester: 2,
        university: 'Riphah',
        campus: 'Faisalabad Campus',
        cnic: '99999-9999999-9'
      }
    ];

    StudentModel.insertMany(studentsData)
      .then(() => {
        console.log('Students saved successfully');
        mongoose.connection.close(); 
      })
      .catch(err => console.error('Error saving students:', err));
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));
