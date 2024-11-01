import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  date: { type: Date, required: true },
  meetingLink: { type: String }
});

const SessionModel = mongoose.model('Session', sessionSchema);

export default SessionModel;
