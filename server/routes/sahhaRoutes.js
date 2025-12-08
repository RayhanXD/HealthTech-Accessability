const express = require('express');
const router = express.Router();
const {
  initializeSahhaProfile,
  syncInsights,
  handleWebhook,
  getHealthScores
} = require('../controllers/sahhaController');

// @route   POST /api/sahha/sync
// @desc    Initialize Sahha profile and fetch initial insights (called after signup)
// @access  Public
// Body: { playerId, Age, Bodyweight_in_pounds, Height_in_inches, SexAtBirth }
router.post('/sync', initializeSahhaProfile);

// @route   POST /api/sahha/sync/:sahhaProfileId
// @desc    Sync insights for existing profile (manual refresh)
// @access  Public
// Query params: startDate, endDate, category (optional)
router.post('/sync/:sahhaProfileId', syncInsights);

// @route   POST /api/sahha/webhook
// @desc    Webhook endpoint for Sahha to send updates
// @access  Public (Sahha calls this)
router.post('/webhook', handleWebhook);

// @route   GET /api/sahha/scores/:sahhaProfileId
// @desc    Get health scores from Sahha
// @access  Public
router.get('/scores/:sahhaProfileId', getHealthScores);

// @route   GET /api/sahha/token/:playerId
// @route   POST /api/sahha/token
// @desc    Get Sahha user token for SDK authentication
// @access  Public (should be protected with user auth in production)
// @body    { userId } (for POST method)
router.get('/token/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    await handleTokenRequest(playerId, res);
  } catch (error) {
    console.error('Error getting user token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user token',
      error: error.message
    });
  }
});

router.post('/token', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }
    await handleTokenRequest(userId, res);
  } catch (error) {
    console.error('Error getting user token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user token',
      error: error.message
    });
  }
});

async function handleTokenRequest(userId, res) {
  const Player = require('../models/Player');
  const sahhaService = require('../services/sahhaService');
  
  // Verify player exists
  let player;
  try {
    player = await Player.findById(userId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
  } catch (error) {
    // If userId is not a valid MongoDB ID, return error
    return res.status(400).json({
      success: false,
      message: 'Invalid player ID format'
    });
  }

  // Check if player has a Sahha profile
  if (!player.sahhaProfileId) {
    return res.status(400).json({
      success: false,
      message: 'Player does not have a Sahha profile. Please complete profile setup first.',
      action: 'initialize_profile'
    });
  }

  // Check if we have a cached token
  if (player.sahhaProfileToken) {
    // Verify token is still valid (optional - you could decode and check expiry)
    return res.json({
      success: true,
      token: player.sahhaProfileToken
    });
  }

  // Create user token using Application credentials
  try {
    // The createUserToken method expects an external_id
    // When we created the profile, we used player._id.toString() as the externalId
    // So we should use the same value (player._id.toString()) for token creation
    // NOT the sahhaProfileId (which is the internal Sahha profile ID)
    const externalId = player._id.toString();
    const token = await sahhaService.createUserToken(externalId);
    
    // Save token to player
    player.sahhaProfileToken = token;
    await player.save();

    res.json({
      success: true,
      token: token
    });
  } catch (error) {
    console.error('Error creating user token:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create Sahha user token';
    if (error.message.includes('SAHHA_APPLICATION_ID') || error.message.includes('SAHHA_APPLICATION_SECRET')) {
      errorMessage = 'Sahha Application credentials not configured. Please set SAHHA_APPLICATION_ID and SAHHA_APPLICATION_SECRET in .env';
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      errorMessage = 'Sahha authentication failed. Please check your Application credentials.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Sahha user token endpoint not found. Please check your Sahha API configuration.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
}

// @route   POST /api/sahha/test
// @desc    Test endpoint for manual testing of Sahha integration
// @access  Public
// Body: { playerId }
router.post('/test', async (req, res) => {
  try {
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: 'playerId is required'
      });
    }

    const Player = require('../models/Player');
    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    if (!player.sahhaProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Player does not have a Sahha profile. Initialize it first using POST /api/sahha/sync'
      });
    }

    const sahhaService = require('../services/sahhaService');

    // Test authentication
    const token = await sahhaService.getAccountToken();
    
    // Test insights
    const insights = await sahhaService.syncInsights(player.sahhaProfileId);
    
    // Update player
    player.Insights = insights;
    await player.save();

    res.json({
      success: true,
      message: 'Test completed successfully',
      data: {
        playerId: player._id,
        sahhaProfileId: player.sahhaProfileId,
        insightsCount: {
          trends: insights.Trends?.length || 0,
          comparisons: insights.Comparisons?.length || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

module.exports = router;

