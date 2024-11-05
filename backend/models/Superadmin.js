import mongoose from 'mongoose';

const SuperAdmin = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const SuperAdminModel = mongoose.model('Superadmin', SuperAdmin);

export default SuperAdminModel;
