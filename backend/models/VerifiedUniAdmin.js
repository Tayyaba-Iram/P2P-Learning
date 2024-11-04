import mongoose from 'mongoose';

const verifiedUniAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sapid: { type: String, required: true },
  email: { type: String, required: true },
  cnic: { type: String, required: true },
  university: { type: String, required: true },
  campus: { type: String, required: true },
  password: { type: String, required: true },
  cpassword: { type: String, required: true },
  verifiedAt: { type: Date, default: Date.now },  
});

const verifiedUniAdminModel = mongoose.model('VerifiedUniAdmin', verifiedUniAdminSchema);

export default verifiedUniAdminModel;
