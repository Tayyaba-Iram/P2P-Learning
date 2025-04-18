import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  file: { type: String }, // File path
  fileLink: { type: String },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VerifiedStudent', // or 'VerifiedStudent' if that’s your user model
    required: true
  },
  uploadedByEmail: { type: String, required: true },
  uploadedByStudent: { type: String, required: true },
  
});

const Repository = mongoose.model('Repository', repositorySchema);
export default Repository;
