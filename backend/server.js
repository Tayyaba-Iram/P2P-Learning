import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import studentRoutes from './routes/studentRoutes.js';
import auth from './routes/auth.js';
import sessionRoutes from './routes/sessionsRoutes.js';
import UniAdminRoutes from './routes/UniAdminRoutes.js';
import ComplainRoutes from './routes/ComplainRoutes.js';
import UniversityRoutes from './routes/UniversityRoutes.js';
import SuperAdminRoutes from './routes/SuperAdminRoutes.js';
import ResetPasswordRoutes from './routes/ResetPasswordRoutes.js';
import DashboardRoutes from './routes/DashboardRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import favStudentRoutes from './routes/favStudentRoutes.js';
import broadcastRequestRoutes from './routes/broadcastRequestRoutes.js'; 
import Message from './models/Message.js';
import VerifiedStudentModel from './models/VerifiedStudent.js';
import verifyUser from './middleware/verifyUser.js';
import SuperPaymentRoutes from './routes/SuperPaymentRoutes.js';
import RepositoryRoutes from './routes/RepositoryRoutes.js';
import SuspensionRoutes from './routes/SuspensionRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';


// Initialize express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Socket.io Events
io.on('connection', (socket) => {
  console.log(`Client ${socket.id} connected`);

  socket.on('joinRoom', (roomName, callback) => {
    socket.join(roomName);
    console.log(`Client ${socket.id} joined room: ${roomName}`);
    callback(null);
  });

  socket.on('newMessage', async (data) => {
    const { room, message } = data;
    try {
      const savedMessage = await new Message({
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
      }).save();
      io.to(room).emit('newMessage', savedMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });
});

// Chat Routes
app.get('/api/chat/:receiverId', async (req, res) => {
  const { receiverId } = req.params;
  const { userId } = req.query;
  if (!userId || !receiverId) {
    return res.status(400).json({ error: 'Missing userId or receiverId' });
  }

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { senderId, receiverId, text } = req.body;
  if (!senderId || !receiverId || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const message = new Message({ senderId, receiverId, text });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

app.get('/api/chattedStudents', verifyUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).select('senderId receiverId');

    const participants = new Set();
    messages.forEach(msg => {
      if (msg.senderId.toString() !== userId.toString()) participants.add(msg.senderId.toString());
      if (msg.receiverId.toString() !== userId.toString()) participants.add(msg.receiverId.toString());
    });

    const chattedStudents = await VerifiedStudentModel.find({
      '_id': { $in: Array.from(participants) }
    }).select('name _id');

    res.json(chattedStudents);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chatted students', error: err.message });
  }
});


// API Routes
app.use('/api', studentRoutes);
app.use('/api', auth);
app.use('/api', sessionRoutes);
app.use('/api', UniAdminRoutes);
app.use('/api', ComplainRoutes);
app.use('/api', UniversityRoutes);
app.use('/api', SuperAdminRoutes);
app.use('/api', ResetPasswordRoutes);
app.use('/api', verifyUser, DashboardRoutes);
app.use('/api', loginRoutes);
app.use('/api', favStudentRoutes);
app.use('/api', broadcastRequestRoutes);
app.use('/api', SuperPaymentRoutes);
app.use('/api', RepositoryRoutes);
app.use('/api', SuspensionRoutes);
app.use('/api', ratingRoutes);



// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/P2P-Learning')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
