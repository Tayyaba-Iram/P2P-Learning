import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import studentRoutes from './routes/studentRoutes.js';
import auth from './routes/auth.js';
import sessionRoutes from './routes/sessionsRoutes.js';
import UniAdminRoutes from './routes/UniAdminRoutes.js';
import ComplainRoutes from './routes/ComplainRoutes.js';
import UniversityRoutes from './routes/UniversityRoutes.js';
import SuperAdminRoutes from './routes/SuperAdminRoutes.js';
import ResetPasswordRoutes from './routes/ResetPasswordRoutes.js';
import DashboardRoutes from './routes/DashboardRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import verifyUser from './middleware/verifyUser.js'; // Import the middleware
import cookieParser from 'cookie-parser'; // Import cookie-parser
import http from 'http';
import { Server } from 'socket.io';
import ChatModel from './models/Chat.js';  // Import ChatModel correctly

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:3001', credentials: true } });

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', ({ sender, receiver }) => {
    const roomName = [sender, receiver].sort().join('-');
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);
  });

  socket.on('leaveRoom', ({ sender, receiver }) => {
    const roomName = [sender, receiver].sort().join('-');
    socket.leave(roomName);
    console.log(`User left room: ${roomName}`);
  });

  socket.on('newMessage', ({ room, message }) => {
    io.to(room).emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
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
app.use('/api', chatRoutes);
app.use('/api', loginRoutes);

// Start the server
server.listen(3001, () => {  // Use server.listen instead of app.listen for Socket.io
  console.log('Server is running on port 3001');
});
