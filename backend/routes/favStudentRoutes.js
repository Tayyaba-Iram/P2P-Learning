import express from 'express';
//import FavoriteStudent from '../models/FavoriteStudent.js';


const router = express.Router();

// Add to favorites
/*router.post('/add', async (req, res) => {
  const { userId, favoriteStudentId } = req.body;

  try {
    const exists = await FavoriteStudent.findOne({ userId, favoriteStudentId });
    if (!exists) {
      const fav = new FavoriteStudent({ userId, favoriteStudentId });
      await fav.save();
    }
    res.status(200).json({ message: 'Favorite added' });
  } catch (err) {
    res.status(500).json({ error: 'Error adding favorite' });
  }
});

// Remove from favorites
router.post('/remove', async (req, res) => {
  const { userId, favoriteStudentId } = req.body;

  try {
    await FavoriteStudent.deleteOne({ userId, favoriteStudentId });
    res.status(200).json({ message: 'Favorite removed' });
  } catch (err) {
    res.status(500).json({ error: 'Error removing favorite' });
  }
});

// Get all favorites of a user
router.get('/:userId', async (req, res) => {
  try {
    const favorites = await FavoriteStudent.find({ userId: req.params.userId }).populate('favoriteStudentId');
    res.status(200).json(favorites);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching favorites' });
  }
});*/

export default router;
