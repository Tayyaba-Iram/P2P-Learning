import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Repository from '../models/Repository.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();

// Helper to handle __dirname in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });
router.post('/uploadRepositories', verifyUser, upload.single('file'), async (req, res) => {
    try {
      const { title, description, fileLink } = req.body;
      const file = req.file ? req.file.filename : null;
  
      // Access the logged-in user's email from req.user
      const email = req.user.email;
      const student = req.user.name;
  
      // Create a new repository document
      const repository = new Repository({
        title,
        description,
        file,
        fileLink,
        uploadedBy: req.user._id,  // User's ID (as already done)
        uploadedByEmail: email,  
        uploadedByStudent: student,   // Save the user's email
      });
  
      // Save the repository to the database
      await repository.save();
  
      // Respond with success message and the saved repository
      res.status(200).json({ message: 'Repository uploaded successfully', repository });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload repository' });
    }
  });
  

router.get('/repositories', verifyUser, async (req, res) => {
    try {
      const userId = req.user._id;
  
      const userRepositories = await Repository.find({ uploadedBy: userId });
  
      res.status(200).json(userRepositories);
    } catch (err) {
      console.error("Error fetching user repositories:", err);
      res.status(500).json({ message: 'Server Error' });
    }
  });

// Delete repository
router.delete('/repositories/:id', verifyUser, async (req, res) => {
    try {
      console.log('Repository ID:', req.params.id); // Add this to inspect the ID
      const id = req.params.id;
  
      // If ID is undefined or not valid, handle it
      if (!id) {
        return res.status(400).json({ message: 'Repository ID is required' });
      }
  
      const deletedRepo = await Repository.findByIdAndDelete(id);
      if (!deletedRepo) {
        return res.status(404).json({ message: 'Repository not found' });
      }
  
      res.status(200).json({ message: 'Repository deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ message: 'Failed to delete repository' });
    }
  });
  
  router.put('/updateRepository/:repoId', upload.single('file'), async (req, res) => {
    const { repoId } = req.params;
    const { title, description, fileLink } = req.body;
    let updatedFields = { title, description };
  
    // If a new file is uploaded, handle it
    if (req.file) {
      const filePath = `/uploads/${req.file.filename}`; // You can modify this to use a full URL if necessary
      updatedFields.file = req.file.filename;  // Store the filename in DB
      updatedFields.fileLink = filePath;      // Store the file link for access
    } else {
      // If no new file is uploaded, retain the existing fileLink in the repository
      updatedFields.fileLink = fileLink;
    }
  
    try {
      const repository = await Repository.findByIdAndUpdate(repoId, updatedFields, { new: true });
  
      if (!repository) {
        return res.status(404).json({ success: false, message: 'Repository not found' });
      }
  
      res.json({ success: true, message: 'Repository updated successfully', repository });
    } catch (err) {
      console.error('Error updating repository:', err);
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  });

  router.get('/yourRepositories', verifyUser, async (req, res) => {
    try {
      // Find repositories uploaded by other users (exclude the logged-in user's repositories)
      const repositories = await Repository.find({ uploadedBy: { $ne: req.user._id } })  // Excluding logged-in user's repositories
        .select('title description file fileLink uploadedByEmail uploadedByStudent') // Make sure email is included
        .populate('uploadedBy', 'email') // Populate the email field
  
      res.status(200).json(repositories);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      res.status(500).json({ error: 'Failed to fetch repositories' });
    }
  });
  
  
  

export default router;
