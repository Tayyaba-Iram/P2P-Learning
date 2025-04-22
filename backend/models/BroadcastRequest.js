// models/BroadcastRequest.js
import mongoose from 'mongoose';

const broadcastRequestSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  subtopic: {
    type: String,
    required: true,
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  programs: {
    type: [String],  // This makes sure programs are stored as an array of strings
    required: true,
  },
  userId: {
    type: String,  // Or mongoose.Schema.Types.ObjectId if referencing a user model
    required: true,
  },
  name: {
    type: String,  // Save user's name
    required: true,
  },
  email: {
    type: String,  // Save user's email
    required: true,
  },
});

const BroadcastRequest = mongoose.model('BroadcastRequest', broadcastRequestSchema);

export default BroadcastRequest;
