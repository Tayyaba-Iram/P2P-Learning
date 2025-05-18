import mongoose from 'mongoose';

const UniAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sapid: { type: String, required: true },
  email: { type: String, required: true },
  cnic: { type: String, required: true },
  phone: { type: String, required: false }, 
  university: { type: String, required: true },
  campus: { type: [String], required: true }, 
  password: { type: String, required: true }, 
  cpassword: { type: String, required: true },
});

const UniAdminModel = mongoose.model('UniAdmin', UniAdminSchema);
export default UniAdminModel;
