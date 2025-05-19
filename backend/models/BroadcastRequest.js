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
    type: [String],  
    required: true,
  },
  userId: {
    type: String,  
    required: true,
  },
  name: {
    type: String, 
    required: true,
  },
  email: {
    type: String,  
    required: true,
  },
});

const BroadcastRequest = mongoose.model('BroadcastRequest', broadcastRequestSchema);

export default BroadcastRequest;
