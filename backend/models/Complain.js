import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sapid: { type: String, required: true },
    email: { type: String, required: true },
    university: { type: String, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true }
});

const ComplaintModel = mongoose.model('Complains', complaintSchema);

export default ComplaintModel;
