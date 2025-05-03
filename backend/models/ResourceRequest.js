import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  repoTitle: { type: String, required: true },
  repoDescription: { type: String, required: true },
  requestedAt: { type: Date, required: true, default: Date.now },
  repoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'rejected'] },
  receiverEmail: { type: String, required: true }, // The receiver's email (the uploader)
});

const Request = mongoose.model('Request', requestSchema);

export default Request;
