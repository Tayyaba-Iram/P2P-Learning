import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';

// Import routes
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
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import VerifiedStudentModel from './models/VerifiedStudent.js';


// Initialize express app
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE","OPTIONS"],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}));


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware setup
app.use(cors({
  origin: ["http://localhost:5173"],  // Adjust to match your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Socket.io events
io.on('connection', socket => {
  console.log(`Client ${socket.id} connected`);

  socket.on('joinRoom', (roomName, callback) => {
    if (!socket.rooms.has(roomName)) {
      socket.join(roomName);
      console.log(`Client ${socket.id} joined room: ${roomName}`);
    }
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

  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} disconnected`);
  });
});

// Broadcast Request Routes (Make sure to use correct path)
app.use('/api/broadcastRequest', broadcastRequestRoutes);  // Mount the broadcastRequestRoutes here

// Main Routes
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
app.use('/uploads', express.static('uploads'));
app.use('/api', RepositoryRoutes)

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/P2P-Learning')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
