const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/authMiddleware');

// Get all contacts for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user.id }).sort({ name: 1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new contact
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, email, tag, address } = req.body;
    
    const contact = new Contact({
      name,
      phone,
      email,
      tag,
      address,
      userId: req.user.id
    });

    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ message: 'Error creating contact', error: error.message });
  }
});

// Update a contact
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, phone, email, tag, address } = req.body;
    
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, phone, email, tag, address },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: 'Error updating contact', error: error.message });
  }
});

// Delete a contact
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
});

module.exports = router;