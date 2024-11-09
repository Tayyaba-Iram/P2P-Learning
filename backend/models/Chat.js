import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'VerifiedStudent', required: true },
  messages: [
    {
      sender: { type: String, required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const ChatModel = mongoose.model('Chat', chatSchema);

export default ChatModel;
