import mongoose from 'mongoose';

const favoriteStudentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
},
  favoriteStudentId: 
  { type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true }
});

const FavoriteStudent = mongoose.model('FavoriteStudent', favoriteStudentSchema);
export default FavoriteStudent;
