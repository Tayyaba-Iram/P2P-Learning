import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import studentRoutes from './routes/studentRoutes.js';
import auth from './routes/auth.js';
import sessionRoutes from './routes/sessionsRoutes.js';
import UniAdminRoutes from './routes/UniAdminRoutes.js';
import ComplainRoutes from './routes/ComplainRoutes.js';
import UniversityRoutes from './routes/UniversityRoutes.js'
import SuperAdminRoutes from './routes/SuperAdminRoutes.js'
import ResetPasswordRoutes from './routes/ResetPasswordRoutes.js'
import DashboardRoutes from './routes/DashboardRoutes.js'
import loginRoutes from './routes/loginRoutes.js'
import verifyUser from './middleware/verifyUser.js'; // Import the middleware
import Message from './models/Message.js';
import favStudentRoutes from './routes/favStudentRoutes.js';
import RepositoryRoutes from './routes/RepositoryRoutes.js';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import VerifiedStudentModel from './models/VerifiedStudent.js';
import path from 'path'; 
import { fileURLToPath } from 'url'; 

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE","OPTIONS"],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // Frontend address
    methods: ["GET", "POST"],
    credentials: true  // Allow cookies if necessary
  }
});

// Backend: 
io.on('connection', (socket) => {
  console.log(`Client ${socket.id} connected`);

  socket.on('joinRoom', (roomName, callback) => {
    try {
      // Check if socket is already in the room
      if (socket.rooms.has(roomName)) {
        return callback(null); // No errors, already in room
      }
      socket.join(roomName);
      console.log(`Client ${socket.id} joined room: ${roomName}`);
      callback(null);
    } catch (err) {
      console.error('Error joining room:', err);
      callback(err);
    }
  });
  socket.on('newMessage', async (data) => {
    const { room, message } = data;
    try {
      // Save the message to the database
      const savedMessage = await new Message({
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
      }).save();
  
      // Emit the saved message to the room
      io.to(room).emit('newMessage', savedMessage);
      console.log(`Message sent to room ${room}: `, savedMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });
  

  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} disconnected`);
  });
});


// Fetch chat history with a specific student
app.get('/api/chat/:receiverId', async (req, res) => {
  const { receiverId } = req.params; // Receiver ID from the URL params
  const { userId } = req.query; // Logged-in user's ID from query params

  if (!userId || !receiverId) {
    return res.status(400).json({ error: 'Missing userId or receiverId' });
  }

  try {
    // Fetch messages where sender and receiver match either of the two conditions
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: receiverId }, // User sending to receiver
        { senderId: receiverId, receiverId: userId }, // Receiver sending back to user
      ],
    }).sort({ timestamp: 1 }); // Sort messages by timestamp (ascending)

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Route to save messages
app.post('/api/chat', async (req, res) => {
  const { senderId, receiverId, text } = req.body;

  if (!senderId || !receiverId || !text) {
    return res.status(400).json({ error: 'Missing senderId, receiverId, or text' });
  }

  try {
    // Create a new message document with senderId, receiverId, and the text
    const message = new Message({
      senderId,
      receiverId,
      text,
    });
    await message.save();
    res.status(201).json(message); // Return the saved message in the response
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Example route to get chatted students
// Route to get chatted students
app.get('/api/chattedStudents', verifyUser, async (req, res) => {
  try {
    const userId = req.user._id;  // Assuming you're using a middleware to authenticate the user
    
    // Find all the messages involving the logged-in user
    const messages = await Message.find({
      $or: [
        { senderId: userId },  // Messages where the logged-in user is the sender
        { receiverId: userId },  // Messages where the logged-in user is the receiver
      ]
    }).select('senderId receiverId');  // We only need the sender and receiver ids

    // Extract unique participants (excluding the logged-in user)
    const participants = new Set();
    messages.forEach(message => {
      if (message.senderId.toString() !== userId.toString()) {
        participants.add(message.senderId.toString());
      }
      if (message.receiverId.toString() !== userId.toString()) {
        participants.add(message.receiverId.toString());
      }
    });

    // Convert the Set to an array of user IDs
    const participantIds = Array.from(participants);

    // Fetch the details of the participants (students who have chatted with the logged-in user)
    const chattedStudents = await VerifiedStudentModel.find({
      '_id': { $in: participantIds }
    }).select('name _id');  // Select the fields you need (name and _id)

    res.json(chattedStudents);  // Return the list of chatted students
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching chatted students', error: err.message });
  }
});




// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/P2P-Learning')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

  

// Use routes
app.use('/api', studentRoutes);
app.use('/api', auth);
app.use('/api', sessionRoutes);
app.use('/api', UniAdminRoutes);
app.use('/api', ComplainRoutes);
app.use('/api', UniversityRoutes);
app.use('/api/universities', UniversityRoutes);
app.use('/api', SuperAdminRoutes);
app.use('/api', ResetPasswordRoutes);
app.use('/api', verifyUser, DashboardRoutes);
app.use('/api', loginRoutes);
app.use('/api', favStudentRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api', RepositoryRoutes)

// Start the server
server.listen(3001, () => {  // Use server.listen instead of app.listen for Socket.io
  console.log('Server is running on port 3001');
});
