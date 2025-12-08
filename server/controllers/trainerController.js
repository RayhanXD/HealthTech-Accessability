const Trainer = require('../models/Trainer');
const Player = require('../models/Player');

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Public
const getAllTrainers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { fName: { $regex: req.query.search, $options: 'i' } },
        { lname: { $regex: req.query.search, $options: 'i' } },
        { User: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const trainers = await Trainer.find(filter)
      .select('-Password')
      .populate('Players', 'Username fName Lname Age SexAtBirth')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Trainer.countDocuments(filter);

    res.json({
      success: true,
      data: trainers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trainers',
      error: error.message
    });
  }
};

// @desc    Get single trainer by ID
// @route   GET /api/trainers/:id
// @access  Public
const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .select('-Password')
      .populate('Players', 'Username fName Lname Age SexAtBirth Bodyweight_in_pounds Height_in_inches');
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    res.json({
      success: true,
      data: trainer
    });
  } catch (error) {
    console.error('Error fetching trainer:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trainer ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trainer',
      error: error.message
    });
  }
};

// @desc    Create new trainer
// @route   POST /api/trainers
// @access  Public
const createTrainer = async (req, res) => {
  try {
    const { User, Password, fName, lname, Players } = req.body;

    // Check if trainer already exists
    const existingTrainer = await Trainer.findOne({ User });
    if (existingTrainer) {
      return res.status(400).json({
        success: false,
        message: 'Trainer with this username already exists'
      });
    }

    // Validate player IDs if provided
    if (Players && Players.length > 0) {
      const validPlayers = await Player.find({ _id: { $in: Players } });
      if (validPlayers.length !== Players.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more player IDs are invalid'
        });
      }
    }

    const trainer = new Trainer({
      User,
      Password,
      fName,
      lname,
      Players: Players || []
    });

    await trainer.save();

    // Populate players for response
    await trainer.populate('Players', 'Username fName Lname Age SexAtBirth');

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      data: trainer.getPublicProfile()
    });
  } catch (error) {
    console.error('Error creating trainer:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Trainer with this username already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating trainer',
      error: error.message
    });
  }
};

// @desc    Update trainer
// @route   PUT /api/trainers/:id
// @access  Public
const updateTrainer = async (req, res) => {
  try {
    const { User, Password, fName, lname, Players } = req.body;

    // Check if username is being changed and if it already exists
    if (User) {
      const existingTrainer = await Trainer.findOne({ 
        User, 
        _id: { $ne: req.params.id } 
      });
      if (existingTrainer) {
        return res.status(400).json({
          success: false,
          message: 'Trainer with this username already exists'
        });
      }
    }

    // Validate player IDs if provided
    if (Players && Players.length > 0) {
      const validPlayers = await Player.find({ _id: { $in: Players } });
      if (validPlayers.length !== Players.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more player IDs are invalid'
        });
      }
    }

    const updateData = {};
    if (User) updateData.User = User;
    if (Password) updateData.Password = Password;
    if (fName) updateData.fName = fName;
    if (lname) updateData.lname = lname;
    if (Players !== undefined) updateData.Players = Players;

    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .select('-Password')
    .populate('Players', 'Username fName Lname Age SexAtBirth');

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    res.json({
      success: true,
      message: 'Trainer updated successfully',
      data: trainer
    });
  } catch (error) {
    console.error('Error updating trainer:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trainer ID format'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Trainer with this username already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating trainer',
      error: error.message
    });
  }
};

// @desc    Delete trainer
// @route   DELETE /api/trainers/:id
// @access  Public
const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    res.json({
      success: true,
      message: 'Trainer deleted successfully',
      data: { id: trainer._id, username: trainer.User }
    });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trainer ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting trainer',
      error: error.message
    });
  }
};

// @desc    Add player to trainer
// @route   POST /api/trainers/:id/players
// @access  Public
const addPlayerToTrainer = async (req, res) => {
  try {
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: 'Player ID is required'
      });
    }

    // Check if player exists
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Check if player is already assigned to this trainer
    if (trainer.Players.includes(playerId)) {
      return res.status(400).json({
        success: false,
        message: 'Player is already assigned to this trainer'
      });
    }

    await trainer.addPlayer(playerId);

    // Populate players for response
    await trainer.populate('Players', 'Username fName Lname Age SexAtBirth');

    res.json({
      success: true,
      message: 'Player added to trainer successfully',
      data: trainer.getPublicProfile()
    });
  } catch (error) {
    console.error('Error adding player to trainer:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while adding player to trainer',
      error: error.message
    });
  }
};

