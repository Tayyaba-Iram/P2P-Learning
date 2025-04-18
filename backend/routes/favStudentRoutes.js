import express from 'express';
import verifyUser from '../middleware/verifyUser.js';
import FavoriteStudents from '../models/Favourites.js';

const router = express.Router();
router.post('/favoriteStudent/:studentId', verifyUser, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user._id;

    
    // Create new favorite student entry
    const favorite = new FavoriteStudents({
      userId,
      favoriteStudentId: studentId,  // Ensure the field is correct here
    });

    await favorite.save();
    res.status(200).json({ message: 'Student added to favorites successfully' });
  } catch (error) {
    console.error('Error favoriting student:', error);
    res.status(500).json({ error: 'Failed to favorite student' });
  }
});


// Route to unfavorite a student
router.delete('/unfavoriteStudent/:favoriteStudentId', verifyUser, async (req, res) => {
  console.log('Request received to unfavorite student');
  try {
    const { favoriteStudentId } = req.params;
    const userId = req.user._id;

    // Remove the student from the user's favorites
    const deletedFavorite = await FavoriteStudents.findOneAndDelete({ userId, favoriteStudentId });
    console.log('Deleted Favorite:', deletedFavorite);
    
    if (!deletedFavorite) {
      return res.status(404).json({ message: 'Student not found in your favorites' });
    }

    res.status(200).json({ message: 'Student removed from favorites successfully' });
  } catch (error) {
    console.error('Error unfavoriting student:', error);
    res.status(500).json({ error: 'Failed to unfavorite student' });
  }
});
router.get('/favoriteStudents', verifyUser, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Logged-in userId:', userId);

    const favorites = await FavoriteStudents.find({ userId })
      .populate('favoriteStudentId', 'name email');

    console.log('Fetched favorites:', favorites);
    res.status(200).json(favorites);
  } catch (error) {
    console.error('Error fetching favorite students:', error);
    res.status(500).json({ error: 'Failed to fetch favorite students' });
  }
});


export default router;
