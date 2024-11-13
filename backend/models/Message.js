// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String, // User ID of the sender
      required: true,
    },
    receiver: {
      type: String, // User ID of the receiver
      required: true,
    },
    text: {
      type: String, // Content of the message
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
