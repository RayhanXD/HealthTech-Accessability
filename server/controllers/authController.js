const jwt = require('jsonwebtoken');
const Player = require('../models/Player');
const Trainer = require('../models/Trainer');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

// @desc    Register a new player (athlete)
// @route   POST /api/auth/register/player
// @access  Public
const registerPlayer = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      age,
      bodyweight_in_pounds,
      height_in_inches,
      sex_at_birth
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, first name, and last name'
      });
    }

    // Check if player already exists
    const existingPlayer = await Player.findOne({ Email: email.toLowerCase() });
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        message: 'Player with this email already exists'
      });
    }

    // Create player
    const player = new Player({
      Email: email.toLowerCase(),
      Password: password,
      fName: firstName,
      Lname: lastName,
      Age: age || null,
      Bodyweight_in_pounds: bodyweight_in_pounds || null,
      Height_in_inches: height_in_inches || null,
      SexAtBirth: sex_at_birth || null
    });

    await player.save();

    // Generate token
    const token = generateToken(player._id, 'player');

    res.status(201).json({
      success: true,
      message: 'Player registered successfully',
      token,
      user: {
        id: player._id,
        email: player.Email,
        firstName: player.fName,
        lastName: player.Lname,
        role: 'player'
      }
    });
  } catch (error) {
    console.error('Error registering player:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Player with this email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while registering player',
      error: error.message
    });
  }
};

// @desc    Register a new trainer (coach)
// @route   POST /api/auth/register/trainer
// @access  Public
const registerTrainer = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, first name, and last name'
      });
    }

    // Check if trainer already exists
    const existingTrainer = await Trainer.findOne({ Email: email.toLowerCase() });
    if (existingTrainer) {
      return res.status(400).json({
        success: false,
        message: 'Trainer with this email already exists'
      });
    }

    // Create trainer
    const trainer = new Trainer({
      Email: email.toLowerCase(),
      Password: password,
      fName: firstName,
      lname: lastName,
      Players: []
    });

    await trainer.save();

    // Generate token
    const token = generateToken(trainer._id, 'trainer');

    res.status(201).json({
      success: true,
      message: 'Trainer registered successfully',
      token,
      user: {
        id: trainer._id,
        email: trainer.Email,
        firstName: trainer.fName,
        lastName: trainer.lname,
        role: 'trainer'
      }
    });
  } catch (error) {
    console.error('Error registering trainer:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Trainer with this email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while registering trainer',
      error: error.message
    });
  }
};

// @desc    Login user (player or trainer)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    if (!role || !['player', 'trainer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role (player or trainer)'
      });
    }

    // Find user based on role
    let user;
    if (role === 'player') {
      user = await Player.findOne({ Email: email.toLowerCase() });
    } else {
      user = await Trainer.findOne({ Email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id, role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.Email,
        firstName: user.fName,
        lastName: user.Lname || user.lname,
        role: role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // User is already attached to req by protect middleware
    let user;
    if (req.user.role === 'player') {
      user = await Player.findById(req.user.id).select('-Password');
    } else {
      user = await Trainer.findById(req.user.id).select('-Password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.Email,
        firstName: user.fName,
        lastName: user.Lname || user.lname,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: error.message
    });
  }
};

module.exports = {
  registerPlayer,
  registerTrainer,
  login,
  getMe
};

