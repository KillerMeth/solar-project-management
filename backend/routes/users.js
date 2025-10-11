const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all users (Team leader only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'team_leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get technical officers for assignment
router.get('/technical-officers', auth, async (req, res) => {
  try {
    const technicalOfficers = await User.find({ role: 'technical_officer' }).select('name email');
    res.json(technicalOfficers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;