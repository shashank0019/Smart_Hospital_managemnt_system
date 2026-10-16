const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

const Message = require('./models/Message');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
const initDemoAccounts = require('./utils/initDemoAccounts');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Smart-Hospital-System';
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    await initDemoAccounts();
  })
  .catch((err) => console.error('MongoDB connection error:', err.message));

// Core Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/messages', require('./routes/messages'));

// Phase 2 Routes
app.use('/api/reports', require('./routes/reports'));
app.use('/api/beds', require('./routes/beds'));
app.use('/api/invoices', require('./routes/invoices'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join a consultation/doctor room
  socket.on('joinRoom', async ({ room }) => {
    if (!room) return;
    socket.join(room);

    try {
      // Fetch the last 100 persistent messages from MongoDB
      const history = await Message.find({ room })
        .sort({ timestamp: 1 })
        .limit(100);
      socket.emit('chatHistory', history);
    } catch (err) {
      console.error('Error fetching chat history from DB:', err.message);
      socket.emit('chatHistory', []);
    }
  });

  // Handle sending messages with MongoDB persistence
  socket.on('sendMessage', async ({ room, sender, text, senderRole, senderEmail }) => {
    if (!room || !sender || !text) return;

    try {
      const newMsg = new Message({
        room,
        sender,
        text,
        senderRole: senderRole || 'patient',
        senderEmail: senderEmail || ''
      });
      await newMsg.save();

      io.to(room).emit('receiveMessage', newMsg);
    } catch (err) {
      console.error('Error saving message to DB:', err.message);
      // Fallback emit even if db save encounters an issue
      io.to(room).emit('receiveMessage', {
        room,
        sender,
        text,
        timestamp: new Date(),
        senderRole
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Smart Hospital Server running on port ${PORT}`);
  console.log('Environment configuration:', {
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI ? 'Configured' : 'Default Local',
    EMAIL_SERVICE: (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) ? 'Active' : 'Simulation Mode'
  });
});