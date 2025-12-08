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
    console.log('Checking for existing player with email:', normalizedEmail);

    // Check if email already exists in Player collection
    const existingPlayer = await Player.findOne({ Email: normalizedEmail });
    if (existingPlayer) {
      console.log('Existing player found:', existingPlayer.Email, 'ID:', existingPlayer._id);
      return res.status(400).json({
        success: false,
        message: 'Player with this email already exists'
      });
    }
    
    console.log('No existing player found for email:', normalizedEmail, '- proceeding with registration');

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
      Lname: lastName,
      // Don't set Username - let it be undefined (not null) to avoid unique index conflicts
      // Username is optional and has sparse unique index
    };
    
    console.log('Creating player with data:', { ...playerData, Password: '[REDACTED]' });

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

    try {
      await player.save();
    } catch (saveError) {
      console.error('Error saving player:', saveError);
      // If it's a validation error, provide more details
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.values(saveError.errors).map(err => err.message).join(', ');
        return res.status(400).json({
          success: false,
          message: `Validation error: ${validationErrors}`
        });
      }
      // If it's a duplicate key error
      if (saveError.code === 11000) {
        // Check which field caused the duplicate
        const duplicateField = saveError.keyPattern ? Object.keys(saveError.keyPattern)[0] : 'unknown';
        console.error('Duplicate key error on field:', duplicateField);
        console.error('Duplicate key value:', saveError.keyValue);
        
        if (duplicateField === 'Email') {
          return res.status(400).json({
            success: false,
            message: 'Player with this email already exists'
          });
        } else if (duplicateField === 'Username') {
          // This shouldn't happen if we don't set Username, but handle it just in case
          console.error('Username duplicate error - this might be a database index issue');
          return res.status(400).json({
            success: false,
            message: 'Registration error. Please try again or contact support.'
          });
        } else {
          return res.status(400).json({
            success: false,
            message: 'A player with this information already exists'
          });
        }
      }
      throw saveError;
    }

    // Automatically create Sahha profile (demographic data is optional)
    // Profile can be created with just externalId, demographics can be added later
    try {
      const sahhaService = require('../services/sahhaService');
      const sahhaProfile = await sahhaService.createProfile({
        externalId: player._id.toString(),
        Age: age,
        Bodyweight_in_pounds: bodyweight_in_pounds,
        Height_in_inches: height_in_inches,
        SexAtBirth: sex_at_birth
      });

        // Extract profile ID from response
        let profileId = sahhaProfile.id || sahhaProfile.profile_id;
        if (!profileId && sahhaProfile.profileToken) {
          try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.decode(sahhaProfile.profileToken);
            profileId = decoded?.['https://api.sahha.ai/claims/profileId'] || decoded?.profileId;
          } catch (error) {
            console.warn('Could not decode profileToken to get profileId:', error.message);
          }
        }
        
        // If still no profile ID, use externalId (playerId) as identifier
        if (!profileId) {
          profileId = player._id.toString();
        }

        // Fetch initial insights (may be empty on first sync)
        let insights;
        try {
          insights = await sahhaService.syncInsights(profileId);
        } catch (error) {
          // If insights fail but profile was created, still continue with empty insights
          console.warn('⚠️ Error fetching initial insights:', error.message);
          insights = {
            Trends: [],
            Comparisons: []
          };
        }

        // Save Sahha profile ID and token to player
        player.sahhaProfileId = profileId;
        player.sahhaProfileToken = sahhaProfile.profileToken || sahhaProfile.token || sahhaProfile.profile_token;
        player.Insights = insights;
        await player.save();

      console.log(`✅ Sahha profile created automatically for player ${player._id}: ${profileId}`);
    } catch (error) {
      // Log error but don't fail player registration if Sahha profile creation fails
      console.error('⚠️ Failed to create Sahha profile automatically:', error.message);
      if (error.response) {
        console.error('   API Response:', JSON.stringify(error.response.data, null, 2));
        console.error('   Status:', error.response.status);
      }
      console.error('   Player was still registered successfully. Sahha profile can be created later.');
    }

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
        role: 'player',
        sahhaProfileId: player.sahhaProfileId || null
      }
    });
  } catch (error) {
    console.error('Error registering player:', error);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      message: error.message,
      stack: error.stack
    });
    
    // If it's a duplicate key error (MongoDB unique constraint violation)
    if (error.code === 11000) {
      // MongoDB duplicate key error - check which field caused it
      const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'unknown';
      const duplicateValue = error.keyValue ? error.keyValue[duplicateField] : 'unknown';
      console.error('Duplicate key error on field:', duplicateField);
      console.error('Duplicate key value:', duplicateValue);
      
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
    
    // Return the actual error message for debugging
    res.status(500).json({
      success: false,
      message: 'Server error while registering player',
      error: error.message,
      errorName: error.name,
      errorCode: error.code
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

