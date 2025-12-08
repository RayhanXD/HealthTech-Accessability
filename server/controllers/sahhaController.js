const sahhaService = require('../services/sahhaService');

// @desc    Initialize Sahha profile and fetch initial insights
// @route   POST /api/sahha/sync
// @access  Public
// Body: { playerId, Age, Bodyweight_in_pounds, Height_in_inches, SexAtBirth }
const initializeSahhaProfile = async (req, res) => {
  try {
    const { playerId, Age, Bodyweight_in_pounds, Height_in_inches, SexAtBirth } = req.body;

    // Validate required fields
    if (!playerId || !Age || !Bodyweight_in_pounds || !Height_in_inches || !SexAtBirth) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: playerId, Age, Bodyweight_in_pounds, Height_in_inches, SexAtBirth'
      });
    }

    // Find player in database
    const Player = require('../models/Player');
    const player = await Player.findById(playerId);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    // Check if profile already exists
    if (player.sahhaProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Player already has a Sahha profile',
        data: {
          sahhaProfileId: player.sahhaProfileId
        }
      });
    }

    // Create Sahha profile
    let sahhaProfile;
    try {
      sahhaProfile = await sahhaService.createProfile({
        externalId: playerId,
        Age,
        Bodyweight_in_pounds,
        Height_in_inches,
        SexAtBirth
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create Sahha profile',
        error: error.message
      });
    }

    // Extract profile ID from JWT token (profileToken contains the profileId in its claims)
    let profileId = sahhaProfile.id || sahhaProfile.profile_id;
    
    // If no profile ID in response, decode it from the profileToken JWT
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
      profileId = playerId;
    }

    // Fetch initial insights (may be empty on first sync)
    let insights;
    try {
      insights = await sahhaService.syncInsights(profileId);
    } catch (error) {
      // If insights fail but profile was created, still return success with empty insights
      console.error('⚠️ Error fetching initial insights:', error);
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

    res.status(201).json({
      success: true,
      message: 'Sahha profile initialized successfully',
      data: {
        sahhaProfileId: profileId,
        sahhaProfileToken: sahhaProfile.profileToken || sahhaProfile.token || sahhaProfile.profile_token,
        Insights: insights
      }
    });
  } catch (error) {
    console.error('❌ Error initializing Sahha profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize Sahha profile',
      error: error.message
    });
  }
};

// @desc    Sync insights for existing Sahha profile
// @route   POST /api/sahha/sync/:sahhaProfileId
// @access  Public
const syncInsights = async (req, res) => {
  try {
    const { sahhaProfileId } = req.params;
    const { startDate, endDate, category } = req.query;

    if (!sahhaProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Sahha profile ID is required'
      });
    }

    // Fetch insights from Sahha
    const insights = await sahhaService.syncInsights(sahhaProfileId, {
      startDate,
      endDate,
      category
    });

    // Return data in your schema format for frontend to save
    res.json({
      success: true,
      message: 'Insights synced successfully',
      data: {
        sahhaProfileId,
        Insights: insights
      }
    });
  } catch (error) {
    console.error('Error syncing insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync insights',
      error: error.message
    });
  }
};

// @desc    Webhook handler for Sahha updates
// @route   POST /api/sahha/webhook
// @access  Public (Sahha will call this)
const handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature if Sahha provides it
    const signature = req.headers['x-sahha-signature'] || req.headers['authorization'];
    const webhookSecret = process.env.SAHHA_WEBHOOK_SECRET;

    // Log webhook received
    console.log('📥 Webhook received from Sahha:', {
      event: req.body.event || req.body.type,
      profileId: req.body.profile_id || req.body.profileId,
      timestamp: new Date().toISOString()
    });

    // Extract profile ID from webhook payload
    const profileId = req.body.profile_id || req.body.profileId || req.body.data?.profile_id;
    
    if (!profileId) {
      console.error('❌ Webhook missing profile ID');
      return res.status(400).json({
        success: false,
        message: 'Missing profile ID in webhook payload'
      });
    }

    // Fetch updated insights from Sahha
    const insights = await sahhaService.syncInsights(profileId);

    // Find and update player in database
    const Player = require('../models/Player');
    const player = await Player.findOne({ sahhaProfileId: profileId });

    if (player) {
      // Update player insights
      player.Insights = insights;
      await player.save();
      console.log(`✅ Updated insights for player: ${player._id}`);
    } else {
      console.warn(`⚠️ No player found with sahhaProfileId: ${profileId}`);
    }

    // Always return 200 to acknowledge receipt (prevents Sahha retries)
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: {
        sahhaProfileId: profileId,
        playerUpdated: !!player,
        webhookEvent: req.body.event || req.body.type,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    // Always return 200 to prevent Sahha from retrying
    res.status(200).json({
      success: false,
      message: 'Webhook received but processing failed',
      error: error.message
    });
  }
};

// @desc    Get health scores from Sahha
// @route   GET /api/sahha/scores/:sahhaProfileId
// @access  Public
// Query params: types (comma-separated: wellbeing,activity,readiness,mental_wellbeing), startDateTime, endDateTime
const getHealthScores = async (req, res) => {
  try {
    const { sahhaProfileId } = req.params;
    const { types, startDateTime, endDateTime } = req.query;

    if (!sahhaProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Sahha profile ID is required'
      });
    }

    const token = await sahhaService.getAccountToken();
    const axios = require('axios');
    const dataBaseURL = process.env.SAHHA_API_BASE_URL || 'https://sandbox-api.sahha.ai';
    
    // Build query parameters
    const scoreTypes = types || 'wellbeing,activity,readiness,mental_wellbeing';
    
    // Default to last 7 days if no dates provided
    let startDate = startDateTime;
    let endDate = endDateTime;
    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      startDate = startDate || start.toISOString();
      endDate = endDate || end.toISOString();
    }
    
    // Use the correct endpoint format: /api/v1/profile/score/{profileId} with query params
    const url = `${dataBaseURL}/api/v1/profile/score/${sahhaProfileId}?types=${encodeURIComponent(scoreTypes)}&startDateTime=${encodeURIComponent(startDate)}&endDateTime=${encodeURIComponent(endDate)}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `account ${token}`
      }
    });

    res.json({
      success: true,
      data: response.data?.data || response.data || []
    });
  } catch (error) {
    console.error('Error getting health scores:', error);
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters',
        error: error.response.data?.errors?.[0]?.errors?.[0] || error.message
      });
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or scores endpoint not available',
        error: error.response.data?.message || error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to get health scores',
      error: error.response?.data?.message || error.message
    });
  }
};

module.exports = {
  initializeSahhaProfile,
  syncInsights,
  handleWebhook,
  getHealthScores
};

