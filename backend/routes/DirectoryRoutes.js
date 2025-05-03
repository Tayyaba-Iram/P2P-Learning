import express from 'express';
import Repository from '../models/Repository.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();

router.get('/directory', verifyUser, async (req, res) => {
  try {
    const repositories = await Repository.find({
      uploadedBy: { $ne: req.user._id }
    }).populate('uploadedBy', 'email');

    const filteredRepositories = repositories.map(repo => {
      const repoObj = {
        _id: repo._id,
        title: repo.title,
        description: repo.description,
        uploadedByEmail: repo.uploadedBy?.email,
        uploadedByStudent: repo.uploadedByStudent,
        accessType: repo.accessType
      };

      if (repo.accessType === 'public') {
        repoObj.file = repo.file;
        repoObj.fileLink = repo.fileLink;

      } else if (repo.accessType === 'specific') {
        const allowedStudents = repo.allowedStudent || [];


        // Check if current user is in allowedStudent list by email
        const isAllowed = allowedStudents.some(student => student.email === req.user.email);

        if (isAllowed) {
          repoObj.file = repo.file;
          repoObj.fileLink = repo.fileLink;
        } else {
          repoObj.file = 'Restricted';
          repoObj.fileLink = 'Restricted';
        }

        // Optionally include allowedStudent list in the response for frontend
        repoObj.allowedStudents = allowedStudents;


      } else {
        repoObj.file = 'Restricted';
        repoObj.fileLink = 'Restricted';
      }

      return repoObj;
    });

    res.status(200).json(filteredRepositories);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

export default router;
