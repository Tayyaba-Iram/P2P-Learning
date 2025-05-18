import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  file: { type: String },
  fileLink: { type: String },
  accessType: {
    type: String,
    enum: ['public', 'private', 'specific'],
    default: 'private'
  },
  allowedStudent: {
    type: [{ 
      name: { type: String, required: true },
      email: { type: String, required: true }
    }],
    default: []  // default empty array if no specific students
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VerifiedStudent',
    required: true
  },
  uploadedByEmail: { type: String, required: true },
  uploadedByStudent: { type: String, required: true },
});

const Repository = mongoose.model('Repository', repositorySchema);
export default Repository;