// @desc    Remove player from trainer
// @route   DELETE /api/trainers/:id/players/:playerId
// @access  Public
const removePlayerFromTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Check if player is assigned to this trainer
    if (!trainer.Players.includes(req.params.playerId)) {
      return res.status(400).json({
        success: false,
        message: 'Player is not assigned to this trainer'
      });
    }

    await trainer.removePlayer(req.params.playerId);

    // Populate players for response
    await trainer.populate('Players', 'Username fName Lname Age SexAtBirth');

    res.json({
      success: true,
      message: 'Player removed from trainer successfully',
      data: trainer.getPublicProfile()
    });
  } catch (error) {
    console.error('Error removing player from trainer:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while removing player from trainer',
      error: error.message
    });
  }
};

// @desc    Get trainer's players with health data
// @route   GET /api/trainers/:id/players/health
// @access  Public
const getTrainerPlayersWithHealth = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .select('-Password')
      .populate('Players', 'Username fName Lname Age SexAtBirth sahhaProfileId Insights updatedAt');
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    if (!trainer.Players || trainer.Players.length === 0) {
      return res.json({
        success: true,
        data: {
          players: [],
          teamStatistics: {
            totalAthletes: 0,
            avgPerformance: 0,
            atRiskCount: 0,
            teamAverage: 0,
            previousAverage: null,
            averageChange: 0,
            barChartData: [],
            statusDistribution: {
              healthy: 0,
              injured: 0,
              suspended: 0,
            },
          },
        },
      });
    }

    const healthDataTransformService = require('../services/healthDataTransformService');
    const sahhaService = require('../services/sahhaService');

    // Process players in parallel (but limit concurrent Sahha API calls)
    const playerHealthDataPromises = trainer.Players.map(async (player) => {
      try {
        // Get existing insights (don't sync every time for performance)
        let insights = player.Insights || { Trends: [], Comparisons: [] };
        
        // Only sync if data is stale (older than 5 minutes) or missing
        const shouldSync = !player.Insights || 
          !player.updatedAt || 
          (Date.now() - new Date(player.updatedAt).getTime() > 5 * 60 * 1000);

        if (shouldSync && player.sahhaProfileId) {
          try {
            const syncedInsights = await sahhaService.syncInsights(player.sahhaProfileId);
            if (syncedInsights) {
              player.Insights = syncedInsights;
              player.updatedAt = new Date();
              await player.save();
              insights = syncedInsights;
            }
          } catch (error) {
            console.warn(`⚠️ Could not sync Sahha insights for player ${player._id}:`, error.message);
            // Continue with existing insights
          }
        }

        // Transform insights to health data
        const healthData = healthDataTransformService.transformToHealthData(insights);
        
        // Transform player for coach dashboard
        return healthDataTransformService.transformPlayerForCoachDashboard(player, healthData);
      } catch (error) {
        console.error(`Error processing player ${player._id}:`, error);
        // Return default data for this player
        return healthDataTransformService.transformPlayerForCoachDashboard(player, {
          healthScore: 0,
          healthStatus: 'caution',
          lastUpdated: 'Never',
          healthMetrics: {},
        });
      }
    });

    // Wait for all players to be processed
    const playersWithHealth = await Promise.all(playerHealthDataPromises);

    // Calculate team statistics
    const teamStatistics = healthDataTransformService.calculateTeamStatistics(playersWithHealth);

    res.json({
      success: true,
      data: {
        players: playersWithHealth,
        teamStatistics,
      },
    });
  } catch (error) {
    console.error('Error fetching trainer players with health data:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trainer ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching players with health data',
      error: error.message
    });
  }
};

