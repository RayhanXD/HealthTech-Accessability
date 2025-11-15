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
  getTrainerPlayers
};
