import mongoose from 'mongoose';

const favoriteStudentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'VerifiedStudent', 
    required: true 
},
  favoriteStudentId: 
  { type: mongoose.Schema.Types.ObjectId, 
    ref: 'VerifiedStudent', 
    required: true }
});
const FavoriteStudents = mongoose.model('FavoriteStudent', favoriteStudentSchema);

export default FavoriteStudents;
