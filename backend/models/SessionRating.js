import mongoose from 'mongoose';

const sessionRatingSchema = new mongoose.Schema({
  sessionId: String,
  rating: Number,
  university: {
    type: String,
    required: true,
  },
  program: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("SessionRating", sessionRatingSchema);
