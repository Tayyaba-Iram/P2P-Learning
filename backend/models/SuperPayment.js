import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  holder: { type: String, required: true },
  number: { type: String, required: true },
  balance: { type: Number, required: true }
});

const Account = mongoose.model('Account', accountSchema);
export default Account;