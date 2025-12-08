const express = require('express');
const router = express.Router();
const {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  updatePlayerInsights,
  addTrendToPlayer,
  addComparisonToPlayer,
  getPlayerHealthData,
  syncPlayerHealthData
} = require('../controllers/playerController');

// @route   GET /api/players
// @desc    Get all players with optional filtering and pagination
// @access  Public
// Query parameters: page, limit, search, sex, minAge, maxAge
router.get('/', getAllPlayers);

// @route   POST /api/players
// @desc    Create new player
// @access  Public
router.post('/', createPlayer);

// IMPORTANT: More specific routes must be defined BEFORE generic :id routes
// Otherwise Express will match /:id first and never reach these routes

// @route   GET /api/players/:id/health
// @desc    Get player health data (transformed for dashboard)
// @access  Public
router.get('/:id/health', getPlayerHealthData);

// @route   POST /api/players/:id/sync
// @desc    Sync player health data from Sahha
// @access  Public
router.post('/:id/sync', syncPlayerHealthData);

// @route   PUT /api/players/:id/insights
// @desc    Update player insights (trends and comparisons)
// @access  Public
router.put('/:id/insights', updatePlayerInsights);

// @route   POST /api/players/:id/trends
// @desc    Add trend to player
// @access  Public
router.post('/:id/trends', addTrendToPlayer);

// @route   POST /api/players/:id/comparisons
// @desc    Add comparison to player
// @access  Public
router.post('/:id/comparisons', addComparisonToPlayer);

// @route   GET /api/players/:id
// @desc    Get single player by ID
// @access  Public
router.get('/:id', getPlayerById);

// @route   PUT /api/players/:id
// @desc    Update player
// @access  Public
router.put('/:id', updatePlayer);

// @route   DELETE /api/players/:id
// @desc    Delete player
// @access  Public
router.delete('/:id', deletePlayer);

module.exports = router;
