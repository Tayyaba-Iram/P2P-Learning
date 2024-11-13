import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatModel = mongoose.model('Chat', chatSchema);

export default ChatModel;
