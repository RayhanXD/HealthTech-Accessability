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

    // Normalize email (trim and lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists in Player collection
    const existingPlayer = await Player.findOne({ Email: normalizedEmail });
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        message: 'Player with this email already exists'
      });
    }

    // Check if email already exists in Trainer collection (emails should be unique across both)
    const existingTrainer = await Trainer.findOne({ Email: normalizedEmail });
    if (existingTrainer) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists (as a trainer). Please use a different email or login instead.'
      });
    }

    // Create player
    const playerData = {
      Email: normalizedEmail,
      Password: password,
      fName: firstName,
      Lname: lastName
    };

    // Only include optional fields if they are provided and valid
    if (age !== undefined && age !== null && age !== '') {
      const ageNum = Number(age);
      if (!isNaN(ageNum) && ageNum >= 1 && ageNum <= 120) {
        playerData.Age = ageNum;
      }
    }
    if (bodyweight_in_pounds !== undefined && bodyweight_in_pounds !== null && bodyweight_in_pounds !== '') {
      const weightNum = Number(bodyweight_in_pounds);
      if (!isNaN(weightNum) && weightNum >= 1 && weightNum <= 1000) {
        playerData.Bodyweight_in_pounds = weightNum;
      }
    }
    if (height_in_inches !== undefined && height_in_inches !== null && height_in_inches !== '') {
      const heightNum = Number(height_in_inches);
      if (!isNaN(heightNum) && heightNum >= 1 && heightNum <= 120) {
        playerData.Height_in_inches = heightNum;
      }
    }
    if (sex_at_birth !== undefined && sex_at_birth !== null && sex_at_birth !== '' && ['Male', 'Female', 'Other'].includes(sex_at_birth)) {
      playerData.SexAtBirth = sex_at_birth;
    }

    const player = new Player(playerData);

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
    console.error('Error details:', {
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      message: error.message
    });
    
    if (error.code === 11000) {
      // MongoDB duplicate key error - check which field caused it
      const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'unknown';
      const duplicateValue = error.keyValue ? error.keyValue[duplicateField] : 'unknown';
      
      // Double-check if it actually exists (in case of index corruption)
      if (duplicateField === 'Email') {
        const checkPlayer = await Player.findOne({ Email: duplicateValue });
        const checkTrainer = await Trainer.findOne({ Email: duplicateValue });
        
        if (checkPlayer || checkTrainer) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email already exists. Please use a different email or login instead.'
          });
        } else {
          // Index corruption - email doesn't actually exist but index thinks it does
          console.error('⚠️  Database index issue detected - email not found but index reports duplicate');
          return res.status(500).json({
            success: false,
            message: 'Database error: Please contact support or try again later. The email may appear to be in use due to a database issue.'
          });
        }
      }
      
      return res.status(400).json({
        success: false,
        message: `A player with this ${duplicateField} already exists`
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

    // Normalize email (trim and lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists in Trainer collection
    const existingTrainer = await Trainer.findOne({ Email: normalizedEmail });
    if (existingTrainer) {
      return res.status(400).json({
        success: false,
        message: 'Trainer with this email already exists'
      });
    }

    // Check if email already exists in Player collection (emails should be unique across both)
    const existingPlayer = await Player.findOne({ Email: normalizedEmail });
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists (as a player). Please use a different email or login instead.'
      });
    }

    // Create trainer
    const trainer = new Trainer({
      Email: normalizedEmail,
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
    console.error('Error details:', {
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      message: error.message
    });
    
    if (error.code === 11000) {
      // MongoDB duplicate key error - check which field caused it
      const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'unknown';
      const duplicateValue = error.keyValue ? error.keyValue[duplicateField] : 'unknown';
      
      // Double-check if it actually exists (in case of index corruption)
      if (duplicateField === 'Email') {
        const checkTrainer = await Trainer.findOne({ Email: duplicateValue });
        const checkPlayer = await Player.findOne({ Email: duplicateValue });
        
        if (checkTrainer || checkPlayer) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email already exists. Please use a different email or login instead.'
          });
        } else {
          // Index corruption - email doesn't actually exist but index thinks it does
          console.error('⚠️  Database index issue detected - email not found but index reports duplicate');
          return res.status(500).json({
            success: false,
            message: 'Database error: Please contact support or try again later. The email may appear to be in use due to a database issue.'
          });
        }
      }
      
      return res.status(400).json({
        success: false,
        message: `A trainer with this ${duplicateField} already exists`
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

