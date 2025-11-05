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
  addComparisonToPlayer
} = require('../controllers/playerController');
const { playerValidation, trendValidation, comparisonValidation } = require('../middleware/validation');

// @route   GET /api/players
// @desc    Get all players with optional filtering and pagination
// @access  Public
// Query parameters: page, limit, search, sex, minAge, maxAge
router.get('/', getAllPlayers);

// @route   GET /api/players/:id
// @desc    Get single player by ID
// @access  Public
router.get('/:id', getPlayerById);

// @route   POST /api/players
// @desc    Create new player
// @access  Public
router.post('/', playerValidation.create, createPlayer);

// @route   PUT /api/players/:id
// @desc    Update player
// @access  Public
router.put('/:id', playerValidation.update, updatePlayer);

// @route   DELETE /api/players/:id
// @desc    Delete player
// @access  Public
router.delete('/:id', deletePlayer);

// @route   PUT /api/players/:id/insights
// @desc    Update player insights (trends and comparisons)
// @access  Public
router.put('/:id/insights', updatePlayerInsights);

// @route   POST /api/players/:id/trends
// @desc    Add trend to player
// @access  Public
router.post('/:id/trends', trendValidation, addTrendToPlayer);

// @route   POST /api/players/:id/comparisons
// @desc    Add comparison to player
// @access  Public
router.post('/:id/comparisons', comparisonValidation, addComparisonToPlayer);

module.exports = router;