// @desc    Find trainer by email
// @route   GET /api/trainers/email/:email
// @access  Public
const getTrainerByEmail = async (req, res) => {
  try {
    // Decode URL-encoded email and normalize
    let email = decodeURIComponent(req.params.email).trim().toLowerCase();
    
    // Remove any extra whitespace or special characters
    email = email.replace(/\s+/g, '').toLowerCase();
    
    console.log('🔍 Looking for trainer with email:', email);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Try exact match first
    let trainer = await Trainer.findOne({ Email: email })
      .select('-Password');

    // If not found, try case-insensitive regex search (in case of any encoding issues)
    if (!trainer) {
      console.log('⚠️ Exact match not found, trying case-insensitive search...');
      trainer = await Trainer.findOne({ 
        Email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).select('-Password');
    }
    
    // If still not found, try without the @ symbol encoding issues
    if (!trainer) {
      console.log('⚠️ Still not found, trying alternative search...');
      // Sometimes @ gets encoded as %40, try both
      const emailVariations = [
        email,
        email.replace('%40', '@'),
        email.replace('@', '%40'),
        email.replace(/\+/g, ' '), // Handle + encoding
      ];
      
      for (const emailVar of emailVariations) {
        trainer = await Trainer.findOne({ 
          Email: { $regex: new RegExp(`^${emailVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        }).select('-Password');
        if (trainer) {
          console.log('✅ Found with variation:', emailVar);
          break;
        }
      }
    }

    if (!trainer) {
      console.log('❌ Trainer not found with email:', email);
      // List all trainer emails for debugging
      const allTrainers = await Trainer.find({}).select('Email');
      console.log('📋 Available trainer emails:', allTrainers.map(t => t.Email).join(', '));
      
      return res.status(404).json({
        success: false,
        message: 'No coach found with this email. Please check the email and try again.'
      });
    }

    console.log('✅ Trainer found:', trainer.Email);

    res.json({
      success: true,
      data: {
        id: trainer._id,
        email: trainer.Email,
        firstName: trainer.fName,
        lastName: trainer.lname
      }
    });
  } catch (error) {
    console.error('Error finding trainer by email:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while finding trainer',
      error: error.message
    });
  }
};

// @desc    Add player to trainer by email
// @route   POST /api/trainers/email/:email/players
// @access  Public
// Body: { playerId: "player_id_here" }
const addPlayerToTrainerByEmail = async (req, res) => {
  try {
    const { playerId } = req.body;
    // Decode URL-encoded email and normalize
    let email = decodeURIComponent(req.params.email).trim().toLowerCase();
    email = email.replace(/\s+/g, '').toLowerCase();

    console.log('🔍 Adding player to trainer with email:', email);
    console.log('   Player ID:', playerId);

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: 'Player ID is required'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Coach email is required'
      });
    }

    // Find trainer by email - use case-insensitive search since Email field has lowercase: true
    // But also try exact match first
    let trainer = await Trainer.findOne({ Email: email });
    
    // If not found, try case-insensitive regex search (in case email wasn't lowercased on save)
    if (!trainer) {
      console.log('⚠️ Exact match not found, trying case-insensitive search...');
      trainer = await Trainer.findOne({ 
        Email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }
    
    // If still not found, try without the @ symbol encoding issues
    if (!trainer) {
      console.log('⚠️ Still not found, trying alternative search...');
      // Sometimes @ gets encoded as %40, try both
      const emailVariations = [
        email,
        email.replace('%40', '@'),
        email.replace('@', '%40'),
        email.replace(/\+/g, ' '), // Handle + encoding
      ];
      
      for (const emailVar of emailVariations) {
        trainer = await Trainer.findOne({ 
          Email: { $regex: new RegExp(`^${emailVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
        if (trainer) {
          console.log('✅ Found with variation:', emailVar);
          break;
        }
      }
    }

    if (!trainer) {
      console.log('❌ Trainer not found with email:', email);
      // List all trainer emails for debugging
      const allTrainers = await Trainer.find({}).select('Email');
      console.log('📋 Available trainer emails:', allTrainers.map(t => t.Email).join(', '));
      
      return res.status(404).json({
        success: false,
        message: 'No coach found with this email. Please check the email and try again.'
      });
    }

    console.log('✅ Trainer found:', trainer.Email);

    // Check if player exists
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    // Check if player is already assigned to this trainer
    if (trainer.Players.includes(playerId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already assigned to this coach'
      });
    }

    // Add player to trainer
    await trainer.addPlayer(playerId);

    // Populate players for response
    await trainer.populate('Players', 'Username fName Lname Age SexAtBirth');

    res.json({
      success: true,
      message: 'Successfully added to coach',
      data: {
        trainerId: trainer._id,
        trainerName: `${trainer.fName} ${trainer.lname}`,
        trainerEmail: trainer.Email
      }
    });
  } catch (error) {
    console.error('Error adding player to trainer by email:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while adding player to trainer',
      error: error.message
    });
  }
};

// @desc    Get trainer's players
// @route   GET /api/trainers/:id/players
// @access  Public
const getTrainerPlayers = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .select('Players')
      .populate('Players', 'Username fName Lname Age SexAtBirth Bodyweight_in_pounds Height_in_inches');

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    res.json({
      success: true,
      data: trainer.Players
    });
  } catch (error) {
    console.error('Error fetching trainer players:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trainer ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trainer players',
      error: error.message
    });
  }
};

module.exports = {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  addPlayerToTrainer,
  removePlayerFromTrainer,
  getTrainerPlayers,
  getTrainerPlayersWithHealth,
  getTrainerByEmail,
  addPlayerToTrainerByEmail
};
