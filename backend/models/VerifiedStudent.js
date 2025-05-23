import mongoose from 'mongoose';

const verifiedStudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sapid: { type: String, required: true },
  email: { type: String, required: true },
  cnic: { type: String, required: true },
  phone: { type: String, required: true },
  university: { type: String, required: true },
  campus: { type: String, required: true },
  program: { type: String, required: true },
  semester: { type: Number, required: true },
  specification: { type: String, required: true },
  password: { type: String, required: true },
  cpassword: { type: String, required: true },
  verifiedAt: { type: Date, default: Date.now },  
  accountStatus: {
    type: String,
    default: 'Active',  
  },
  blocked: {
    type: Boolean,
    default: false,  
  },
});

const VerifiedStudentModel = mongoose.model('VerifiedStudent', verifiedStudentSchema);

export default VerifiedStudentModel;
