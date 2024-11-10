import mongoose from 'mongoose';

const UniAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sapid: { type: String, required: true },
  email: { type: String, required: true },
  cnic: { type: String, required: true },
  phone: { type: String, required: false }, // Phone is optional
  university: { type: String, required: true },
  campus: { type: [String], required: true }, // Change this to allow an array of strings
  password: { type: String, required: true }, // Storing password as plain text
  cpassword: { type: String, required: true },
});

const UniAdminModel = mongoose.model('UniAdmin', UniAdminSchema);
export default UniAdminModel;
