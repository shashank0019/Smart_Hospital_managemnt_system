const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// Get chat history for a room
router.get('/:room', async (req, res) => {
  try {
    const { room } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const messages = await Message.find({ room })
      .sort({ timestamp: 1 })
      .limit(limit);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching chat messages' });
  }
});

// Post a message via REST API (in addition to Socket.IO)
router.post('/', async (req, res) => {
  try {
    const { room, sender, text, senderRole, senderEmail } = req.body;
    if (!room || !sender || !text) {
      return res.status(400).json({ message: 'Room, sender, and text are required' });
    }

    const message = new Message({
      room,
      sender,
      text,
      senderRole: senderRole || 'patient',
      senderEmail
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Error saving message' });
  }
});

// Mark messages in a room as read
router.patch('/:room/read', async (req, res) => {
  try {
    const { room } = req.params;
    await Message.updateMany({ room, isRead: false }, { $set: { isRead: true } });
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating message status' });
  }
});

module.exports = router;
