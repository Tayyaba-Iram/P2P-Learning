import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'VerifiedStudent' }, // reference to the user
    username: { type: String, required: true }, // login user's name
    useremail: { type: String, required: true }, // login user's email
    targetname: { type: String, required: true },
    targetemail: { type: String, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    file: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Resolved'],
        default: 'Pending',
      }
});

const ComplaintModel = mongoose.model('Complains', complaintSchema);

export default ComplaintModel;
