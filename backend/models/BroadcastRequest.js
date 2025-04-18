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
});

const BroadcastRequest = mongoose.model('BroadcastRequest', broadcastRequestSchema);

export default BroadcastRequest;
