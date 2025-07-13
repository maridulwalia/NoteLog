const express = require('express');
const router = express.Router();
const CustomNote = require('../models/CustomNote');
const auth = require('../middleware/authMiddleware');

// Get all custom notes for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await CustomNote.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new custom note
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, backgroundImageUrl } = req.body;
    
    const note = new CustomNote({
      title,
      content,
      backgroundImageUrl,
      userId: req.user.id
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: 'Error creating note', error: error.message });
  }
});

// Update a custom note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, backgroundImageUrl } = req.body;
    
    const note = await CustomNote.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, content, backgroundImageUrl },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(400).json({ message: 'Error updating note', error: error.message });
  }
});

// Delete a custom note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await CustomNote.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

module.exports = router;