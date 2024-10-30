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

export default StudentModel;
