const express = require('express');
const router = express.Router();
const {
  registerPlayer,
  registerTrainer,
  login,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register/player
// @desc    Register a new player (athlete)
// @access  Public
router.post('/register/player', registerPlayer);

// @route   POST /api/auth/register/trainer
// @desc    Register a new trainer (coach)
// @access  Public
router.post('/register/trainer', registerTrainer);

// @route   POST /api/auth/login
// @desc    Login user (player or trainer)
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;

