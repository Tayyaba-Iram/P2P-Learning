import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Repository from '../models/Repository.js';
import verifyUser from '../middleware/verifyUser.js';
import VerifiedStudentModel from '../models/VerifiedStudent.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

router.get('/repo-verifiedStudents', verifyUser, async (req, res) => {
  try {
    const students = await VerifiedStudentModel.find({
      _id: { $ne: req.user._id } 
    });

    res.json(students);
  } catch (error) {
    console.error('Error fetching verified students:', error);
    res.status(500).send('Server error');
  }
});


router.post('/uploadRepositories', verifyUser, upload.single('file'), async (req, res) => {
  try {
    const { title, description, fileLink, accessType } = req.body;
    let allowedStudent = [];

    if (accessType === 'specific' && req.body.allowedStudent) {
      try {
        if (typeof req.body.allowedStudent === 'string') {
          allowedStudent = JSON.parse(req.body.allowedStudent); 
        } else if (Array.isArray(req.body.allowedStudent)) {
          allowedStudent = req.body.allowedStudent; 
        }

        if (!Array.isArray(allowedStudent) || !allowedStudent.every(s => s.name && s.email)) {
          return res.status(400).json({ error: 'allowedStudent must be an array of objects with name and email' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'Invalid JSON format for allowedStudent' });
      }
    }

    const file = req.file ? req.file.filename : 'No File Uploaded';

    const email = req.user.email;
    const student = req.user.name;

    const repository = new Repository({
      title,
      description,
      file,
      fileLink,
      accessType,
      allowedStudent: accessType === 'specific' ? allowedStudent : [], 
      uploadedBy: req.user._id,
      uploadedByEmail: email,
      uploadedByStudent: student,
    });

    await repository.save();
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


  router.delete('/repositories/:id', verifyUser, async (req, res) => {
    try {
      console.log('Repository ID:', req.params.id); 
      const id = req.params.id;
  
      if (!id) {
        return res.status(400).json({ message: 'Repository ID is required' });
      }
  
      const deletedRepo = await Repository.findByIdAndDelete(id);
      if (!deletedRepo) {
        return res.status(404).json({ message: 'Repository not found' });
      }
  
      if (deletedRepo.file && deletedRepo.file.trim() !== 'Restricted' && deletedRepo.file.trim() !== 'no file uploaded') {
        const filePath = path.join(__dirname, '../uploads', deletedRepo.file);  // Path to the file
  
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          } else {
            console.log('File deleted successfully');
          }
        });
      }
  
      res.status(200).json({ message: 'Repository and associated file deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ message: 'Failed to delete repository' });
    }
  });
  
  
  router.put('/updateRepository/:repoId', upload.single('file'), async (req, res) => {
    const { repoId } = req.params;
    let { title, description, fileLink, accessType, allowedStudent } = req.body;
  
    if (typeof allowedStudent === 'string') {
      allowedStudent = JSON.parse(allowedStudent);  
    }
  
    let updatedFields = { title, description, accessType };
  
    if (accessType === 'specific') {
      updatedFields.allowedStudent = allowedStudent; 
    }
  
    if (req.file) {
      const filePath = `/uploads/${req.file.filename}`; 
      updatedFields.file = req.file.filename;
      updatedFields.fileLink = filePath;      
    } else {
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
      const repositories = await Repository.find({ uploadedBy: { $ne: req.user._id } })  // Excluding logged-in user's repositories
        .select('title description file fileLink uploadedByEmail uploadedByStudent') // Make sure email is included
        .populate('uploadedBy', 'email') 
  
      res.status(200).json(repositories);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      res.status(500).json({ error: 'Failed to fetch repositories' });
    }
  });
  
  
  router.get('/repositoryInfo/:repoId', async (req, res) => {
    const repoId = req.params.repoId;
    try {
      const repository = await Repository.findById(repoId);
      if (!repository) {
        return res.status(404).json({ success: false, message: 'Repository not found' });
      }
      res.json({ success: true, repository });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  

export default router;
