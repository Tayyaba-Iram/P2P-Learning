import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  date: { type: Date, required: true },
  meetingLink: { type: String, required: true, unique: true },
  
  // Payment method: cash or food
  paymentMethod: { type: String, enum: ['cash', 'food'], required: true },

  // Cash-specific fields
  amount: { type: String, default: null },
  senderName: { type: String, default: null },
  senderTitle: { type: String, default: null },
  senderNumber: { type: String, default: null },
  instructorName: { type: String, default: null },
  instructorHolder: { type: String, default: null },
  instructorNumber: { type: String, default: null },

  // Food-specific fields
  foodBrand: { type: String, default: null },
  foodItem: { type: String, default: null },
  foodBill: { type: String, default: null },
  userEmail: {
    type: String,
    required: true
  },
  isDeducted: { type: Boolean, default: false },
  // Session status
  status: { type: String, enum: ['Pending', 'Completed', 'Canceled'], default: 'Pending' }
});

const SessionModel = mongoose.model('Session', sessionSchema);
export default SessionModel;
