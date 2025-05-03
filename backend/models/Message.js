import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'VerifiedStudent', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'VerifiedStudent', required: true },
  text: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
