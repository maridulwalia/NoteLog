const express = require('express');
const Note = require('../models/Note');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// CREATE a note
router.post('/', authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  console.log('Incoming request body:', req.body);        // Log full body
  console.log('Authenticated user:', req.user);           // Confirm user is attached
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  try {
    const note = new Note({
      user: req.user.id,
      title,
      content
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// GET all notes for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });

    // ✅ Fix the ID mapping here
    const mappedNotes = notes.map(note => ({
      id: note._id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));

    res.json(mappedNotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// UPDATE a note
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, content },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE a note
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!result) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
