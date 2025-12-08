const Player = require('../models/Player');

// @desc    Get all players
// @route   GET /api/players
// @access  Public
const getAllPlayers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { fName: { $regex: req.query.search, $options: 'i' } },
        { Lname: { $regex: req.query.search, $options: 'i' } },
        { Username: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.sex) {
      filter.SexAtBirth = req.query.sex;
    }
    if (req.query.minAge) {
      filter.Age = { ...filter.Age, $gte: parseInt(req.query.minAge) };
    }
    if (req.query.maxAge) {
      filter.Age = { ...filter.Age, $lte: parseInt(req.query.maxAge) };
    }

    const players = await Player.find(filter)
      .select('-Password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Player.countDocuments(filter);

    res.json({
      success: true,
      data: players,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching players',
      error: error.message
    });
  }
};

// @desc    Get single player by ID
// @route   GET /api/players/:id
// @access  Public
const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).select('-Password');
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching player',
      error: error.message
    });
  }
};

// @desc    Create new player
// @route   POST /api/players
// @access  Public
const createPlayer = async (req, res) => {
  try {
    const {
      Username,
      Password,
      fName,
      Lname,
      Age,
      Bodyweight_in_pounds,
      Height_in_inches,
      SexAtBirth,
      Insights
    } = req.body;

    // Check if player already exists
    const existingPlayer = await Player.findOne({ Username });
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        message: 'Player with this username already exists'
      });
    }

    const player = new Player({
      Username,
      Password,
      fName,
      Lname,
      Age,
      Bodyweight_in_pounds,
      Height_in_inches,
      SexAtBirth,
      Insights: Insights || { Trends: [], Comparisons: [] }
    });

    await player.save();

    // Automatically create Sahha profile (demographic data is optional)
    // Profile can be created with just externalId, demographics can be added later
    try {
      const sahhaService = require('../services/sahhaService');
      const sahhaProfile = await sahhaService.createProfile({
        externalId: player._id.toString(),
        Age,
        Bodyweight_in_pounds,
        Height_in_inches,
        SexAtBirth
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
      // Log error but don't fail player creation if Sahha profile creation fails
      console.error('⚠️ Failed to create Sahha profile automatically:', error.message);
      console.error('   Player was still created successfully. Sahha profile can be created later.');
    }

    res.status(201).json({
      success: true,
      message: 'Player created successfully',
      data: player.getPublicProfile()
    });
  } catch (error) {
    console.error('Error creating player:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Player with this username already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating player',
      error: error.message
    });
  }
};

// @desc    Update player
// @route   PUT /api/players/:id
// @access  Public
const updatePlayer = async (req, res) => {
  try {
    const {
      Username,
      Password,
      fName,
      Lname,
      Age,
      Bodyweight_in_pounds,
      Height_in_inches,
      SexAtBirth,
      Insights
    } = req.body;

    // Check if username is being changed and if it already exists
    if (Username) {
      const existingPlayer = await Player.findOne({ 
        Username, 
        _id: { $ne: req.params.id } 
      });
      if (existingPlayer) {
        return res.status(400).json({
          success: false,
          message: 'Player with this username already exists'
        });
      }
    }

    const updateData = {};
    if (Username) updateData.Username = Username;
    if (Password) updateData.Password = Password;
    if (fName) updateData.fName = fName;
    if (Lname) updateData.Lname = Lname;
    if (Age) updateData.Age = Age;
    if (Bodyweight_in_pounds) updateData.Bodyweight_in_pounds = Bodyweight_in_pounds;
    if (Height_in_inches) updateData.Height_in_inches = Height_in_inches;
    if (SexAtBirth) updateData.SexAtBirth = SexAtBirth;
    if (Insights) updateData.Insights = Insights;

    const player = await Player.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-Password');

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    // If player doesn't have Sahha profile, create it (demographic data is optional)
    if (!player.sahhaProfileId) {
      try {
        const sahhaService = require('../services/sahhaService');
        const sahhaProfile = await sahhaService.createProfile({
          externalId: player._id.toString(),
          Age: player.Age,
          Bodyweight_in_pounds: player.Bodyweight_in_pounds,
          Height_in_inches: player.Height_in_inches,
          SexAtBirth: player.SexAtBirth
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
        
        if (!profileId) {
          profileId = player._id.toString();
        }

        // Fetch initial insights
        let insights;
        try {
          insights = await sahhaService.syncInsights(profileId);
        } catch (error) {
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
        console.error('⚠️ Failed to create Sahha profile automatically:', error.message);
      }
    }

    res.json({
      success: true,
      message: 'Player updated successfully',
      data: player
    });
  } catch (error) {
    console.error('Error updating player:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID format'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Player with this username already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating player',
      error: error.message
    });
  }
};

// @desc    Delete player
// @route   DELETE /api/players/:id
// @access  Public
const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.json({
      success: true,
      message: 'Player deleted successfully',
      data: { id: player._id, username: player.Username }
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting player',
      error: error.message
    });
  }
};

// @desc    Update player insights
// @route   PUT /api/players/:id/insights
// @access  Public
const updatePlayerInsights = async (req, res) => {
  try {
    const { Trends, Comparisons } = req.body;

    const updateData = {};
    if (Trends !== undefined) updateData['Insights.Trends'] = Trends;
    if (Comparisons !== undefined) updateData['Insights.Comparisons'] = Comparisons;

    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-Password');

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.json({
      success: true,
      message: 'Player insights updated successfully',
      data: player
    });
  } catch (error) {
    console.error('Error updating player insights:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating player insights',
      error: error.message
    });
  }
};

// @desc    Add trend to player
// @route   POST /api/players/:id/trends
// @access  Public
const addTrendToPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    player.Insights.Trends.push(req.body);
    await player.save();

    res.json({
      success: true,
      message: 'Trend added successfully',
      data: player.getPublicProfile()
    });
  } catch (error) {
    console.error('Error adding trend:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while adding trend',
      error: error.message
    });
  }
};

// @desc    Add comparison to player
// @route   POST /api/players/:id/comparisons
// @access  Public
const addComparisonToPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    player.Insights.Comparisons.push(req.body);
    await player.save();

    res.json({
      success: true,
      message: 'Comparison added successfully',
      data: player.getPublicProfile()
    });
  } catch (error) {
    console.error('Error adding comparison:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while adding comparison',
      error: error.message
    });
  }
};

module.exports = {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  updatePlayerInsights,
  addTrendToPlayer,
  addComparisonToPlayer
};
